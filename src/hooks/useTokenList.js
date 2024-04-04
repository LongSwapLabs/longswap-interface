import { useAccount } from "wagmi";
import { useMemo } from "react";
import { TOKEN_LIST } from "../constants/tokens";

function useTokenList() {
  const {chainId} = useAccount()

  return useMemo(() => {
    if (chainId) {
      return TOKEN_LIST[chainId] || []
    }
    return []
  }, [chainId])
}

export default useTokenList