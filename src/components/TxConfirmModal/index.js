import { Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { FiAlertTriangle, FiArrowUpCircle, FiExternalLink } from "react-icons/fi";
import { useAccount, useClient } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { waitForTransactionReceipt } from "viem/actions";

export function TxConfirmModal({isOpen, onOpenChange, hash}) {
  const client = useClient()
  const {chain} = useAccount()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const explorerName = useMemo(() => {
    if (chain) {
      return chain.blockExplorers.default.name
    }
    return 'Unknown'
  }, [chain])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {

        const transactionReceipt = await waitForTransactionReceipt(client, {
          hash,
          confirmations: 1,
        })

        console.log(transactionReceipt)

        setIsSuccess(transactionReceipt.status === 'success')
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    if (client && hash) {
      fetch()
    }
  }, [client, hash]);

  return (
    <Modal placement={'center'} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          交易已提交
        </ModalHeader>
        <ModalBody>
          <div className={'flex py-4 flex-col items-center'}>
            {
              loading ? (
                  <Spinner size={'lg'}/>
                ) :
                isSuccess ? (
                  <FiArrowUpCircle className={'text-success'} size={80}/>
                ) : (
                  <FiAlertTriangle className={'text-warning'} size={80}/>
                )
            }
          </div>
        </ModalBody>

        <ModalFooter>
          {
            chain && hash ? (
              <Button
                as={Link}
                size={'lg'}
                target={'_blank'}
                color={'primary'}
                variant={'flat'}
                className={'flex-1 font-medium'}
                href={`${chain.blockExplorers.default.url}/tx/${hash}`}
                endContent={<FiExternalLink/>}
              >
                在{explorerName}上查看
              </Button>
            ) : null
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TxConfirmModal