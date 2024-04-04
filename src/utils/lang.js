const key = '__longswap_lang'

export const getLang = () => {
  const local = localStorage.getItem(key)
  return local ? local : 'en'
}

export const setLang = (val) => {
  localStorage.setItem(key, val)
}