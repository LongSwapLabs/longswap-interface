import {
  FiAlertTriangle,
  FiArrowUpCircle, FiChevronDown, FiChevronsRight,
  FiClock,
  FiMoreHorizontal,
  FiXCircle,
  FiZap
} from "react-icons/fi";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip, Skeleton,
  useDisclosure
} from "@nextui-org/react";
import { formatAmount } from "../../utils/amount";
import useApp from "../../hooks/useApp";
import { cancelOrder, getOrders, removeOrder } from "../../services/order";
import toast from "react-hot-toast";
import { useAccount, useSignMessage } from "wagmi";
import { AnimatePresence, useWillChange, motion } from "framer-motion";
import { TRANSITION_VARIANTS } from "@nextui-org/framer-transitions";
import { shortAddress } from "../../utils/address";
import dayjs from "dayjs";
import CardHeaderTitle from "../../components/CardHeaderTitle";
import { AiFillThunderbolt } from "react-icons/ai";
import CopyHelper from "../../components/CopyHelper";
import { useTranslation } from "react-i18next";

const STATUS = {
  0: {text: '挂起中', color: 'warning', icon: <FiClock/>},
  1: {text: '运行中', color: 'success', icon: <FiZap/>},
  2: {text: '已关闭', color: 'default', icon: <FiXCircle/>},
}

const TX_STATUS = {
  0: {text: '交易未执行', color: 'default', icon: <FiMoreHorizontal/>},
  1: {text: '交易已提交', color: 'success', icon: <FiArrowUpCircle/>},
  2: {text: '交易已出错', color: 'warning', icon: <FiAlertTriangle/>},
}

