import {
  Badge,
  Button,
} from "@nextui-org/react";
import React from "react";
import { useAccount } from "wagmi";
import { WalletMenu } from "./WalletMenu";
import { shortAddress } from "../../utils/address";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import useApp from "../../hooks/useApp";

function Connect() {
  const {isConnected} = useAccount()
  const {customWallet, onAccountOpen} = useApp()
  const {address} = useAccount()

  return (
    <div className={'flex items-center'}>
      {
        isConnected ? (
          <Badge
            size={'sm'}
            color={'warning'}
            content={customWallet && customWallet.name}
            isInvisible={!customWallet}
          >
            <Button onPress={onAccountOpen} variant={'flat'} className={'font-semibold'}>
              <Jazzicon diameter={20} seed={jsNumberForAddress(address)}/> {shortAddress(address)}
            </Button>
          </Badge>
        ) : (
          <WalletMenu/>
        )
      }
    </div>
  )
}

export default Connect