import Badge from "../../../components/Badge";
import { formatAmount } from "../../../utils/amount";
import React from "react";
import { useTranslation } from "react-i18next";

const Stats = ({ticker}) => {
  const {t} = useTranslation()

  return (
    <div className={'grid lg:flex md:grid-cols-4 grid-cols-2 gap-2 text-xs md:text-sm'}>
      <Badge><span>{t("volume24h")}:</span> {formatAmount(ticker.volume24h)}</Badge>
      <Badge><span>{t("amount24h")}:</span> ${formatAmount(ticker.amount24h)}</Badge>
      <Badge><span>{t("low24h")}:</span> ${formatAmount(ticker.low24h)}</Badge>
      <Badge><span>{t("high24h")}:</span> ${formatAmount(ticker.high24h)}</Badge>
      <Badge><span>{t("open24h")}:</span> ${formatAmount(ticker.open24h)}</Badge>
      <Badge><span>{t("txCount24h")}:</span> {ticker.txCount24h}</Badge>
    </div>
  )
}

export default Stats