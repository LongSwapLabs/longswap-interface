import { currencyEquals } from "../../utils/trade";
import { TokenLogo } from "../TokenLogo";
import useIsCustomToken from "../../hooks/useIsCustomToken";
import { useMemo } from "react";
import { Button, ScrollShadow } from "@nextui-org/react";
import useApp from "../../hooks/useApp";

function CurrencyRow({tokenList, token, selected, onSelect}) {
  const isCustomToken = useIsCustomToken(token)
  const {addCustomToken, removeCustomToken} = useApp()

  const isOnTokenList = useMemo(() => {
    return tokenList.find(e => currencyEquals(e, token))
  }, [tokenList, token])

  return (
    <div
      className={`flex justify-between items-center p-2 transition rounded-xl cursor-pointer ${selected ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-100'}`}
      onClick={() => onSelect(token)}
    >
      <div className={'flex items-center gap-2'}>
        <div className={'w-8 h-8 rounded-full bg-zinc-300'}>
          <TokenLogo token={token} height={32} width={32}/>
        </div>

        <div className={'flex flex-col'}>
          <p>{token.symbol}</p>
          <p className={'text-xs text-slate-500'}>{token.name}</p>
        </div>
      </div>

      {
        (!isOnTokenList && isCustomToken) ? (
          <Button
            color={'danger'}
            radius={'full'}
            variant={'flat'}
            className={'h-fit py-1'}
            onClick={() => removeCustomToken(token)}
          >
            删除
          </Button>
        ) : null
      }

      {
        (!isOnTokenList && !isCustomToken) ? (
          <Button
            color={'success'}
            radius={'full'}
            variant={'flat'}
            className={'h-fit py-1'}
            onClick={() => addCustomToken(token)}
          >
            添加
          </Button>
        ) : null
      }
    </div>
  )
}

function CurrencyList({currencies, tokenList, selectedCurrency, onSelect}) {
  return (
    <ScrollShadow className={'flex flex-col max-h-[calc(100vh_-_240px)]'}>
      {currencies.map(token => {
        const selected = currencyEquals(token, selectedCurrency)

        return (
          <CurrencyRow
            key={token.address}
            token={token}
            selected={selected}
            onSelect={onSelect}
            tokenList={tokenList}
          />
        )
      })}
    </ScrollShadow>
  )
}

export default CurrencyList