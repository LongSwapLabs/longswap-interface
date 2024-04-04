import { Token } from "./types";

export const WETH = {
  97: new Token(97, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 18, 'WBNB', 'Wrapper BNB'),
  56: new Token(56, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapper BNB'),
}

export const TOKEN_LIST = {
  97: [
    WETH[97],
  ],
  56: [
    WETH[56],
    new Token(56, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD'),
    new Token(56, '0x3B4E1f58cd3A434E348bF335C6ae0C993d3789cB', 18, 'LONG-314', 'Long 314'),
    new Token(56, '0x003144B41d9743D402c5bdF3f72Ca0f327aA0Bca', 18, 'X314', 'X-314'),
  ]
}

export const SUGGESTED_BASES = {
  97: [
    WETH[97],
  ],
  56: [
    WETH[56],
    new Token(56, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD'),
    new Token(56, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'USD Coin'),
    new Token(56, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD Token'),
    new Token(56, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETH', 'Ethereum Token'),
  ],
}
