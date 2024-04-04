import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { shortAddress } from "../../utils/address";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useCallback, useState } from "react";
import copy from 'copy-to-clipboard';
import {
  FiCheckCircle,
  FiCopy,
  FiCornerRightUp,
  FiLogOut, FiPlus, FiZap,
} from "react-icons/fi";
import useApp from "../../hooks/useApp";
import CustomWallet from "./CustomWallet";
import useAccountAddress from "../../hooks/useAccountAddress";
import { useTranslation } from "react-i18next";

function AccountModal({isOpen, onOpenChange}) {
  const {address} = useAccount()
  const {disconnectAsync} = useDisconnect()

  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()
  const {data: balance} = useBalance({address})
  const {customWallets, customWallet, onAddWalletOpen, setCustomWallet, removeCustomWallet} = useApp()
  const accountAddress = useAccountAddress()

  const onCopy = useCallback(() => {
    copy(address)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1200)
  }, [address])

  const disconnect = useCallback(async () => {
    setLoading(true)

    try {
      await disconnectAsync()
      onOpenChange()
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }, [disconnectAsync, onOpenChange])

  return (
    <Modal disableAnimation={true} placement={'auto'} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          {t("wallet")}
        </ModalHeader>
        <Divider/>
        <ModalBody>
          <div className={'flex py-4 flex-col items-center'}>
            <Jazzicon diameter={70} seed={jsNumberForAddress(address)}/>

            <div className={'pt-2 font-bold'}>
              {shortAddress(address)}
            </div>

            {
              balance && (
                <div className={'text-sm text-zinc-400'}>
                  {balance.formatted} {balance.symbol}
                </div>
              )
            }
          </div>
          <div className={'flex gap-2'}>
            <Button
              color={'default'}
              onClick={onCopy}
              variant={'flat'}
              disabled={copied}
              className={'flex-1 font-medium'}
              endContent={copied ? <FiCheckCircle/> : <FiCopy/>}
            >
              {t("copy")}
            </Button>
            <Button
              color={'danger'}
              onClick={disconnect}
              isLoading={loading}
              variant={'flat'}
              className={'flex-1 font-medium'}
              endContent={<FiLogOut/>}
            >
              {t("disconnect")}
            </Button>
          </div>
          <div>
            <Button
              color={'secondary'}
              onClick={() => {
                setCustomWallet(null)
              }}
              size={'sm'}
              variant={'flat'}
              disabled={!customWallet}
              className={'flex-1 font-medium w-full disabled:pointer-events-none disabled:grayscale'}
              endContent={<FiCornerRightUp/>}
            >
              {customWallet ? t("switch_wallet") : t("main_wallet")}
            </Button>
          </div>
        </ModalBody>

        <Divider/>

        <ModalFooter className={'justify-start flex-col gap-4'}>
          <div className={'flex items-center gap-1'}>
            <FiZap/>
            <span>{t("local_wallet")}</span>
          </div>
          <div className={'flex flex-col gap-2'}>
            {
              customWallets.map(wallet => (
                <CustomWallet
                  key={wallet.address}
                  wallet={wallet}
                  accountAddress={accountAddress}
                  customWallet={customWallet}
                  onClick={() => {
                    setCustomWallet(wallet)
                    onOpenChange()
                  }}
                  onRemove={() => {
                    removeCustomWallet(wallet.address)
                  }}
                />
              ))
            }
            {
              customWallets.length === 0 && (
                <div className={'flex flex-col w-full justify-center items-center my-4'}>
                  <div className={'text-sm text-slate-500'}>
                    {t("not_import")}
                  </div>
                </div>
              )
            }
          </div>
          <Button
            color={'primary'}
            variant={'flat'}
            onPress={onAddWalletOpen}
            startContent={<FiPlus/>}
          >
            {t("importsub")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AccountModal