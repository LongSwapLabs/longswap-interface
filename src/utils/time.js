import dayjs from "dayjs";

export function formatTimestamp(timestamp, format) {
  const d = dayjs(timestamp * 1000);

  if (format) {
    return d.format(format);
  }

  if (d.isSame(dayjs(), 'day')) {
    return d.format('HH:mm:ss');
  }
  if (d.isSame(dayjs(), 'year')) {
    return d.format('MM-DD HH:mm:ss');
  }

  return d.format('YYYY-MM-DD HH:mm:ss');
}