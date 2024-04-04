import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { shortAddress } from "../../utils/address";
import { useBalance } from "wagmi";
import { Button, Chip, Skeleton } from "@nextui-org/react";
import { AiFillDelete } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";

function CustomWallet({wallet, onClick, onRemove, customWallet, accountAddress}) {
  const {data: balance} = useBalance({address: wallet.address})

  return (
    <div
      className={'p-2 hover:bg-default-100 rounded-lg flex items-center cursor-pointer justify-between'}
      onClick={onClick}
    >
      <div className={'flex items-center gap-2'}>
        <Jazzicon diameter={40} seed={jsNumberForAddress(wallet.address)}/>
        <div className={'flex flex-col'}>
          <div className={'font-bold flex items-center gap-2'}>
            {shortAddress(wallet.address)} <Chip color={'warning'} className={'h-fit'} size={'sm'}>{wallet.name}</Chip>
          </div>
          {
            balance ? (
              <div className={'text-xs text-zinc-400'}>
                {balance.formatted} {balance.symbol}
              </div>
            ) : (
              <Skeleton className={'rounded-lg mt-1'}>
                <div className={'h-3 w-full'}/>
              </Skeleton>
            )
          }
        </div>
      </div>

      <div className={'flex justify-end'}>
        {
          (customWallet && accountAddress === wallet.address) ? (
            <FaCircleCheck size={20} className={'text-primary'}/>
          ) : (
            <Button variant={'flat'} size={'sm'} isIconOnly onClick={onRemove}>
              <AiFillDelete/>
            </Button>
          )
        }
      </div>
    </div>
  )
}

export default CustomWallet