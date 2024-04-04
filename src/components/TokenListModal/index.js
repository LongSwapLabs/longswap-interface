import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@nextui-org/react";
import SearchInput from "./SearchInput";
import CommonBases from "./CommonBases";
import useAllTokens from "../../hooks/useAllTokens";
import CurrencyList from "./CurrencyList";
import { useCallback, useMemo, useState } from "react";
import useToken from "../../hooks/useToken";
import { getAddress, isAddress } from "viem";
import { filterTokens } from "./filtering";
import useTokenList from "../../hooks/useTokenList";
import { useTranslation } from "react-i18next";

function TokenListModal({selectedCurrency, onSelect, isOpen, onOpenChange}) {
  const tokenList = useTokenList()
  const allTokens = useAllTokens()
  const {t} = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')

  const searchToken = useToken(searchQuery)

  const filteredTokens = useMemo(() => {
    if (isAddress(searchQuery)) return searchToken ? [searchToken] : []
    return filterTokens(allTokens, searchQuery)
  }, [searchToken, allTokens, searchQuery])

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksumInput = isAddress(input)
    setSearchQuery(checksumInput ? getAddress(input) : input)
  }, [])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className={'pb-2 font-medium'}>
          {t("select_token")}
        </ModalHeader>
        <ModalBody>
          <SearchInput
            value={searchQuery}
            onChange={handleInput}
          />
          <CommonBases selectedCurrency={selectedCurrency} onSelect={onSelect}/>
        </ModalBody>
        <Divider/>
        <ModalFooter className={'flex-col justify-center'}>
          <CurrencyList
            currencies={filteredTokens}
            selectedCurrency={selectedCurrency}
            onSelect={onSelect}
            tokenList={tokenList}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TokenListModal