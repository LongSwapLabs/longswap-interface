import {
  Button,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@nextui-org/react";
import useTokenSymbol from "../../hooks/useTokenSymbol";
import { TokenLogo } from "../TokenLogo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatGwei, formatUnits } from "viem";
import { formatAmount } from "../../utils/amount";
import { FiAlertOctagon, FiArrowDown } from "react-icons/fi";
import Decimal from "decimal.js";
import { useAccount, useSignMessage } from "wagmi";
import useApp from "../../hooks/useApp";
import { computePriceImpact, wrappedCurrency } from "../../utils/trade";
import { createOrder } from "../../services/order";
import { ETHER } from "../../constants/types";
import useAllowance from "../../hooks/useAllowance";
import { SWAP_ROUTER } from "../../constants";
import toast from "react-hot-toast";
import { shortAddress } from "../../utils/address";
import useAccountAddress from "../../hooks/useAccountAddress";
import dayjs from "dayjs";
import { IoCloseCircleSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";

function SniperConfirmModal({
                              router,
                              inputCurrency,
                              outputCurrency,
                              path,
                              fixAmounts,
                              isOpen,
                              onOpenChange,
                              onSubmit,
                              networkFee,
                              gasPrice,
                              outputReserve,
                            }) {
  const [amounts, setAmounts] = useState(fixAmounts)
  const [loading, setLoading] = useState(false)
  const tokenInSymbol = useTokenSymbol(inputCurrency)
  const tokenOutSymbol = useTokenSymbol(outputCurrency)
  const {chain, address: user} = useAccount()
  const {taxRate, taxSellRate, slippageRate, customWallet} = useApp()
  const address = useAccountAddress()
  const [pendingAt, setPendingAt] = useState('')
  const {signMessageAsync} = useSignMessage()
  const {t} = useTranslation()

  const {
    value: outputTokenAllowance,
    approve: outputTokenApprove,
    loading: outputTokenApproving
  } = useAllowance(outputCurrency, SWAP_ROUTER)

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

  const handleCreate = useCallback(async () => {
    setLoading(true)
    try {
      if (priceImpact >= 15) {
        const confirm = window.prompt(t("impact_current"))
        if (confirm !== 'ok') {
          return
        }
      }

      const timestamp = parseInt(Date.now() / 1000)
      const message = `Create Order
User: ${user}
Timestamp: ${timestamp}`

      const sig = await signMessageAsync({
        message,
      })

      const fromToken = wrappedCurrency(inputCurrency, chain.id)
      const toToken = wrappedCurrency(outputCurrency, chain.id)

      const rsp = await createOrder({
        user,
        timestamp,
        sig,
        chainId: chain.id,
        router,
        accountPk: customWallet.privateKey,
        token: toToken.address,
        tokenDecimals: toToken.decimals,
        tokenSymbol: toToken.symbol,
        fromToken: fromToken.address,
        fromTokenSymbol: inputCurrency === ETHER ? chain.nativeCurrency.symbol : fromToken.symbol,
        fromTokenDecimals: fromToken.decimals,
        fromTokenIsNative: inputCurrency === ETHER,
        path: path,
        amountIn: formatUnits(amounts[0], fromToken.decimals),
        amountOut: formatUnits(amounts[amounts.length - 1], toToken.decimals),
        slippage: new Decimal(slippageRate.toString()).div(1000).mul(100).toFixed(2),
        buyTax: new Decimal(taxRate.toString()).div(1000).mul(100).toFixed(2),
        sellTax: new Decimal(taxSellRate.toString()).div(1000).mul(100).toFixed(2),
        gasPrice: formatGwei(gasPrice),
        pendingAt: !pendingAt ? null : dayjs(pendingAt).toISOString(),
      })

      if (rsp.data.code === 0) {
        onSubmit()
      } else {
        toast.error(rsp.data.message)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }, [priceImpact, chain, user, signMessageAsync, router, path, amounts, gasPrice, inputCurrency, outputCurrency, slippageRate, taxRate, taxSellRate, onSubmit, pendingAt, customWallet, t])

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className={'pb-2 font-medium'}>
          {t("create")}
          {t("flash")}
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
              <div className={'w-full flex justify-end items-center gap-2 text-lg'}>
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
                {t("fees")}
              </div>
              <div>
                {networkFee ? formatUnits(networkFee, 18) : '~'} {chain && chain.nativeCurrency.symbol}
              </div>
            </div>

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
                {t("purchase_tax_rate")}
              </div>
              <div>{new Decimal(taxRate).div(1000).mul(100).toString()}%</div>
            </div>

            <div className={'flex justify-between'}>
              <div className="text-slate-500">
                {t("sell_tax")}
              </div>
              <div>{new Decimal(taxSellRate).div(1000).mul(100).toString()}%</div>
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
                    {t("after_received")}
                  </div>
                  <div>
                    {formatAmount(amountOutMin.sub(taxFee))} {tokenOutSymbol}
                  </div>
                </div>
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

            <div className={'flex justify-between items-center'}>
              <div className="text-slate-500">
                {t("planning")}
              </div>
              <div className={'flex items-center gap-2'}>
                <Input
                  placeholder={'请选择日期'}
                  size={'sm'}
                  type={'datetime-local'}
                  className={'min-w-32'}
                  classNames={{
                    inputWrapper: 'h-fit',
                    innerWrapper: 'pb-0'
                  }}
                  value={pendingAt}
                  onChange={(e) => {
                    setPendingAt(e.target.value)
                  }}
                />

                {
                  pendingAt && (
                    <Button
                      isIconOnly
                      variant={'flat'}
                      size={'sm'}
                      onClick={() => {
                        setPendingAt('')
                      }}
                    >
                      <IoCloseCircleSharp size={18}/>
                    </Button>
                  )
                }
              </div>
            </div>
          </div>

          <blockquote
            className={'border text-sm px-4 py-3 rounded-xl border-default-200 bg-default-200/20'}>
            {t("ensure_smooth_trading")}
          </blockquote>
        </ModalBody>
        <Divider/>
        <ModalFooter className={'flex-col justify-center'}>
          {
            amounts.length >= 2 && outputTokenAllowance <= amounts[amounts.length - 1] ? (
              <Button
                size={'lg'}
                className={'w-full disabled:opacity-30 disabled:pointer-events-none'}
                color={"secondary"}
                variant={'flat'}
                isLoading={outputTokenApproving}
                onClick={outputTokenApprove}
              >
                {t("approve")} {tokenOutSymbol}
              </Button>
            ) : (
              <Button size={'lg'}
                      isLoading={loading}
                      onClick={handleCreate}
                      className={'w-full'}
                      color={"success"}
                      variant={'flat'}>
                {t("create")}
              </Button>
            )
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SniperConfirmModal