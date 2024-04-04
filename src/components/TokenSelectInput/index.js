import { Button, Tooltip, useDisclosure } from "@nextui-org/react";
import { FiChevronDown } from "react-icons/fi";
import TokenListModal from "../TokenListModal";
import { TokenLogo } from "../TokenLogo";
import { useCallback, useMemo } from "react";
import { formatUnits } from "viem";
import useTokenSymbol from "../../hooks/useTokenSymbol";
import { formatAmount } from "../../utils/amount";
import { ETHER } from "../../constants/types";
import CopyHelper from "../CopyHelper";
import { useTranslation } from "react-i18next";

function TokenSelectInput({
                            label,
                            amount = '0',
                            selectedCurrency,
                            onSelect,
                            onAmountChange,
                            currencyBalance,
                            networkFee,
                            disabled,
                          }) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const tokenSymbol = useTokenSymbol(selectedCurrency)
  const {t} = useTranslation()

  const handleOnSelect = useCallback((currency) => {
    onSelect && onSelect(currency)
    onOpenChange()
  }, [onSelect, onOpenChange])

  // 格式化余额
  const formatBalance = useMemo(() => {
    if (selectedCurrency) {
      return formatUnits(currencyBalance, selectedCurrency.decimals)
    }
    return '0'
  }, [currencyBalance, selectedCurrency])

  // 最大
  const handleOnMax = useCallback(() => {
    if (!selectedCurrency) {
      return
    }
    if (selectedCurrency === ETHER) {
      onAmountChange(formatUnits(currencyBalance - networkFee, ETHER.decimals))
    } else {
      onAmountChange(formatUnits(currencyBalance, selectedCurrency.decimals))
    }
  }, [networkFee, selectedCurrency, currencyBalance, onAmountChange])

  return (
    <div className={`border px-3 py-2.5 flex flex-col rounded-xl ${disabled ? 'bg-zinc-50' : ''}`}>
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-1 text-sm text-slate-400'}>
          <span>{label}</span>
          {!!selectedCurrency && selectedCurrency !== ETHER ? (
            <CopyHelper text={selectedCurrency.address}/>
          ) : null}
        </div>

        <div className={'flex items-center space-x-3 text-sm text-slate-400'}>
          <Tooltip showArrow content={formatBalance}>
            <span>{t("balance")}: {formatAmount(formatBalance)}</span>
          </Tooltip>
          {
            !disabled && (
              <Button
                size={'sm'}
                className={'px-1 py-0.5 m-0 min-w-0 h-fit'} radius={'sm'} color={'primary'}
                variant={'flat'}
                onClick={handleOnMax}
              >
                {t("max")}
              </Button>
            )
          }
        </div>
      </div>

      <div className={'flex justify-between items-center my-2'}>
        <div className={'flex items-center'}>
          <Button
            variant={'light'}
            size={'sm'}
            radius={'lg'}
            className={'text-xl w-fit px-1'}
            onClick={onOpen}
            startContent={
              selectedCurrency && (
                <div className={'w-7 h-7 rounded-full bg-zinc-300'}>
                  <TokenLogo
                    height={28}
                    width={28}
                    token={selectedCurrency}
                  />
                </div>
              )
            }
            endContent={
              <div className={'w-5 h-5'}>
                <FiChevronDown className={'text-slate-400'} size={20}/>
              </div>
            }
          >
            {tokenSymbol}
          </Button>
        </div>

        <div className={'w-full max-h-8'}>
          <input
            disabled={disabled}
            value={amount}
            className={'w-full text-2xl text-right outline-none disabled:bg-transparent'}
            inputMode="decimal"
            placeholder={'0'}
            readOnly={disabled}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
      </div>

      <TokenListModal
        selectedCurrency={selectedCurrency}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSelect={handleOnSelect}
      />
    </div>
  )
}

export default TokenSelectInput