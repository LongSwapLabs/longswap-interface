import { useEffect, useState } from "react";
import ERC20 from "../assets/abis/ERC20.json";
import { useChainId, useConfig } from "wagmi";
import { getAddress, isAddress } from "viem";
import { readContracts } from '@wagmi/core'
import { Token } from "../constants/types";

function useToken(tokenAddress) {
  const chainId = useChainId()
  const config = useConfig()
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const address = getAddress(tokenAddress)
        const result = await readContracts(config, {
          allowFailure: false,
          contracts: [
            {
              address: address,
              abi: ERC20,
              functionName: 'decimals',
            },
            {
              address: address,
              abi: ERC20,
              functionName: 'symbol',
            },
            {
              address: address,
              abi: ERC20,
              functionName: 'name',
            },
          ]
        })

        const token = new Token(chainId, address, result[0], result[1], result[2])
        setData(token)
      } catch (e) {
        console.log(e)
      }
    }

    if (isAddress(tokenAddress) && config) {
      fetch()
    } else {
      setData(null)
    }
  }, [tokenAddress, config, chainId])

  return data
}

export default useToken