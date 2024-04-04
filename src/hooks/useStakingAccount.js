import { useAccount, useConfig } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { readContracts } from "@wagmi/core";
import stakingAbi from "../assets/abis/Staking.json";
import { STAKING } from "../constants";

function useStakingAccount() {
  const {address} = useAccount()
  const config = useConfig()
  const [value, setValue] = useState(null)
  const [refreshTime, setRefreshTime] = useState(Date.now())

  useEffect(() => {
    const inc = setInterval(() => {
      setRefreshTime(Date.now())
    }, 3000)
    return () => clearInterval(inc)
  }, []);

  const fetch = useCallback(async () => {
    try {
      const results = await readContracts(config, {
        allowFailure: false,
        contracts: [
          {
            abi: stakingAbi,
            address: STAKING,
            functionName: 'accountOf',
            args: [address]
          },
          {
            abi: stakingAbi,
            address: STAKING,
            functionName: 'pending',
            args: [address]
          },
          {
            abi: stakingAbi,
            address: STAKING,
            functionName: 'hasLotteryToday',
            args: [address]
          },
          {
            abi: stakingAbi,
            address: STAKING,
            functionName: 'lotteryEnable',
          },
        ]
      })
      setValue({
        total: results[0][0],
        released: results[0][1],
        relay: results[0][2],
        lastRelease: results[0][3],
        duration: results[0][4],
        pending: results[1],
        hasLotteryToday: results[2],
        lotteryEnable: results[3],
      })
    } catch (e) {
      console.log(e)
    }
  }, [address, config])

  useEffect(() => {
    if (config && address) {
      fetch()
    } else {
      setValue(null)
    }
  }, [fetch, config, address, refreshTime]);

  return value
}

export default useStakingAccount