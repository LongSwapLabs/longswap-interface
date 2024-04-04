import { useAccount } from "wagmi";
import { useMemo } from "react";
import { ROUTERS } from "../constants/routers";

function useRouter() {
  const {chainId} = useAccount()

  return useMemo(() => {
    if (chainId) {
      return ROUTERS[chainId]
    }
  }, [chainId])
}

export default useRouter