import { useClient, useWriteContract } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { readContract, waitForTransactionReceipt } from "viem/actions";
import ERC20 from "../assets/abis/ERC20.json";
import { ETHER } from "../constants/types";
import { MaxUint256 } from "ethers";
import useAccountAddress from "./useAccountAddress";
import useApp from "./useApp";

function useAllowance(currency, spender) {
  const client = useClient()
  const address = useAccountAddress()
  const {account} = useApp()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(null)

  const {writeContractAsync} = useWriteContract()

  const fetch = useCallback(async () => {
    try {
      const result = await readContract(client, {
        abi: ERC20,
        address: currency.address,
        functionName: 'allowance',
        args: [address, spender]
      })

      setValue(result)
    } catch (e) {
      console.log(e)
    }
  }, [client, address, spender, currency])

  const approve = useCallback(async () => {
    try {
      setLoading(true)
      try {
        const hash = await writeContractAsync({
          abi: ERC20,
          address: currency.address,
          functionName: 'approve',
          args: [spender, MaxUint256],
          account,
        })

        await waitForTransactionReceipt(client,
          {hash, confirmations: 3, pollingInterval: 3000})
      } catch (e) {
        console.log(e)
      } finally {
        await fetch()
        setLoading(false)
      }
    } catch (e) {
      console.log(e)
    }
  }, [client, account, spender, currency, writeContractAsync, fetch])

  useEffect(() => {
    if (client && address && spender && currency && currency !== ETHER) {
      fetch()
    } else {
      setValue(0n)
    }
  }, [client, address, spender, currency, fetch]);

  return {value, fetch, approve, loading}
}

export default useAllowance