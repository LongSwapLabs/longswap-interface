import { useContext } from 'react';
import { Context } from '../contexts/AppProvider';

function useApp() {
  const {
    account,
    customWallet,
    customWallets,
    addCustomWallet,
    removeCustomWallet,
    setCustomWallet,
    onAddWalletOpen,
    refreshTime,
    onAccountOpen,
    user,
    token,
    fetchUser,
    addCustomToken,
    removeCustomToken,
    customTokens,
    taxRate,
    onSetTaxRate,
    slippageRate,
    onSetSlippage,
    taxSellRate,
    onSetTaxSellRate,
    addGasPrice,
    onSetAddGasPrice
  } = useContext(Context)

  return {
    account,
    customWallet,
    customWallets,
    addCustomWallet,
    removeCustomWallet,
    onAddWalletOpen,
    setCustomWallet,
    refreshTime,
    onAccountOpen,
    user,
    token,
    fetchUser,
    addCustomToken,
    removeCustomToken,
    customTokens,
    taxRate,
    onSetTaxRate,
    slippageRate,
    onSetSlippage,
    taxSellRate,
    onSetTaxSellRate,
    addGasPrice,
    onSetAddGasPrice
  };
}

export default useApp;