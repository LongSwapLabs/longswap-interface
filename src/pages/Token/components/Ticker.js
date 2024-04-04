import { useSelector } from "react-redux";
import { formatAmount } from "../../../utils/amount";
import { Card, CardBody, CardHeader, cn, useDisclosure } from "@nextui-org/react";
import { TokenLogo } from "../../../components/TokenLogo";
import Decimal from "decimal.js";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import Stats from "./Stats";
import { AnimatePresence, motion, useWillChange } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { TRANSITION_VARIANTS } from "@nextui-org/framer-transitions";
import React from "react";
import CopyHelper from "../../../components/CopyHelper";

const Ticker = () => {
  const ticker = useSelector(state => state.trade.ticker);
  const willChange = useWillChange()
  const {isOpen, onOpenChange} = useDisclosure()

  return (
    <div>
      <Card classNames={{
        header: 'px-0',
        body: 'px-0'
      }} shadow={'none'}>
        <CardHeader className={'flex items-center gap-2'}>
          <TokenLogo width={24} height={24} token={ticker}/>
          <h1 className={'text-lg'}>
            {ticker.name} <span className={'text-sm text-zinc-500 ps-1 font-medium'}>{ticker.symbol}</span>
          </h1>
          <CopyHelper text={ticker.address}/>
        </CardHeader>
        <CardBody className={'py-2 gap-2'}>
          <div className={'flex justify-between items-center'}>
            <div className={'flex items-center gap-3'}>
              <h1 className="text-4xl space-x-1">
                <span className="me-1.5 text-sm text-zinc-600">$</span>
                {formatAmount(ticker.price)}
              </h1>
              <div className={'flex flex-col justify-center'}>
                <div
                  className={cn('font-semibold text-sm flex items-center', ticker.rate24h > 0 ? 'text-green-600' : 'text-danger')}>
                  {ticker.rate24h > 0 ? <FaCaretUp/> : <FaCaretDown/>}
                  <span>{new Decimal(ticker.rate24h).abs().toDP(2).toJSON()}%</span>
                </div>
                <div className={'text-xs text-zinc-500'}>{formatAmount(ticker.priceEther)} BNB</div>
              </div>
            </div>
            <div className={'hidden lg:flex'}>
              <Stats ticker={ticker}/>
            </div>
          </div>

          <div className={'lg:hidden'}>
            <div className={'w-full -mt-2 transition rounded-lg cursor-pointer flex justify-center'}
                 onClick={onOpenChange}>
              <div className={'text-sm flex justify-between gap-2'}>
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
                  <Stats ticker={ticker}/>
                </motion.section>
              )
              }
            </AnimatePresence>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default Ticker