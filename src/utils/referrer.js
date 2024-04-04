const key = '__longswap_referrer'

export const getReferrerFromLocal = () => {
  const local = localStorage.getItem(key)
  return local ? local : null
}

export const setReferrerToLocal = (val) => {
  localStorage.setItem(key, val)
}