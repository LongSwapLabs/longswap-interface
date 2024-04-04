import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import { FiArrowDown, FiSettings } from "react-icons/fi";
import TokenSelectInput from "../../components/TokenSelectInput";
import SwapPreset from "../../components/SwapPreset";
import useDerivedSwap from "../../hooks/useDerivedSwap";
import SwapConfirmModal from "../../components/SwapConfirmModal";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TxConfirmModal from "../../components/TxConfirmModal";
import { ETHER } from "../../constants/types";
import SwapSettingModal from "../../components/SwapSettingModal";
import { AiFillThunderbolt } from "react-icons/ai";
import SniperConfirmModal from "../../components/SniperConfirmModal";
import useApp from "../../hooks/useApp";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useTokenSymbol from "../../hooks/useTokenSymbol";
import { SWAP_MODES } from "../../constants/trade";
import { getOrderCount } from "../../services/order";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";

function Swap() {
  const navigate = useNavigate();
  const {address} = useAccount()
  const { t } = useTranslation()
  const [txHash, setTxHash] = useState(null)
  const [fixAmounts, setFixAmounts] = useState([])
  const {isOpen: isSwapOpen, onOpen: onSwapOpen, onOpenChange: onSwapOpenChange} = useDisclosure();
  const {isOpen: isSniperOpen, onOpen: onSniperOpen, onOpenChange: onSniperOpenChange} = useDisclosure();
  const {isOpen: isSubmittedOpen, onOpen: onSubmittedOpen, onOpenChange: onSubmittedOpenChange} = useDisclosure();
  const {isOpen: isSettingOpen, onOpen: onSettingOpen, onOpenChange: onSettingOpenChange} = useDisclosure();
  const {customWallet, refreshTime, onAccountOpen} = useApp()

  const [pendingOrderCount, setPendingOrderCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const rsp = await getOrderCount({user: address})
        if (rsp.data.code === 0) {
          setPendingOrderCount(rsp.data.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (address) {
      fetch()
    }
  }, [address, refreshTime]);

  const {
    swapMode,
    router,
    inputTokenAllowance,
    inputTokenApprove,
    inputTokenApproving,
    isNoLiquidity,
    swapMistake,
    networkFee,
    inputCurrency,
    onSelectInputCurrency,
    inputCurrencyBalance,
    outputCurrency,
    onSelectOutputCurrency,
    outputCurrencyBalance,
    amountIn,
    amountOut,
    setAmountIn,
    onSwitchCurrency,
    estimating,
    amounts,
    path,
    gasPrice,
    gasLimit,
    outputReserve
  } = useDerivedSwap()

  const inputCurrencySymbol = useTokenSymbol(inputCurrency)

  const amountInEnough = useMemo(() => {
    if (inputCurrency && amounts.length >= 2) {
      if (inputCurrency === ETHER) {
        return inputCurrencyBalance - networkFee >= amounts[0]
      }
      return inputCurrencyBalance >= amounts[0]
    }
    return null
  }, [inputCurrency, inputCurrencyBalance, amounts, networkFee])

  const onSwapSubmit = useCallback((hash) => {
    setAmountIn('')
    setTxHash(hash)
    onSwapOpenChange()
    onSubmittedOpen()
  }, [onSwapOpenChange, setAmountIn, onSubmittedOpen])

  const onSniperCreate = useCallback(() => {
    setAmountIn('')
    onSniperOpenChange()
    toast.success(t("created"))
    navigate('/swap/orders')
  }, [onSniperOpenChange, setAmountIn, navigate, t])

  const getFooterContent = () => {
    if (swapMode !== SWAP_MODES.ERC314 && inputCurrency !== ETHER && amounts.length >= 2 && inputTokenAllowance <= amounts[0]) {
      return (
        <Button
          size={'lg'}
          className={'w-full disabled:opacity-30 disabled:pointer-events-none'}
          color={"secondary"}
          variant={'flat'}
          isLoading={inputTokenApproving}
          onClick={inputTokenApprove}
        >
          {t("approve")} {inputCurrencySymbol}
        </Button>
      )
    }

    // 闪电交易
    if (swapMode !== SWAP_MODES.ERC314 && (isNoLiquidity || swapMistake)) {
      return (
        <Button
          size={'lg'}
          className={'w-full disabled:grayscale disabled:pointer-events-none'}
          color={"secondary"}
          variant={'flat'}
          disabled={!outputCurrency || !inputCurrency || amountIn <= 0 || amounts.length === 0 || !amountInEnough}
          onClick={() => {
            if (!customWallet) {
              onAccountOpen()
              return
            }
            setFixAmounts(amounts)
            onSniperOpen()
          }}
          startContent={<AiFillThunderbolt/>}
        >
          {amountInEnough === false ? `${inputCurrencySymbol}${t("insufficient")}` : (!customWallet ? t("switch_sub") : t("flash"))}
        </Button>
      )
    }

    return (
      <Button
        size={'lg'}
        className={'w-full disabled:grayscale disabled:pointer-events-none'}
        color={"primary"}
        variant={'flat'}
        disabled={!outputCurrency || !inputCurrency || amountIn <= 0 || amounts.length === 0 || !amountInEnough || isNoLiquidity || swapMistake}
        onClick={() => {
          setFixAmounts(amounts)
          onSwapOpen()
        }}
      >
        {amountInEnough === false ? `${inputCurrencySymbol}${t("insufficient")}` : t("swap")}
      </Button>
    )
  }

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <Card>
        <CardHeader className="flex justify-between">
          <div className={'flex flex-col'}>
            <p className="text-md">
              {t("swap")}
            </p>
          </div>
          <div className={'flex gap-2'}>
            <Tooltip showArrow content={t("slippage")}>
              <Button
                color={'default'}
                variant={'light'}
                size={'sm'}
                isIconOnly
                onClick={onSettingOpen}
              >
                <FiSettings size={18}/>
              </Button>
            </Tooltip>
            <Badge content={pendingOrderCount} isInvisible={pendingOrderCount <= 0} color="success">
              <Button
                color={'default'}
                variant={'light'}
                size={'sm'}
                isIconOnly
                onClick={() => navigate('/swap/orders')}
              >
                <AiFillThunderbolt size={18}/>
              </Button>
            </Badge>
          </div>
        </CardHeader>

        <CardBody>
          <TokenSelectInput
            label={t("payment")}
            selectedCurrency={inputCurrency}
            onSelect={onSelectInputCurrency}
            currencyBalance={inputCurrencyBalance}
            amount={amountIn}
            onAmountChange={setAmountIn}
            networkFee={networkFee}
          />

          <div className={'h-[18px] relative'}>
            <div className={'w-full -mt-1.5 flex justify-center'}>
              <Button
                radius={'full'}
                size={'sm'}
                isIconOnly
                className={'p-1 w-fit h-fit m-0 min-w-0 bg-white shadow-lg text-primary'}
                onClick={onSwitchCurrency}
              >
                <FiArrowDown className={'transition active:rotate-180'} size={20}/>
              </Button>
            </div>
          </div>

          <TokenSelectInput
            label={t("take")}
            selectedCurrency={outputCurrency}
            onSelect={onSelectOutputCurrency}
            currencyBalance={outputCurrencyBalance}
            disabled={true}
            amount={amountOut}
          />

          <div className={'mt-4'}>
            <SwapPreset
              inputCurrency={inputCurrency}
              outputCurrency={outputCurrency}
              estimating={estimating}
              amounts={amounts}
              networkFee={networkFee}
              gasPrice={gasPrice}
              isNoLiquidity={isNoLiquidity}
              swapMistake={swapMistake}
              outputReserve={outputReserve}
              inputCurrencySymbol={inputCurrencySymbol}
              swapMode={swapMode}
            />
          </div>
        </CardBody>

        <CardFooter>
          {getFooterContent()}
        </CardFooter>
      </Card>

      {
        fixAmounts.length >= 2 && outputCurrency && inputCurrency ? (
          <SwapConfirmModal
            router={router}
            path={path}
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            fixAmounts={fixAmounts}
            isOpen={isSwapOpen}
            onOpenChange={onSwapOpenChange}
            onSubmit={onSwapSubmit}
            networkFee={networkFee}
            gasPrice={gasPrice}
            gasLimit={gasLimit}
            outputReserve={outputReserve}
            swapMode={swapMode}
          />
        ) : null
      }

      {
        fixAmounts.length >= 2 && outputCurrency && inputCurrency ? (
          <SniperConfirmModal
            router={router}
            path={path}
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            fixAmounts={fixAmounts}
            isOpen={isSniperOpen}
            onOpenChange={onSniperOpenChange}
            onSubmit={onSniperCreate}
            networkFee={networkFee}
            gasPrice={gasPrice}
            gasLimit={gasLimit}
            outputReserve={outputReserve}
          />
        ) : null
      }

      <TxConfirmModal
        hash={txHash}
        isOpen={isSubmittedOpen}
        onOpenChange={onSubmittedOpenChange}
      />

      <SwapSettingModal
        isOpen={isSettingOpen}
        onOpenChange={onSettingOpenChange}
      />
    </div>
  )
}

export default Swap