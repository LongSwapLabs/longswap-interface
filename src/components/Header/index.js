import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link, NavbarMenu, NavbarMenuItem, Button, NavbarMenuToggle,
  Select,
  SelectItem
} from "@nextui-org/react";
import Connect from "../Connect";
import Logo from "../Logo";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLang } from "../../utils/lang";

function Header() {
  const location = useLocation()
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {i18n, t} = useTranslation()

  const menuItems = [
    {path: '/swap', label: t("swap")},
    {path: '/launchpad', label: t("launch")},
    {path: '/factory', label: t("factory")},
    {path: '/markets', label: t("markets")},
    {path: '/staking', label: t("staking")},
    {path: '/farm', label: t("farm")},
    {path: '/bridge', label: t("bridge")},
  ];

  const changeLanguage = ([lng]) => {
    i18n.changeLanguage(lng);
    setLang(lng)
  }

  return (
    <Navbar maxWidth={'xl'}
            isBordered={false}
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            classNames={{
              wrapper: 'px-4'
            }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden outline-none"
        />
        <NavbarItem>
          <NavbarBrand>
            <Logo/>
            <Link className="font-bold text-inherit dark:text-white text-lg pl-1" href={'/'}>
              LongSwap
            </Link>
          </NavbarBrand>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-4 justify-start items-center" justify={"center"}>
        {menuItems.map((item) => (
          <NavbarItem key={item.label}>
            <Link size={'sm'} color={location.pathname.indexOf(item.path) >= 0 ? 'primary' : 'foreground'} isBlock
                  href={item.path}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Select
            selectionMode="single"
            selectedKeys={[i18n.language]}
            label=" "
            labelPlacement="outside"
            className="hidden md:block w-[7rem] !mt-0"
            onSelectionChange={changeLanguage}>
            <SelectItem key="en">English</SelectItem>
            <SelectItem key="zh">简体中文</SelectItem>
          </Select>
        </NavbarItem>
        <NavbarItem>
          <Connect/>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.label}>
            <Button
              variant={'flat'}
              radius={'full'}
              color={location.pathname === item.path ? 'primary' : 'foreground'}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.path)
                setIsMenuOpen(false)
              }}
            >
              {item.label}
            </Button>
          </NavbarMenuItem>
        ))}

        <Select
          selectionMode="single"
          selectedKeys={[i18n.language]}
          label=" "
          labelPlacement="outside"
          className="w-full !mt-0"
          onSelectionChange={changeLanguage}>
          <SelectItem key="en">English</SelectItem>
          <SelectItem key="zh">简体中文</SelectItem>
        </Select>
      </NavbarMenu>
    </Navbar>
  )
}

export default Header