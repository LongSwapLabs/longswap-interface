import Decimal from 'decimal.js';

const bigFormat = Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 3,
});

export function getDecimalZeroNumber(d) {
  return d.log(10).add(1).floor().abs().toNumber();
}

export function getPriceScale(price) {
  const d = new Decimal(price);
  if (d.greaterThan(0.1)) {
    return Math.pow(10, 3);
  }
  let dn = getDecimalZeroNumber(d);
  return Math.pow(10, dn + 3);
}

export function formatAmount(amount) {
  const d = new Decimal(amount);
  if (d.greaterThan(10000000)) {
    return bigFormat.format(d.toDP(3).toString());
  } else if (d.greaterThan(0.1)) {
    return d.toDP(3).toString();
  } else if (d.isZero()) {
    return d.toFixed(2);
  }
  let dn = getDecimalZeroNumber(d);
  if (dn > 3) {
    return `0.0{${dn}}` + d.mul(Decimal.pow(10, dn)).toDP(3).toString().split('.')[1];
  }

  return d.toDP(dn + 3).toString();
}

export function formatRate24(rate24) {
  const d = new Decimal(rate24);

  if (d.abs().greaterThan(10000000)) {
    if (d.isPositive()) {
      return '+' + bigFormat.format(d.toDP(2).toString());
    }
    return bigFormat.format(d.toDP(2).toString());
  }

  if (d.isPositive()) {
    return '+' + d.toFixed(2);
  }
  return d.toFixed(2);
}