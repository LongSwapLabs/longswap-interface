import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import useApp from "../../hooks/useApp";
import { useMemo } from "react";
import SettingRow from "./SettingRow";
import { FaGasPump } from "react-icons/fa";
import { FaSliders } from "react-icons/fa6";
import { HiReceiptTax } from "react-icons/hi";
import { MdReviews } from "react-icons/md";
import { useTranslation } from "react-i18next";

const slippageOptions = [
  0.5,
  5,
  10
]

const taxOptions = [
  0,
  5,
  10
]

const addGasPriceOptions = [
  0,
  10,
  50
]

function SwapSettingModal({isOpen, onOpenChange}) {
  const {
    taxRate,
    onSetTaxRate,
    slippageRate,
    onSetSlippage,
    addGasPrice,
    onSetAddGasPrice,
    taxSellRate,
    onSetTaxSellRate
  } = useApp()

  const { t } = useTranslation()

  const taxPercent = useMemo(() => {
    return parseFloat(taxRate) / 1000 * 100
  }, [taxRate])

  const taxSellPercent = useMemo(() => {
    return parseFloat(taxSellRate) / 1000 * 100
  }, [taxSellRate])

  const slippagePercent = useMemo(() => {
    return parseFloat(slippageRate) / 1000 * 100
  }, [slippageRate])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className={'pb-2 font-medium'}>
          {t("settings")}
        </ModalHeader>
        <ModalBody className={'gap-4'}>
          <SettingRow
            icon={<FaSliders className={'text-foreground'} size={18}/>}
            label={t("max_slippage")}
            value={slippagePercent}
            options={slippageOptions}
            onChange={(e) => {
              const value = parseFloat(e)
              if (value <= 100 && value >= 0 && !isNaN(value)) {
                onSetSlippage(value * 10)
              }
            }}
          />

          <SettingRow
            icon={<HiReceiptTax className={'text-foreground'} size={18}/>}
            label={t("rate")}
            value={taxPercent}
            options={taxOptions}
            onChange={(e) => {
              const value = parseFloat(e)
              if (value <= 100 && value >= 0 && !isNaN(value)) {
                onSetTaxRate(value * 10)
              }
            }}
          />

          <SettingRow
            icon={<MdReviews className={'text-foreground'} size={18}/>}
            label={t("sell_tax")}
            value={taxSellPercent}
            options={taxOptions}
            onChange={(e) => {
              const value = parseFloat(e)
              if (value <= 100 && value >= 0 && !isNaN(value)) {
                onSetTaxSellRate(value * 10)
              }
            }}
          />

          <SettingRow
            icon={<FaGasPump className={'text-foreground'} size={18}/>}
            label={t("gas")}
            value={addGasPrice}
            options={addGasPriceOptions}
            symbol={'gwei'}
            onChange={(e) => {
              const value = parseFloat(e)
              if (!isNaN(value)) {
                onSetAddGasPrice(value)
              } else {
                onSetAddGasPrice(0)
              }
            }}
          />
        </ModalBody>

        <ModalFooter>

        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SwapSettingModal