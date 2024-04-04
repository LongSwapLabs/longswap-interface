import { Skeleton } from "@nextui-org/react";
import { formatUnits } from "viem";
import { useTranslation } from "react-i18next";
import { NumberCount } from "../../../components/NumberCount";
import { useMemo } from "react";

export const Account = ({account}) => {

  const total = useMemo(() => {
    if (account) {
      return parseFloat(formatUnits(account.total, 18))
    }
    return 0
  }, [account])

  const locked = useMemo(() => {
    if (account) {
      return parseFloat(formatUnits(account.total - account.released - account.pending, 18))
    }
    return 0
  }, [account])

  const release = useMemo(() => {
    if (account) {
      return parseFloat(formatUnits(account.released + account.pending, 18))
    }
    return 0
  }, [account])

  const pending = useMemo(() => {
    if (account) {
      return parseFloat(formatUnits(account.pending, 18))
    }
    return 0
  }, [account])

  const {t} = useTranslation()
  return (
    <div
      className="flex flex-col gap-y-3 lg:gap-y-5 bg-white rounded-xl">
      <div className="inline-flex justify-center items-center">
        <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
          {t("total")}
        </span>
      </div>

      <div
        className="flex justify-center text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200">
        {
          account ? (
            <NumberCount value={total} decimals={3}/>
          ) : (
            <Skeleton className={'h-10 my-1 rounded-lg w-1/3'}/>
          )
        }
      </div>

      <dl className="flex justify-center items-center divide-x divide-gray-200 dark:divide-gray-700">
        <dt className="pe-3">
          <div className={'w-full flex justify-center text-sm font-semibold text-gray-800 dark:text-gray-200'}>
            {
              account ? (
                <NumberCount value={locked} decimals={3}/>
              ) : (
                <Skeleton className={'h-3 my-1 rounded-lg w-2/3'}/>
              )
            }
          </div>
          <span className="block text-sm text-gray-500 text-center">{t("locked")}</span>
        </dt>
        <dd className="text-start px-3">
          <div className={'w-full flex justify-center text-sm font-semibold text-gray-800 dark:text-gray-200'}>
            {
              account ? (
                <NumberCount value={release} decimals={3}/>
              ) : (
                <Skeleton className={'h-3 my-1 rounded-lg w-2/3'}/>
              )
            }
          </div>
          <span className="block text-sm text-gray-500 text-center">{t("release")}</span>
        </dd>
        <dd className="text-start ps-3">
          <div className={'w-full flex justify-center text-sm font-semibold text-gray-800 dark:text-gray-200'}>
            {
              account ? (
                <NumberCount value={pending} decimals={5}/>
              ) : (
                <Skeleton className={'h-3 my-1 rounded-lg w-2/3'}/>
              )
            }
          </div>
          <span className="block text-sm text-gray-500 text-center">{t("available")}</span>
        </dd>
      </dl>
    </div>
  )
}
