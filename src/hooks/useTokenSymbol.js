import { useAccount } from "wagmi";
import { useMemo } from "react";
import { ETHER } from "../constants/types";
import { useTranslation } from "react-i18next";

function useTokenSymbol(currency) {
  const {chain} = useAccount()
  const {t} = useTranslation()

  return useMemo(() => {
    if (currency) {
      if (currency === ETHER && chain) {
        return chain.nativeCurrency.symbol
      }
      return currency.symbol
    }
    return t("select_token")
  }, [currency, chain, t])
}

export default useTokenSymbol