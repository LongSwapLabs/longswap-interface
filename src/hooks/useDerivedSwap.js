import { useCallback, useEffect, useMemo, useState } from "react";
import { ETHER } from "../constants/types";
import { currencyEquals, getSuggestedPairs, wrappedCurrency } from "../utils/trade";
import useCurrencyBalance from "./useCurrencyBalance";
import { estimateGas } from "viem/actions";
import { useAccount, useClient, useConfig, useGasPrice } from "wagmi";
import LongSwapAbi from '../assets/abis/LongSwap.json'
import ERC314Abi from '../assets/abis/ERC314.json'
import { encodeFunctionData, formatUnits, parseGwei, parseUnits } from "viem";
import { SUGGESTED_BASES } from "../constants/tokens";
import useAllowance from "./useAllowance";
import useRouter from "./useRouter";
import { toBigInt } from "ethers";
import useApp from "./useApp";
import { formatAmount } from "../utils/amount";
import { SWAP_ROUTER } from "../constants";
import useGetReserves from "./useGetReserves";
import useAccountAddress from "./useAccountAddress";
import useDebounce from "./useDebounce";
import { readContracts } from "@wagmi/core";
import dayjs from "dayjs";
import { SWAP_MODES } from "../constants/trade";
import { SWAP_MISTAKES } from "../constants/trade";

// 默认Gas
const defaultMaxGas = 600000n
const defaultMinGas = 300000n

