import { formatAmount } from "../../../utils/amount";
import { formatUnits } from "viem";
import { Button } from "@nextui-org/react";
import { TokenLogo } from "../../../components/TokenLogo";
import React from "react";
import { useAccount } from "wagmi";
import useCurrencyBalance from "../../../hooks/useCurrencyBalance";
import { useTranslation } from "react-i18next";

export const InputAmount = ({amount, setAmount, x314}) => {
  const { t } = useTranslation()
  const {address} = useAccount()
  const balance = useCurrencyBalance(x314, address)

  return (
    <div className={`border px-3 py-2.5 flex flex-col rounded-xl`}>
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-1 text-sm text-slate-400'}>
          <span>{t("staking")}</span>
        </div>

        <div className={'flex items-center space-x-3 text-sm text-slate-400'}>
          <span>{t("balance")}: {formatAmount(formatUnits(balance, x314.decimals))}</span>
          {
            <Button
              size={'sm'}
              className={'px-1 py-0.5 m-0 min-w-0 h-fit'} radius={'sm'} color={'primary'}
              variant={'flat'}
              onClick={() => {
                setAmount(formatUnits(balance, x314.decimals))
              }}
            >
              {t("maximum")}
            </Button>
          }
        </div>
      </div>

      <div className={'flex justify-between items-center my-2'}>
        <div className={'flex items-center'}>
          <div className={'w-7 h-7 rounded-full bg-zinc-300'}>
            <TokenLogo
              height={28}
              width={28}
              token={x314}
            />
          </div>
          <span className={'text-xl w-fit px-1'}>{x314.symbol}</span>
        </div>

        <div className={'w-full max-h-8'}>
          <input
            value={amount}
            className={'w-full text-2xl text-right outline-none disabled:bg-transparent'}
            inputMode="decimal"
            placeholder={'0'}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}