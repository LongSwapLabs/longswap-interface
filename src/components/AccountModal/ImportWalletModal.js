import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@nextui-org/react";
import { useCallback, useState } from "react";
import useApp from "../../hooks/useApp";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function ImportWalletModal({isOpen, onOpenChange}) {
  const [name, setName] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const { t } = useTranslation()
  const {addCustomWallet} = useApp()

  const handleOnClick = useCallback(() => {
    try {
      addCustomWallet(name, privateKey)
      toast.success(t("import_success"))
      setName('')
      setPrivateKey('')
      onOpenChange()
    } catch (e) {
      toast.error(e.message)
    }
  }, [addCustomWallet, name, privateKey, onOpenChange, t])

  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          {t("importsub")}
        </ModalHeader>
        <ModalBody className={'gap-2'}>
          <Input
            label={t("wallet_name")}
            labelPlacement="outside"
            placeholder={t("enter_wallet_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            minRows={2}
            label={t("private_key")}
            labelPlacement="outside"
            placeholder={t("enter_key")}
            className="w-full"
            value={privateKey}
            onChange={(e) => {
              setPrivateKey(e.target.value)
            }}
          />
        </ModalBody>
        <ModalFooter className={'justify-center'}>
          <Button
            disabled={!name || !privateKey}
            color={'warning'}
            variant={'flat'}
            className={'w-full disabled:pointer-events-none disabled:grayscale'}
            onClick={handleOnClick}
          >
            {t("import")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ImportWalletModal