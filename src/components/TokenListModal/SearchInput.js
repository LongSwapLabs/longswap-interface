import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";

function SearchInput({value, onChange}) {
  const {t} = useTranslation()
  return (
    <div className={'flex items-center w-full px-4 border rounded-xl'}>
      <FiSearch size={18}/>
      <input
        value={value}
        onChange={onChange}
        className={'w-full px-2 h-10 font-sans text-medium outline-none rounded-none bg-transparent text-default-700 placeholder-default-500'}
        placeholder={t("enter_token_symbol")}
      />
    </div>
  )
}

export default SearchInput