import { useChainId, useClient } from "wagmi";
import { useEffect, useState } from "react";
import { readContract } from "viem/actions";
import LongSwapAbi from "../assets/abis/LongSwap.json";
import ERC314Abi from '../assets/abis/ERC314.json'
import { SWAP_ROUTER } from "../constants";
import { SWAP_MODES } from "../constants/trade";
import { WETH } from "../constants/tokens";

function useGetReserves(path, swapMode, router) {
  const chainId = useChainId()
  const client = useClient()
  const [inputReserve, setInputReserve] = useState(0n)
  const [outputReserve, setOutputReserve] = useState(0n)

  useEffect(() => {
    const fetch = async () => {
      try {
        let result = [0n, 0n];
        if (swapMode === SWAP_MODES.V2) {
          result = await readContract(client, {
            abi: LongSwapAbi,
            address: SWAP_ROUTER,
            functionName: 'getReserves',
            args: [
              router,
              path[path.length - 2],
              path[path.length - 1],
            ]
          })
        } else if (SWAP_MODES.ERC314) {
          const weth = WETH[chainId]
          if (weth) {
            if (weth.address === path[0]) {
              const res = await readContract(client, {
                abi: ERC314Abi,
                address: path[1],
                functionName: 'getReserves',
              })
              result = [res[0], res[1]]
            } else {
              const res = await readContract(client, {
                abi: ERC314Abi,
                address: path[0],
                functionName: 'getReserves',
              })
              result = [res[1], res[0]]
            }
          }
        }
        setInputReserve(result[0])
        setOutputReserve(result[1])
      } catch (e) {
        setInputReserve(0n)
        setOutputReserve(0n)
      }
    }

    if (client && router && path.length >= 2) {
      fetch()
    } else {
      setInputReserve(0n)
      setOutputReserve(0n)
    }
  }, [client, path, router, swapMode, chainId]);

  return {inputReserve, outputReserve}
}

export default useGetReserves