function useDerivedSwap() {
  const router = useRouter()
  const address = useAccountAddress()
  const client = useClient()
  const config = useConfig()
  const {taxRate, slippageRate, addGasPrice} = useApp()
  const [swapMode, setSwapMode] = useState(SWAP_MODES.V2)
  const [isNoLiquidity, setIsNoLiquidity] = useState(false)
  const [swapMistake, setSwapMistake] = useState(null)
  const [gasLimit, setGasLimit] = useState(defaultMinGas)
  const {data: estimateGasPrice} = useGasPrice()
  const {chainId} = useAccount()
  const [refreshTime, setRefreshTime] = useState(Date.now())

  const [inputCurrency, setInputCurrency] = useState(ETHER)
  const [outputCurrency, setOutputCurrency] = useState(null)
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500);
  const [path, setPath] = useState([])
  const [amounts, setAmounts] = useState([])
  const [estimating, setEstimating] = useState(false)

  // 池子大小
  const {inputReserve, outputReserve} = useGetReserves(path, swapMode, router)

  const inputCurrencyBalance = useCurrencyBalance(inputCurrency, address)
  const outputCurrencyBalance = useCurrencyBalance(outputCurrency, address)

  // gas价格
  const gasPrice = useMemo(() => {
    if (estimateGasPrice) {
      return estimateGasPrice + parseGwei(String(addGasPrice))
    }
  }, [estimateGasPrice, addGasPrice])

  // 网络费用
  const networkFee = useMemo(() => {
    if (gasPrice && gasLimit) {
      return gasPrice * gasLimit
    }
    return 0n
  }, [gasPrice, gasLimit])

  // 输入代币的授权
  const {
    value: inputTokenAllowance,
    approve: inputTokenApprove,
    loading: inputTokenApproving
  } = useAllowance(inputCurrency, SWAP_ROUTER)

  // 定时器
  useEffect(() => {
    const inc = setInterval(() => setRefreshTime(Date.now()), 12 * 1000)
    return () => clearInterval(inc)
  }, [])

  // 预估输出
  const estimateAmounts = useCallback(async () => {
    if (debouncedAmountIn <= 0 || !inputCurrency || !outputCurrency || !config || !router) {
      return
    }

    setEstimating(true)

    const paths = getSuggestedPairs(inputCurrency, outputCurrency, SUGGESTED_BASES[chainId], chainId)
    const parameters = {
      abi: LongSwapAbi,
      address: SWAP_ROUTER,
      functionName: 'getAmountsOut',
    }

    const amountIn = parseUnits(debouncedAmountIn, inputCurrency.decimals)

    try {
      // v2路由的调用
      const v2Calls = paths.map(path => {
        return {
          ...parameters,
          args: [
            router,
            amountIn,
            path
          ]
        }
      })

      // erc314
      let erc314Call = null
      if (inputCurrency === ETHER) {
        erc314Call = {
          abi: ERC314Abi,
          address: wrappedCurrency(outputCurrency).address,
          functionName: 'getAmountOut',
          args: [amountIn, true]
        }
      } else if (outputCurrency === ETHER) {
        erc314Call = {
          abi: ERC314Abi,
          address: wrappedCurrency(inputCurrency).address,
          functionName: 'getAmountOut',
          args: [amountIn, false]
        }
      }

      const calls = await readContracts(config, {
        contracts: [
          ...v2Calls,
          erc314Call,
        ].filter(e => !!e)
      })

      const results = calls.map((e, index) => {
        if (e.status !== 'success') {
          return null
        }
        if (index > paths.length - 1) {
          return {
            path: paths[0],
            amounts: [amountIn, e.result],
            mode: SWAP_MODES.ERC314
          }
        }
        return {
          path: paths[index],
          amounts: e.result,
          mode: SWAP_MODES.V2
        }
      }).filter(e => !!e).sort((pathA, pathB) => {
        return pathA.amounts[pathA.amounts.length - 1] > pathB.amounts[pathB.amounts.length - 1] ? -1 : 1
      })

      console.log(results)

      if (results.length > 0) {
        const preferred = results[0]
        setPath(preferred.path)
        setAmounts(preferred.amounts)
        setAmountOut(formatAmount(formatUnits(preferred.amounts[preferred.amounts.length - 1], outputCurrency.decimals)))
        setIsNoLiquidity(false)
        setSwapMode(preferred.mode)
      } else {
        setPath(paths[0])
        setAmounts([amountIn, 0n])
        setAmountOut('0')
        setIsNoLiquidity(true)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setEstimating(false)
    }
  }, [debouncedAmountIn, inputCurrency, outputCurrency, config, chainId, router])

  // 输入数量
  useEffect(() => {
    if (debouncedAmountIn > 0) {
      estimateAmounts();
    } else {
      setAmountOut('')
      setAmounts([])
    }
  }, [estimateAmounts, refreshTime, debouncedAmountIn]);

  // 预估gas
  useEffect(() => {
      const fetch = async () => {
        try {
          if (swapMode === SWAP_MODES.V2) {
            // router v2
            const amountOutMin = amounts[amounts.length - 1] * toBigInt(slippageRate) / 1000n;
            const deadline = dayjs().add(12, 'minute').unix()
            const parameters = {
              to: SWAP_ROUTER,
              account: address,
            }

            if (inputCurrency === ETHER) {
              parameters.data = encodeFunctionData({
                abi: LongSwapAbi,
                functionName: 'safeSwapETHForToken',
                args: [
                  router,
                  path,
                  amountOutMin,
                  taxRate,
                  address,
                  deadline
                ],
              })
              parameters.value = amounts[0]
            } else if (outputCurrency === ETHER) {
              parameters.data = encodeFunctionData({
                abi: LongSwapAbi,
                functionName: 'safeSwapTokenForETH',
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
            } else {
              parameters.data = encodeFunctionData({
                abi: LongSwapAbi,
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

            const result = await estimateGas(client, parameters)

            // gas提高8%
            setGasLimit(result + result * 8n / 100n)
            setSwapMistake(null)
          } else if (swapMode === SWAP_MODES.ERC314) {
            let result;
            // erc314
            if (inputCurrency === ETHER) {
              result = await estimateGas(client, {
                account: address,
                to: path[1],
                value: amounts[0]
              })
            } else {
              result = await estimateGas(client, {
                account: address,
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

            setGasLimit(result + result * 10n / 100n)
            setSwapMistake(null)
          }
        } catch
          (e) {
          if (e.message.indexOf('TRANSFER_FAILED') >= 0 || e.message.indexOf('TRANSFER_FROM_FAILED') >= 0) {
            setSwapMistake(SWAP_MISTAKES.NotLaunch)
          } else if (e.message.indexOf('Taxes are too low') >= 0) {
            setSwapMistake(SWAP_MISTAKES.TaxTooLow)
          } else if (e.message.indexOf('Max wallet exceeded') >= 0) {
            setSwapMistake(SWAP_MISTAKES.MaxHold)
          } else if (e.message.indexOf('Trading not enable') >= 0) {
            setSwapMistake(SWAP_MISTAKES.NotLaunch)
          } else if (e.message.indexOf('cooling block') >= 0) {
            setSwapMistake(SWAP_MISTAKES.TradeCooling)
          } else if (e.message.indexOf('same block') >= 0) {
            setSwapMistake(SWAP_MISTAKES.TradeCooling)
          } else {
            console.log(e)
          }
          setGasLimit(defaultMaxGas)
        }
      }

      if (client && inputCurrency && outputCurrency && path.length >= 2 && address && inputCurrencyBalance >= amounts[0] && (inputCurrency === ETHER || swapMode === SWAP_MODES.ERC314 || (inputCurrency !== ETHER && inputTokenAllowance >= amounts[0]))) {
        const amountOut = (amounts.length >= 2 && amounts[amounts.length - 1]) || 0

        if (amountOut > 0) {
          fetch()
        } else {
          setSwapMistake(SWAP_MISTAKES.NotLaunch)
          setGasLimit(defaultMaxGas)
        }
      } else {
        setSwapMistake(null)
        setGasLimit(defaultMinGas)
      }
    }, [swapMode, client, inputCurrency, outputCurrency, path, amounts, inputCurrencyBalance, inputTokenAllowance, slippageRate, taxRate, address, router]
  )
  ;

  // 选择输入币种
  const onSelectInputCurrency = useCallback((currency) => {
    setInputCurrency(currency)

    if (currencyEquals(currency, outputCurrency)) {
      setOutputCurrency(null)
      setAmountIn('')
      setAmountOut('')
      setAmounts([])
    }
  }, [outputCurrency])

  // 选择输出币种
  const onSelectOutputCurrency = useCallback((currency) => {
    setOutputCurrency(currency)

    if (currencyEquals(currency, inputCurrency)) {
      setInputCurrency(null)
      setAmountIn('')
      setAmountOut('')
      setAmounts([])
    }
  }, [inputCurrency])

  // 切换币种
  const onSwitchCurrency = useCallback(() => {
    setInputCurrency(outputCurrency)
    setOutputCurrency(inputCurrency)
    setAmountIn('')
    setAmountOut('')
    setAmounts([])
  }, [inputCurrency, outputCurrency])

  return {
    swapMode,
    router,
    inputTokenAllowance,
    inputTokenApprove,
    inputTokenApproving,
    isNoLiquidity,
    swapMistake,
    gasPrice,
    gasLimit,
    networkFee,
    inputCurrency,
    onSelectInputCurrency,
    inputCurrencyBalance,
    outputCurrency,
    onSelectOutputCurrency,
    outputCurrencyBalance,
    onSwitchCurrency,
    amounts,
    setAmounts,
    amountIn,
    amountOut,
    setAmountIn,
    estimating,
    path,
    inputReserve,
    outputReserve
  }
}

export default useDerivedSwap