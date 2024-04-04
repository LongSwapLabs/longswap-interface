/**
 * Swap Mode
 * @type {{ERC314: string, V2: string, V3: string}}
 */
export const SWAP_MODES = {
  V2: 'v2',
  V3: 'v3',
  ERC314: 'erc314'
}

export const SWAP_MODES_ENUM = {
  [SWAP_MODES.V2]: 'V2',
  [SWAP_MODES.V3]: 'V3',
  [SWAP_MODES.ERC314]: 'ERC314'
}

export const SWAP_MISTAKES = {
  NotLaunch: 1,
  TaxTooLow: 2,
  MaxHold: 3,
  TradeCooling: 4,
}