function OrderRow({order, onRemove, onCancel}) {
  const willChange = useWillChange()
  const {isOpen, onOpenChange} = useDisclosure()
  const {t} = useTranslation()

  const status = useMemo(() => {
    return STATUS[order.status]
  }, [order])

  const txStatus = useMemo(() => {
    return TX_STATUS[order.txStatus]
  }, [order])

  const [loading, setLoading] = useState(false)

  return (
    <div
      className={'w-full border-1 rounded-xl p-3 flex flex-col gap-4'}
    >
      <div className={'flex flex-col gap-2.5'}>
        <div className={'flex justify-between items-center'}>
          <div className={'text-sm flex flex-col'}>
            <span className={'font-semibold'}>{order.id}</span>
            <span className={'text-zinc-400 '}>{dayjs(order.createdAt).fromNow()}</span>
          </div>
          <Chip
            startContent={status.icon}
            size={'sm'}
            color={status.color}
            variant={'flat'}
            className={'px-2'}
          >
            {status.text}
            {order.status === 0 ? `：将在${dayjs(order.pendingAt).fromNow()}启动` : null}
          </Chip>
        </div>

        <div className={'text-medium flex justify-between items-center'}>
          <div className={'w-full flex flex-col'}>
            <span>{formatAmount(order.amountIn)}</span>
            <span className={'text-slate-500 text-sm'}>{order.fromTokenSymbol}</span>
          </div>

          <div>
            <FiChevronsRight size={24}/>
          </div>

          <div className={'w-full flex flex-col items-end'}>
            <span>{formatAmount(order.amountOut)}</span>
            <span className={'text-slate-500 text-sm'}>{order.tokenSymbol}</span>
          </div>
        </div>

        <div className={'flex justify-between items-center'}>
          <div className={'flex gap-1'}>
            <Chip
              startContent={txStatus.icon}
              size={'sm'}
              color={txStatus.color}
              variant={'flat'}
            >
              {txStatus.text}
            </Chip>
          </div>
          {
            (order.status === 0 || order.status === 1) ? (
              <Button
                variant={'flat'}
                size={'sm'}
                radius={'full'}
                color={'primary'}
                className={'p-1 h-fit cursor-pointer'}
                onClick={async () => {
                  setLoading(true)
                  await onCancel(order)
                  setLoading(false)
                }}
                isLoading={loading}
              >取消</Button>
            ) : (
              <Button
                variant={'flat'}
                size={'sm'}
                radius={'full'}
                className={'p-1 h-fit cursor-pointer'}
                onClick={async () => {
                  setLoading(true)
                  await onRemove(order)
                  setLoading(false)
                }}
                isLoading={loading}
              >删除</Button>
            )
          }
        </div>
      </div>

      <div className={'w-full transition rounded-lg hover:bg-zinc-100 cursor-pointer py-1 flex justify-center'}
           onClick={onOpenChange}>
        <div className={'text-sm flex justify-between gap-2'}>
          更多信息
          <FiChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} size={18}/>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            key="accordion-content"
            animate="enter"
            exit="exit"
            initial="exit"
            style={{overflowY: "hidden", willChange}}
            variants={TRANSITION_VARIANTS.collapse}
          >
            <div className={'flex flex-col gap-2 text-sm'}>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  子钱包
                </div>
                <div>
                  {shortAddress(order.account)}
                </div>
              </div>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  {t("Slippage")}
                </div>
                <div>
                  {order.slippage}%
                </div>
              </div>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  买税
                </div>
                <div>
                  {order.buyTax}%
                </div>
              </div>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  卖税检查
                </div>
                <div>
                  {order.sellTax}%
                </div>
              </div>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  Gas价格
                </div>
                <div>
                  {order.gasPrice} gwei
                </div>
              </div>
              <div className={'flex justify-between'}>
                <div className="text-slate-500">
                  计划时间
                </div>
                <div>
                  {dayjs(order.pendingAt).format('YYYY/MM/DD HH:mm:ss')}
                </div>
              </div>
              <div className={'flex justify-between items-center'}>
                <div className="text-slate-500">
                  交易哈希
                </div>
                <div>
                  {order.txHash ? (
                    <div className={'flex items-center gap-1'}>
                      <span>{shortAddress(order.txHash)}</span>
                      <CopyHelper text={order.txHash}/>
                    </div>
                  ) : '-'}
                </div>
              </div>
              <div className={'flex justify-between items-center'}>
                <div className="text-slate-500 w-2/5">
                  错误信息
                </div>
                <div>
                  {order.txError || '-'}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

function Orders() {
  const {refreshTime} = useApp()
  const [orders, setOrders] = useState(null)
  const {chainId, address} = useAccount()
  const {signMessageAsync} = useSignMessage()
  const {t} = useTranslation()

  const fetch = useCallback(async () => {
    try {
      const rsp = await getOrders({
        chainId: chainId,
        user: address,
      })
      if (rsp.data.code === 0) {
        setOrders(rsp.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }, [chainId, address])

  useEffect(() => {
    if (chainId && address) {
      fetch()
    }
  }, [address, chainId, fetch, refreshTime]);

  const remove = useCallback(async (order) => {
    try {
      const timestamp = parseInt(Date.now() / 1000)
      const message = `Remove Order
ID: ${order.id}
Timestamp: ${timestamp}`

      const sig = await signMessageAsync({
        message,
      })

      const rsp = await removeOrder({
        id: order.id,
        timestamp,
        sig
      })
      if (rsp.data.code === 0) {
        toast.success('删除成功')
        fetch()
      } else {
        toast.error(rsp.data.message)
      }
    } catch (e) {
      console.log(e)
    }
  }, [fetch, signMessageAsync])

  const cancel = useCallback(async (order) => {
    try {
      const timestamp = parseInt(Date.now() / 1000)
      const message = `Cancel Order
ID: ${order.id}
Timestamp: ${timestamp}`

      const sig = await signMessageAsync({
        message,
      })

      const rsp = await cancelOrder({
        id: order.id,
        timestamp,
        sig
      })
      if (rsp.data.code === 0) {
        toast.success('取消成功')
        await fetch()
      } else {
        toast.error(rsp.data.message)
      }
    } catch (e) {
      console.log(e)
    }
  }, [fetch, signMessageAsync])

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <Card>
        <CardHeader>
          <CardHeaderTitle title={t("flash_order")} back={'/swap'}/>
        </CardHeader>

        <CardBody className={'gap-2'}>
          {
            orders && orders.map(order => (
              <OrderRow
                key={order.id}
                onRemove={remove}
                onCancel={cancel}
                order={order}
              />
            ))
          }
          {
            (orders && orders.length === 0) && (
              <div className={'flex flex-col w-full space-y-4 my-32 justify-center items-center'}>
                <AiFillThunderbolt className={'text-slate-400'} size={32}/>
                <div className={'text-sm text-slate-500'}>
                  {t("no_lightning")}
                </div>
              </div>
            )
          }
          {
            !orders && (
              <div className={'space-y-5 p-4'}>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>
                <div className="space-y-3">
                  <Skeleton className="w-3/5 rounded-lg">
                    <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                  </Skeleton>
                  <Skeleton className="w-4/5 rounded-lg">
                    <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                  </Skeleton>
                  <Skeleton className="w-2/5 rounded-lg">
                    <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                  </Skeleton>
                </div>
              </div>
            )
          }
        </CardBody>
      </Card>
    </div>
  )
}

export default Orders