import { ETHER, Token } from "../constants/types";
import { WETH } from "../constants/tokens";
import Decimal from "decimal.js";

/**
 * 包裹币种
 * 主要是将原生币转为对应的包裹代币
 * @param currency
 * @param chainId
 * @returns {*|Token}
 */
export function wrappedCurrency(currency, chainId) {
  if (currency instanceof Token) return currency
  if (currency === ETHER) return WETH[chainId]
}

/**
 * 比较两个币种
 * @param currencyA
 * @param currencyB
 * @returns {boolean|*}
 */
export function currencyEquals(currencyA, currencyB) {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Token) {
    return false
  } else if (currencyB instanceof Token) {
    return false
  } else {
    return currencyA === currencyB
  }
}

export function getSuggestedPairs(inputCurrency, outputCurrency, bases, chainId) {
  const paths = [
    [
      wrappedCurrency(inputCurrency, chainId).address,
      wrappedCurrency(outputCurrency, chainId).address
    ]
  ]
  for (let i = 0; i < bases.length; i++) {
    const base = bases[i]
    if (wrappedCurrency(inputCurrency, chainId).address === base.address || wrappedCurrency(outputCurrency, chainId).address === base.address) {
      continue
    }
    paths.push([
      wrappedCurrency(inputCurrency, chainId).address,
      wrappedCurrency(base, chainId).address,
      wrappedCurrency(outputCurrency, chainId).address
    ])
  }

  return paths
}

export function computePriceImpact(amountOut, reserveOut) {
  if (amountOut === 0n || reserveOut === 0n) {
    return 0
  }
  let r1 = amountOut * 1000000n
  r1 = r1 / (reserveOut * 100n)

  return new Decimal(r1.toString()).div(100).toNumber()
}
