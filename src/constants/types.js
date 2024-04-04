import { privateKeyToAccount } from "viem/accounts";

/**
 * Currency
 */
export class Currency {
  constructor(decimals, symbol, name) {
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
}

/**
 * Currency
 * @type {Currency}
 */
export const ETHER = new Currency(18, 'ETH', 'ETH')

/**
 * Token
 */
export class Token extends Currency {
  constructor(chainId, address, decimals, symbol, name) {
    super(decimals, symbol, name)
    this.chainId = chainId;
    this.address = address;
  }

  equals(other) {
    if (this === other) {
      return true
    }
    return this.chainId === other.chainId && this.address === other.address
  }
}

export class CustomWallet {
  constructor(address, name, privateKey) {
    this.address = address
    this.name = name
    this.privateKey = privateKey
    this.account = privateKeyToAccount(this.privateKey)
  }
}
