import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { FiShare } from "react-icons/fi";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";

export const Share = () => {
  const {t} = useTranslation()
  const {address} = useAccount()

  const link = useMemo(() => {
    return `${window.location.protocol}//${window.location.host}/staking?ref=${address}`
  }, [address])

  const onCopy = useCallback(() => {
    copy(link)
  }, [link])

  return (
    <Popover placement="left" showArrow={true}>
      <PopoverTrigger>
        <div className={'transition cursor-pointer hover:opacity-70'} onClick={onCopy}>
          <FiShare/>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">{t("Invitation link copied")}</div>
          <div className="text-zinc-600">{t("invitation-tips")}</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// 邀请质押可得10%奖励