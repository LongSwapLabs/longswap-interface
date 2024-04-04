import { Button } from "@nextui-org/react";
import { TokenLogo } from "../TokenLogo";
import { useAccount } from "wagmi";
import { SUGGESTED_BASES } from "../../constants/tokens";
import { ETHER } from "../../constants/types";
import { currencyEquals } from "../../utils/trade";

function CommonBases({selectedCurrency, onSelect}) {
  const {chain} = useAccount()

  return (
    <div className={'grid grid-cols-3 sm:grid-cols-4 gap-2'}>
      <Button
        variant={'ghost'}
        startContent={
          <div className={'flex justify-between items-center w-6 h-6 rounded-full bg-zinc-300'}>
            <TokenLogo token={ETHER} height={24} width={24}/>
          </div>
        }
        radius={'md'}
        className={'border-1 text-medium py-1 px-2 h-fit disabled:opacity-60 disabled:pointer-events-none'}
        disabled={selectedCurrency === ETHER}
        onClick={() => {
          onSelect && onSelect(ETHER)
        }}
      >
        {chain ? chain.nativeCurrency.symbol : 'Unknown'}
      </Button>

      {
        (chain ? SUGGESTED_BASES[chain.id] : []).map(token => {
          const selected = currencyEquals(token, selectedCurrency)
          return (
            <Button
              key={token.address}
              variant={'ghost'}
              startContent={
                <div className={'flex justify-between items-center w-6 h-6 rounded-full bg-zinc-300'}>
                  <TokenLogo token={token} height={24} width={24}/>
                </div>
              }
              radius={'md'}
              className={'border-1 text-medium py-1 px-2 h-fit disabled:opacity-60 disabled:pointer-events-none'}
              onClick={() => {
                onSelect && onSelect(token)
              }}
              disabled={selected}
            >
              {token.symbol}
            </Button>
          )
        })
      }
    </div>
  )
}

export default CommonBases