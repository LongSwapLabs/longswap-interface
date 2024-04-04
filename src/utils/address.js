/**
 * 短地址
 * @param address
 * @returns {string}
 */
export function shortAddress(address) {
  if (!address) {
    return '';
  }
  const prefix = address.substring(0, 4);
  const middle = '...';
  const suffix = address.substring(address.length - 4);
  return prefix + middle + suffix;
}

export function addPrefix(value, prefix = '0x') {
  if (value.indexOf(prefix) === -1) {
    return prefix + value
  }
  return value
}

export function tailAddress(address, length = 6) {
  if (!address) {
    return '';
  }
  return address.substring(address.length - length);
}
