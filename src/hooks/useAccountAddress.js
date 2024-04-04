import { useContext, useMemo } from "react";
import { Context } from "../contexts/AppProvider";

function useAccountAddress() {
  const {account} = useContext(Context)

  return useMemo(() => {
    if (typeof account === 'object') {
      return account.address
    }
    return account
  }, [account])
}

export default useAccountAddress