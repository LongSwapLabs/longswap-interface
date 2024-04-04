import useApp from "./useApp";
import { useMemo } from "react";
import { currencyEquals } from "../utils/trade";

function useIsCustomToken(currency) {
  const {customTokens} = useApp()

  return useMemo(() => {
    return customTokens.find(e => currencyEquals(e, currency))
  }, [customTokens, currency])
}


export default useIsCustomToken