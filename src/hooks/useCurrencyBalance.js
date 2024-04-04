import { useEffect, useState } from "react";
import { ETHER } from "../constants/types";
import { useClient } from "wagmi";
import { getBalance, readContract } from "viem/actions";
import ERC20 from '../assets/abis/ERC20.json'

function useCurrencyBalance(currency, address) {
  const [value, setValue] = useState(0n)
  const client = useClient()

  const [refreshTime, setRefreshTime] = useState(Date.now())

  useEffect(() => {
    const inc = setInterval(() => setRefreshTime(Date.now()), 6 * 1000)
    return () => clearInterval(inc)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        if (currency === ETHER) {
          setValue(await getBalance(client, {
            address,
          }))
        } else {
          setValue(await readContract(client, {
            abi: ERC20,
            address: currency.address,
            functionName: 'balanceOf',
            args: [address]
          }))
        }
      } catch (e) {
        console.log(e)
      }
    }

    if (currency && address && client) {
      fetch()
    } else {
      setValue(0n)
    }
  }, [currency, address, client, refreshTime]);

  return value
}

export default useCurrencyBalance