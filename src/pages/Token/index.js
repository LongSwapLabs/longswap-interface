import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { checksumAddress, isAddress } from "viem";
import { getSwaps, getToken } from "../../services/token";
import store from "../../store";
import { setSwaps, setToken } from "../../store/reducers/trade";
import TradeChart from "../../components/TradeChart";
import Ticker from "./components/Ticker";
import { useSelector } from "react-redux";
import Swaps from "./components/Swaps";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useTranslation } from "react-i18next";

const Token = () => {
  const { t } = useTranslation()
  const {address} = useParams()
  const token = useSelector(state => state.trade.token);

  // 初始化代币信息
  useEffect(() => {
    const fetch = async () => {
      try {
        const rsp = await getToken(checksumAddress(address));
        if (rsp.data.code === 0) {
          store.dispatch(setToken(rsp.data.data));
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (isAddress(address)) {
      fetch();
    }
  }, [address]);

  // 初始化交易记录
  useEffect(() => {
    const fetch = async () => {
      try {
        const rsp = await getSwaps(token.address, {limit: 50});
        if (rsp.data.code === 0) {
          store.dispatch(setSwaps(rsp.data.data));
        }
      } catch (e) {
        console.log(e);
      }
    };

    if (token) {
      fetch();
    }
  }, [token]);

  return (
    <div className={'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2'}>
      <Breadcrumbs size={'lg'} className={'my-6'}>
        <BreadcrumbItem href={'/'}>{t("home")}</BreadcrumbItem>
        <BreadcrumbItem href={'/markets'}>{t("markets")}</BreadcrumbItem>
        <BreadcrumbItem>{t("token")}</BreadcrumbItem>
      </Breadcrumbs>

      {
        token ? (
          <div className={'flex flex-col gap-4'}>
            <Ticker/>
            <TradeChart/>
            <Swaps/>
          </div>
        ) : null
      }
    </div>
  )
}

export default Token