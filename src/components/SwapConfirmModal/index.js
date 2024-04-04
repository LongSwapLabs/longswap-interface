import { Button, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import useTokenSymbol from "../../hooks/useTokenSymbol";
import { TokenLogo } from "../TokenLogo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { encodeFunctionData, formatUnits } from "viem";
import { formatAmount } from "../../utils/amount";
import { FiAlertOctagon, FiArrowDown } from "react-icons/fi";
import Decimal from "decimal.js";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import useApp from "../../hooks/useApp";
import LongSwapAbi from '../../assets/abis/LongSwap.json'
import { ETHER } from "../../constants/types";
import { toBigInt } from "ethers";
import { SWAP_ROUTER } from "../../constants";
import { computePriceImpact } from "../../utils/trade";
import useAccountAddress from "../../hooks/useAccountAddress";
import { shortAddress } from "../../utils/address";
import dayjs from "dayjs";
import { SWAP_MODES, SWAP_MODES_ENUM } from "../../constants/trade";
import ERC314Abi from "../../assets/abis/ERC314.json";
import { useTranslation } from "react-i18next";

function SwapConfirmModal({
                            swapMode,
                            router,
                            inputCurrency,
                            outputCurrency,
                            path,
                            fixAmounts,
                            isOpen,
                            onOpenChange,
                            onSubmit,
                            networkFee,
                            gasLimit,
                            gasPrice,
                            outputReserve,
                          }) {
  const [amounts, setAmounts] = useState(fixAmounts)
  const {account, customWallet} = useApp()
  const address = useAccountAddress()
  const [loading, setLoading] = useState(false)
  const {writeContractAsync} = useWriteContract()
  const {sendTransactionAsync} = useSendTransaction()
  const tokenInSymbol = useTokenSymbol(inputCurrency)
  const tokenOutSymbol = useTokenSymbol(outputCurrency)
  const {t} = useTranslation()

  const {chain} = useAccount()

  const {taxRate, slippageRate} = useApp()

  useEffect(() => {
    setAmounts(fixAmounts)
  }, [fixAmounts]);

  const amountOutMin = useMemo(() => {
    if (amounts.length >= 2) {
      const outAmount = new Decimal(formatUnits(amounts[amounts.length - 1], outputCurrency.decimals))
      return outAmount.sub(outAmount.mul(slippageRate).div(1000))
    }
    return 0
  }, [slippageRate, amounts, outputCurrency])

  const taxFee = useMemo(() => {
    if (amounts.length >= 2) {
      const outAmount = new Decimal(formatUnits(amounts[amounts.length - 1], outputCurrency.decimals))
      return outAmount.mul(taxRate).div(1000)
    }
    return 0
  }, [taxRate, amounts, outputCurrency])

  const amountIn = useMemo(() => {
    return formatUnits(amounts[0], inputCurrency.decimals)
  }, [amounts, inputCurrency])

  const amountOut = useMemo(() => {
    return formatUnits(amounts[amounts.length - 1], outputCurrency.decimals)
  }, [amounts, outputCurrency])

  const priceImpact = useMemo(() => {
    if (amounts.length >= 2 && outputReserve) {
      return computePriceImpact(amounts[amounts.length - 1], outputReserve)
    }
    return 0
  }, [amounts, outputReserve])

  const handleSwap = useCallback(async () => {
    setLoading(true)
    try {
      if (priceImpact >= 15) {
        const confirm = window.prompt(t("impact_current"))
        if (confirm !== 'ok') {
          return
        }
      }

      let hash

      if (swapMode === SWAP_MODES.V2) {
        const amountOutMin = amounts[amounts.length - 1] * toBigInt(slippageRate) / 1000n;
        const deadline = dayjs().add(12, 'minute').unix()

        const parameters = {
          account,
          abi: LongSwapAbi,
          address: SWAP_ROUTER,
          gasPrice: gasPrice,
          gas: gasLimit,
        }

        if (inputCurrency === ETHER) {
          hash = await writeContractAsync({
            ...parameters,
            functionName: 'safeSwapETHForToken',
            args: [
              router,
              path,
              amountOutMin,
              taxRate,
              address,
              deadline
            ],
            value: amounts[0],
          })
        } else if (outputCurrency === ETHER) {
          hash = await writeContractAsync({
            ...parameters,
            functionName: 'safeSwapTokenForETH',
            args: [
              router,
              path,
              amounts[0],
              amountOutMin,
              taxRate,
              address,
              deadline,
            ]
          })
        } else {
          hash = await writeContractAsync({
            ...parameters,
            functionName: 'safeSwap',
            args: [
              router,
              path,
              amounts[0],
              amountOutMin,
              taxRate,
              address,
              deadline
            ]
          })
        }
      } else if (swapMode === SWAP_MODES.ERC314) {
        if (inputCurrency === ETHER) {
          // 买
          hash = await sendTransactionAsync({
            account,
            gasPrice: gasPrice,
            gas: gasLimit,
            to: path[1],
            value: amounts[0]
          })
        } else {
          // 卖
          hash = await sendTransactionAsync({
            account,
            gasPrice: gasPrice,
            gas: gasLimit,
            to: path[0],
            data: encodeFunctionData({
              abi: ERC314Abi,
              functionName: 'transfer',
              args: [
                path[0],
                amounts[0]
              ]
            })
          })
        }
      }

      onSubmit(hash)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }, [swapMode, priceImpact, writeContractAsync, sendTransactionAsync, account, inputCurrency, outputCurrency, path, amounts, onSubmit, slippageRate, address, taxRate, router, gasPrice, gasLimit, t])

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className={'pb-2 font-medium'}>
          {t("exchange")}
        </ModalHeader>
        <Divider/>
        <ModalBody>
          <div className={'flex flex-col gap-2 my-4 p-2 border-1 rounded-xl bg-slate-50'}>
            <div className={'flex items-center justify-between'}>
              <div className={'w-full flex items-center gap-2 text-lg'}>
                <div className={'w-8 h-8 rounded-full bg-zinc-300'}>
                  <TokenLogo width={32} height={32} token={inputCurrency}/>
                </div>
                <span>{tokenInSymbol}</span>
              </div>
              <div className={'w-full flex items-center justify-end gap-2 text-lg'}>
                {formatAmount(amountIn)}
              </div>
            </div>

            <div className={'flex justify-center'}>
              <FiArrowDown size={18}/>
            </div>

            <div className={'flex items-center justify-between'}>
              <div className={'w-full flex items-center gap-2 text-lg'}>
                <div className={'w-8 h-8 rounded-full bg-zinc-200'}>
                  <TokenLogo width={32} height={32} token={outputCurrency}/>
                </div>
                <span>{tokenOutSymbol}</span>
              </div>
              <div className={'w-full flex items-center justify-end gap-2 text-lg'}>
                {formatAmount(amountOut)}
              </div>
            </div>
          </div>

          <div className={'flex flex-col gap-2 text-sm'}>
            {
              customWallet && (
                <div className={'flex justify-between'}>
                  <div className="text-slate-500">
                    {t("sub_wallet")}
                  </div>
                  <div className={'flex gap-2 items-center'}>
                    {shortAddress(address)}
                    <Chip size={'sm'} color={'warning'} className={'h-fit'}>
                      {customWallet.name}
                    </Chip>
                  </div>
                </div>
              )
            }

            <div className={'flex justify-between'}>
              <div className="text-slate-500">
                {t("router")}
              </div>
              <div>
                {SWAP_MODES_ENUM[swapMode]}
              </div>
            </div>

            <div className={'flex justify-between'}>
              <div className="text-slate-500">
                {t("fees")}
              </div>
              <div>
                {networkFee ? formatUnits(networkFee, 18) : '~'} {chain && chain.nativeCurrency.symbol}
              </div>
            </div>

            {
              swapMode !== SWAP_MODES.ERC314 ? (
                <>
                  <div className={'flex justify-between'}>
                    <div className="text-slate-500">
                      {t("Slippage")}
                    </div>
                    <div>
                      {new Decimal(slippageRate).div(1000).mul(100).toString()}%
                    </div>
                  </div>

                  <div className={'flex justify-between'}>
                    <div className="text-slate-500">
                      {t("received")}
                    </div>
                    <div>
                      {formatAmount(amountOutMin)} {tokenOutSymbol}
                    </div>
                  </div>

                  <div className={'flex justify-between'}>
                    <div className="text-slate-500">
                      {t("rate")}
                    </div>
                    <div>{new Decimal(taxRate).div(1000).mul(100).toString()}%</div>
                  </div>

                  <div className={'flex justify-between'}>
                    <div className="text-slate-500">
                      {t("taxes")}
                    </div>
                    <div>{formatAmount(taxFee)} {tokenOutSymbol}</div>
                  </div>

                  {
                    (amountOutMin && taxFee) ? (
                      <div className={'flex justify-between'}>
                        <div className="text-slate-500">
                          税后最低收到
                        </div>
                        <div>
                          {formatAmount(amountOutMin.sub(taxFee))} {tokenOutSymbol}
                        </div>
                      </div>
                    ) : null
                  }
                </>
              ) : null
            }

            <div className={'flex justify-between'}>
              <div className="text-slate-500">
                {t("price_impact")}
              </div>
              <div
                className={`flex items-center gap-1 ${priceImpact >= 15 ? 'text-danger font-semibold' : 'text-foreground'}`}>
                {priceImpact >= 15 && <FiAlertOctagon/>}
                {new Decimal(priceImpact).toFixed(2)}%
              </div>
            </div>
          </div>
        </ModalBody>
        <Divider/>
        <ModalFooter className={'flex-col justify-center'}>
          <Button size={'lg'}
                  isLoading={loading}
                  onClick={handleSwap}
                  className={'w-full'}
                  color={"success"}
                  variant={'flat'}>
            {t("comfirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SwapConfirmModal