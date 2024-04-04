export function getLocalInterval() {
  const val = localStorage.getItem('__trading_view_interval');
  if (val) {
    return val;
  }
  return '5';
}

export function setLocalInterval(val) {
  localStorage.setItem('__trading_view_interval', val);
}

export function getDefaultTimezone() {
  let offset = new Date().getTimezoneOffset() / 60;
  switch (offset) {
    case -8:
      return 'Asia/Shanghai';
    case -9:
      return 'Asia/Tokyo';
    case -10:
      return 'Australia/Brisbane';
    case -2:
      return 'Europe/Paris';
    case 4:
      return 'America/New_York';
    default:
      return 'Asia/Shanghai';
  }
}