import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { FiChevronDown } from "react-icons/fi";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

function SwitchLang() {
  const {i18n} = useTranslation()

  const languages = useMemo(() => {
    return [
      {key: 'en', label: 'English'},
      {key: 'zh_cn', label: '简体中文'},
    ]
  }, [])

  const language = useMemo(() => {
    return languages.find(e => e.key === i18n.language)
  }, [i18n.language, languages])

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className={'hidden md:flex gap-0.5'}
          radius={'lg'}
          variant="light"
          endContent={<FiChevronDown/>}
        >
          {language && language.label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        selectionMode="single"
        selectedKeys={[language.key]}
        onSelectionChange={e => {
          i18n.changeLanguage(e.currentKey)
        }}
      >
        {
          languages.map(e => (
            <DropdownItem key={e.key}>
              {e.label}
            </DropdownItem>
          ))
        }
      </DropdownMenu>
    </Dropdown>
  )
}

export default SwitchLang