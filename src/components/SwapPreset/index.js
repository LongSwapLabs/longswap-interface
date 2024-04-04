import { Skeleton, Tooltip, useDisclosure } from "@nextui-org/react";
import { useMemo } from "react";
import { FiAlertOctagon, FiAlertTriangle, FiChevronDown } from "react-icons/fi";
import { AnimatePresence, motion, useWillChange } from "framer-motion";
import { TRANSITION_VARIANTS } from "@nextui-org/framer-transitions";
import { formatAmount } from "../../utils/amount";
import { formatGwei, formatUnits } from "viem";
import useTokenSymbol from "../../hooks/useTokenSymbol";
import { useAccount } from "wagmi";
import Decimal from "decimal.js";
import useApp from "../../hooks/useApp";
import { computePriceImpact } from "../../utils/trade";
import { FaGasPump } from "react-icons/fa";
import { SWAP_MISTAKES, SWAP_MODES, SWAP_MODES_ENUM } from "../../constants/trade";
import { useTranslation } from "react-i18next";

function SwapPreset({
                      amounts,
                      estimating,
                      inputCurrency,
                      outputCurrency,
                      gasPrice,
                      networkFee,
                      isNoLiquidity,
                      swapMistake,
                      outputReserve,
                      swapMode
                    }) {
  const {taxRate, slippageRate} = useApp()
  const willChange = useWillChange()
  const {isOpen, onOpenChange} = useDisclosure()
  const {chain} = useAccount()
  const {t} = useTranslation()

  const tokenInSymbol = useTokenSymbol(inputCurrency)
  const tokenOutSymbol = useTokenSymbol(outputCurrency)

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

  const price = useMemo(() => {
    if (amounts.length >= 2 && inputCurrency && outputCurrency) {
      const amountOut = formatUnits(amounts[amounts.length - 1], outputCurrency.decimals)
      const amountIn = formatUnits(amounts[0], inputCurrency.decimals)
      return new Decimal(amountOut).div(amountIn)
    }
    return null
  }, [amounts, inputCurrency, outputCurrency])

  const priceImpact = useMemo(() => {
    if (amounts.length >= 2 && outputReserve) {
      return computePriceImpact(amounts[amounts.length - 1], outputReserve)
    }
    return 0
  }, [amounts, outputReserve])

  const getNetworkContent = () => {
    if (isNoLiquidity) {
      return (
        <div className={'flex items-center gap-1'}>
          <FiAlertTriangle className={'text-warning'}/>
          <span className={'text-foreground'}>
            {t("no_liquidity")}
          </span>
        </div>
      )
    } else if (swapMistake === SWAP_MISTAKES.TaxTooLow) {
      return (
        <Tooltip showArrow content={'税率太低，无法交易'}>
          <div className={'flex items-center gap-1'}>
            <FiAlertTriangle className={'text-warning'}/>
            <span className={'text-foreground'}>
              {t("tax_low")}
            </span>
          </div>
        </Tooltip>
      )
    } else if (swapMistake === SWAP_MISTAKES.NotLaunch) {
      return (
        <div className={'flex items-center gap-1'}>
          <FiAlertTriangle className={'text-danger'}/>
          <span className={'text-foreground'}>
            {t("not_open")}
          </span>
        </div>
      )
    } else if (swapMistake === SWAP_MISTAKES.MaxHold) {
      return (
        <div className={'flex items-center gap-1'}>
          <FiAlertTriangle className={'text-danger'}/>
          <span className={'text-foreground'}>
            {t("exceeding")}
          </span>
        </div>
      )
    } else if (swapMistake === SWAP_MISTAKES.TradeCooling) {
      return (
        <div className={'flex items-center gap-1'}>
          <FiAlertTriangle className={'text-danger'}/>
          <span className={'text-foreground'}>
            {t("cooling")}
          </span>
        </div>
      )
    }

    return (
      <Tooltip showArrow content={`天然气价格：${formatGwei(gasPrice || 0)}gwei`}>
        <div className={'flex items-center gap-1'}>
          <FaGasPump className={'text-primary'}/>
          <span className={'text-foreground'}>
            {networkFee ? formatAmount(formatUnits(networkFee, 18)) : '~'} {chain && chain.nativeCurrency.symbol}
          </span>
        </div>
      </Tooltip>
    )
  }

  return (
    <div className={'bg-zinc-100 p-3 rounded-2xl'}>
      <div
        className={'flex cursor-pointer justify-center items-center'}
        onClick={onOpenChange}
      >
        <div className={'w-1/2'}>
          {
            estimating ? (
              <Skeleton className="w-full rounded-lg">
                <div className="h-5 w-4/5 rounded-lg bg-default-200"></div>
              </Skeleton>
            ) : (
              <div className={'flex gap-1 text-sm'}>
                <span>1 {tokenInSymbol}</span>
                <span className={'text-slate-400'}>=</span>
                <span>{price ? formatAmount(price) : '~'} {tokenOutSymbol}</span>
              </div>
            )
          }
        </div>

        <div className={'w-1/2 flex justify-end'}>
          <div className={'text-sm flex justify-between gap-2'}>
            {getNetworkContent()}
            <FiChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} size={18}/>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            key="accordion-content"
            animate="enter"
            exit="exit"
            initial="exit"
            style={{overflowY: "hidden", willChange}}
            variants={TRANSITION_VARIANTS.collapse}
          >
            <div className={'flex flex-col gap-2 mt-4 text-sm'}>
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

                    {
                      outputCurrency && (
                        <div className={'flex justify-between'}>
                          <div className="text-slate-500">
                            {t("taxes")}
                          </div>
                          <div>{formatAmount(taxFee)} {tokenOutSymbol}</div>
                        </div>
                      )
                    }

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
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SwapPreset