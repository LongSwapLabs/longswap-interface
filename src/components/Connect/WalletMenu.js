import {
  Button, Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useCallback } from "react";
import { useConnect } from "wagmi";

import metamaskIcon from '../../assets/wallets/metaMaskWallet.svg'
import tokenPocketWallet from '../../assets/wallets/tokenPocketWallet.svg'
import { BiWallet } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const wallets = {
  'MetaMask': metamaskIcon,
  'TokenPocket': tokenPocketWallet,
}

function WalletIcon({name}) {
  if (wallets[name]) {
    return <img alt={''} src={wallets[name]} width={20} height={20}/>
  }
  return <BiWallet size={20}/>
}

export function WalletMenu() {
  const { t } = useTranslation()
  const {connectors, connectAsync} = useConnect()

  const connect = useCallback(async (connector) => {
    try {
      await connectAsync({connector})
    } catch (e) {
      console.log(e)
    }
  }, [connectAsync])

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button color="primary" variant="flat" className={'font-semibold'}>
          {t("connect")}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        onSelect={(e) => {
          console.log(e)
        }}
      >
        {connectors.map((connector) => (
          <DropdownItem
            key={connector.uid}
            startContent={<WalletIcon name={connector.name}/>}
            size={'lg'}
            onClick={() => {
              connect(connector)
            }}
          >
            {connector.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
