import { useCallback, useState } from "react";
import { CustomWallet } from "../constants/types";
import { privateKeyToAddress } from "viem/accounts";
import { addPrefix } from "../utils/address";

function useCustomWallets() {
  const [customWallets, setCustomWallets] = useState(() => {
    const savedWallets = localStorage.getItem('customWallets');
    if (savedWallets) {
      return JSON.parse(savedWallets).map(wallet => new CustomWallet(wallet.address, wallet.name, wallet.privateKey));
    } else {
      return [];
    }
  });

  const addWallet = useCallback((name, privateKeyStr) => {
    const privateKey = addPrefix(privateKeyStr)

    const address = privateKeyToAddress(privateKey)
    if (customWallets.find(e => e.address === address)) {
      throw new Error('导入的钱包已存在')
    }
    const newWallet = new CustomWallet(address, name, privateKey)
    const newWallets = [...customWallets, newWallet]
    setCustomWallets(newWallets);

    localStorage.setItem('customWallets', JSON.stringify(newWallets.map((e => {
      return {
        address: e.address,
        name: e.name,
        privateKey: e.privateKey,
      }
    }))));
  }, [customWallets])

  const removeWallet = useCallback((address) => {
    const newWallets = [...customWallets]

    const index = newWallets.findIndex(e => e.address === address)
    newWallets.splice(index, 1);
    setCustomWallets(newWallets);

    localStorage.setItem('customWallets', JSON.stringify(newWallets.map((e => {
      return {
        address: e.address,
        name: e.name,
        privateKey: e.privateKey,
      }
    }))));
  }, [customWallets])

  return {
    customWallets,
    addCustomWallet: addWallet,
    removeCustomWallet: removeWallet,
  }
}

export default useCustomWallets