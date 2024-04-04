import { isAddress } from "viem";

export function filterTokens(tokens, search) {
  if (search.length === 0) return tokens

  const searchingAddress = isAddress(search)

  if (searchingAddress) {
    return tokens.filter(token => token.address === searchingAddress)
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter(s => s.length > 0)

  if (lowerSearchParts.length === 0) {
    return tokens
  }

  const matchesSearch = (s) => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)

    return lowerSearchParts.every(p => p.length === 0 || sParts.some(sp => sp.startsWith(p) || sp.endsWith(p)))
  }

  return tokens.filter(token => {
    const {symbol, name} = token

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name))
  })
}