import useTokenList from "./useTokenList";
import useApp from "./useApp";
import { useMemo } from "react";

function useAllTokens() {
  const tokenList = useTokenList()
  const {customTokens} = useApp()

  return useMemo(() => {
    return [
      ...tokenList,
      ...customTokens,
    ]
  }, [tokenList, customTokens])
}

export default useAllTokens