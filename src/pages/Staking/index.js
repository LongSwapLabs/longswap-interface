import React, { useCallback, useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import useStakingAccount from "../../hooks/useStakingAccount";
import { Account } from "./components/Account";
import { InputAmount } from "./components/InputAmount";
import { STAKING, X314 } from "../../constants";
import { Token } from "../../constants/types";
import useAllowance from "../../hooks/useAllowance";
import { useClient, useWriteContract } from "wagmi";
import stakingAbi from "../../assets/abis/Staking.json";
import { parseUnits } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useTranslation } from "react-i18next";
import { FiGift } from "react-icons/fi";
import { getReferrerFromLocal } from "../../utils/referrer";
import { ZeroAddress } from "ethers";
import { Share } from "./components/Share";

function Staking() {
  const {t} = useTranslation()
  const x314 = new Token(56, X314, 18, 'X314', 'X-314')
  const [amount, setAmount] = useState('')
  const account = useStakingAccount()

  const [depositing, setDepositing] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [loitering, setLoitering] = useState(false)
  const {writeContractAsync} = useWriteContract()
  const client = useClient()

  const {
    value: allowance,
    approve,
    loading: approving
  } = useAllowance(x314, STAKING)

  const onDeposit = useCallback(async () => {
    setDepositing(true)
    try {
      const hash = await writeContractAsync({
        abi: stakingAbi,
        address: STAKING,
        functionName: 'depositByReferrer',
        args: [
          parseUnits(amount, 18),
          getReferrerFromLocal() || ZeroAddress
        ]
      })

      await waitForTransactionReceipt(client, {
        hash,
        confirmations: 1,
      })

      setAmount('')
    } catch (e) {
      console.log(e)
    } finally {
      setDepositing(false)
    }
  }, [amount, client, writeContractAsync])

  const onClaim = useCallback(async () => {
    setClaiming(true)
    try {
      const hash = await writeContractAsync({
        abi: stakingAbi,
        address: STAKING,
        functionName: 'claim',
      })

      await waitForTransactionReceipt(client, {
        hash,
        confirmations: 1,
      })
    } catch (e) {
      console.log(e)
    } finally {
      setClaiming(false)
    }
  }, [client, writeContractAsync])

  const onLottery = useCallback(async () => {
    setLoitering(true)
    try {
      const hash = await writeContractAsync({
        abi: stakingAbi,
        address: STAKING,
        functionName: 'tryLottery',
        gas: 250000,
      })

      await waitForTransactionReceipt(client, {
        hash,
        confirmations: 1,
      })
    } catch (e) {
      console.log(e)
    } finally {
      setLoitering(false)
    }
  }, [client, writeContractAsync])

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <Card>
        <CardHeader className="flex justify-between">
          <div className={'flex flex-col'}>
            <p className="text-md">
              {t("staking_mining")}
            </p>
          </div>
          <div>
            <Share/>
          </div>
        </CardHeader>
        <CardBody className={'space-y-8'}>
          <Account account={account}/>
          <InputAmount x314={x314} amount={amount} setAmount={setAmount}/>
        </CardBody>
        <CardFooter className={'space-y-4 flex-col'}>
          <div className={'w-full flex space-x-4'}>
            {
              allowance <= 0 || (amount > 0 && !isNaN(Number(amount)) && parseUnits(amount, x314.decimals) > allowance) ? (
                <Button
                  color={'warning'}
                  className={'w-full'}
                  size={'lg'}
                  variant={'flat'}
                  isLoading={approving}
                  onClick={approve}
                >
                  {t("approve")}
                </Button>
              ) : (
                <Button
                  color={'primary'}
                  className={'w-full disabled:pointer-events-none disabled:grayscale'}
                  size={'lg'}
                  variant={'flat'}
                  isLoading={depositing}
                  onClick={onDeposit}
                  disabled={amount <= 0}
                >
                  {account && account.total > 0 ? t("add") : t("start")}
                </Button>
              )
            }
            {
              account && account.total > 0 ? (
                <Button
                  color={'secondary'}
                  className={'w-full disabled:pointer-events-none disabled:grayscale'}
                  size={'lg'}
                  variant={'flat'}
                  isLoading={claiming}
                  disabled={account.pending <= 0}
                  onClick={onClaim}
                >
                  {t("receive")}
                </Button>
              ) : null
            }
          </div>

          {
            account ? (
              <Button
                color={'danger'}
                className={'w-full disabled:pointer-events-none disabled:grayscale'}
                size={'lg'}
                variant={'flat'}
                isLoading={loitering}
                disabled={account.hasLotteryToday || !account.lotteryEnable}
                onClick={onLottery}
                startContent={<FiGift/>}
              >
                {t("lottery")}
              </Button>
            ) : null
          }
        </CardFooter>
      </Card>
    </div>
  )
}

export default Staking