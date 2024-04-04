import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChains, useConfig, useDisconnect } from "wagmi";
import { switchChain } from "@wagmi/core";
import { Token } from "../../constants/types";
import AccountModal from "../../components/AccountModal";
import { useDisclosure } from "@nextui-org/react";
import useCustomWallets from "../../hooks/useCustomWallets";
import ImportWalletModal from "../../components/AccountModal/ImportWalletModal";

export const Context = createContext({});

function AppProvider({children}) {
  const {disconnect} = useDisconnect()
  const config = useConfig()
  const {address, chainId, isConnected} = useAccount()
  const chains = useChains()
  const {isOpen: isAccountOpen, onOpen: onAccountOpen, onOpenChange: onAccountOpenChange} = useDisclosure()
  const {isOpen: isAddWalletOpen, onOpen: onAddWalletOpen, onOpenChange: onAddWalletOpenChange} = useDisclosure()

  const [addGasPrice, setAddGasPrice] = useState(() => {
    const value = parseFloat(localStorage.getItem(`swiftswap_addGasPrice`))
    if (!isNaN(value)) {
      return value
    }
    return 0
  })
  const [taxRate, setTaxRate] = useState(() => {
    const value = parseFloat(localStorage.getItem(`swiftswap_tax`))
    if (!isNaN(value)) {
      return value
    }
    return 50
  })
  const [taxSellRate, setTaxSellRate] = useState(() => {
    const value = parseFloat(localStorage.getItem(`swiftswap_tax_sell`))
    if (!isNaN(value)) {
      return value
    }
    return 50
  })
  const [slippageRate, setSlippageRate] = useState(() => {
    const value = parseFloat(localStorage.getItem(`swiftswap_slippage`))
    if (!isNaN(value)) {
      return value
    }
    return 5
  })
  const [customTokens, setCustomTokens] = useState([]);
  const [refreshTime, setRefreshTime] = useState(Date.now())

  const [customWallet, setCustomWallet] = useState(null)
  const {customWallets, addCustomWallet, removeCustomWallet} = useCustomWallets()

  const account = useMemo(() => {
    if (customWallet) {
      return customWallet.account
    }
    return address
  }, [address, customWallet])

  useEffect(() => {
    const inc = setInterval(() => setRefreshTime(Date.now()), 3 * 1000)
    return () => clearInterval(inc)
  }, [])

  useEffect(() => {
    if (chainId) {
      const savedTokens = JSON.parse(localStorage.getItem(`customTokens_${chainId}`));
      if (savedTokens) {
        setCustomTokens(savedTokens.map(e => new Token(e.chainId, e.address, e.decimals, e.symbol, e.name)));
      }
    }
  }, [chainId]);

  // Add custom token
  const addCustomToken = useCallback((token) => {
    const updatedTokens = [...customTokens, token]
    localStorage.setItem(`customTokens_${token.chainId}`, JSON.stringify(updatedTokens))
    setCustomTokens(updatedTokens);
  }, [customTokens]);

  // Delete custom token
  const removeCustomToken = useCallback((removeToken) => {
    const updatedTokens = customTokens.filter(token => token.address !== removeToken.address);
    localStorage.setItem(`customTokens_${removeToken.chainId}`, JSON.stringify(updatedTokens))
    setCustomTokens(updatedTokens);
  }, [customTokens]);

  // Set slippage
  const onSetSlippage = useCallback((value) => {
    localStorage.setItem(`swiftswap_slippage`, value)
    setSlippageRate(value)
  }, [])

  // Set default tax rate
  const onSetTaxRate = useCallback((value) => {
    localStorage.setItem(`swiftswap_tax`, value)
    setTaxRate(value)
  }, [])

  // Set sales tax rate
  const onSetTaxSellRate = useCallback((value) => {
    localStorage.setItem(`swiftswap_tax_sell`, value)
    setTaxSellRate(value)
  }, [])

  // Set options to increase gas
  const onSetAddGasPrice = useCallback((value) => {
    localStorage.setItem(`swiftswap_addGasPrice`, value)
    setAddGasPrice(value)
  }, [])

  useEffect(() => {
    const check = async () => {
      const has = chains.find(e => e.id === chainId)
      if (!has) {
        try {
          await switchChain(config, {chainId: chains[0].id})
        } catch (e) {
          console.log(e)
          disconnect()
        }
      }
    }
    if (config && chains && chainId) {
      check()
    }
  }, [disconnect, config, chains, chainId]);

  const value = {
    account,
    customWallet,
    customWallets,
    addCustomWallet,
    removeCustomWallet,
    setCustomWallet,
    onAddWalletOpen,
    refreshTime,
    onAccountOpen,
    addCustomToken,
    removeCustomToken,
    customTokens,
    taxRate,
    slippageRate,
    onSetTaxRate,
    onSetSlippage,
    taxSellRate,
    onSetTaxSellRate,
    addGasPrice,
    onSetAddGasPrice
  };

  return (
    <Context.Provider value={value}>
      {children}
      {isConnected && <AccountModal isOpen={isAccountOpen} onOpenChange={onAccountOpenChange}/>}
      <ImportWalletModal onOpenChange={onAddWalletOpenChange} isOpen={isAddWalletOpen}/>
    </Context.Provider>
  );
}

export default AppProvider;