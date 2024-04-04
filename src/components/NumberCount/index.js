import CountUp from "react-countup";
import { useEffect, useState } from "react";

export function NumberCount({value, decimals}) {
  const [start, updateStart] = useState(0)
  const [end, updateEnd] = useState(0)

  useEffect(() => {
    if (typeof value === 'number') {
      updateStart(end)
      updateEnd(value)
    }
    // eslint-disable-next-line
  }, [value])

  return (
    <CountUp
      start={start}
      end={end}
      decimals={
        decimals !== undefined ? decimals : end < 0 ? 4 : end > 1e5 ? 0 : 3
      }
      duration={1}
      separator=","
    />
  )
}