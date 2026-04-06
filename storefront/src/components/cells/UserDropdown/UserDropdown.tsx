"use client"

import {
  Badge,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProfileIcon } from "@/icons"
import { useUnreads } from "@talkjs/react"
import { useState } from "react"
import { useTranslations } from 'next-intl'

export const UserDropdown = ({
  isLoggedIn,
}: {
  isLoggedIn: boolean
}) => {
  const [open, setOpen] = useState(false)
  const t = useTranslations('header')
  const tCommon = useTranslations('common')

  const unreads = useUnreads()

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href={isLoggedIn ? "/user" : "/login"}
        className="relative"
        aria-label={t('goToProfile')}
      >
        <ProfileIcon size={20} />
      </LocalizedClientLink>
      <Dropdown show={open}>
        {isLoggedIn ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                {t('yourAccount')}
              </h3>
            </div>
            <NavigationItem href="/user/orders">{tCommon('orders')}</NavigationItem>
            <NavigationItem href="/user/messages" className="relative">
              {tCommon('messages')}
              {Boolean(unreads?.length) && (
                <Badge className="absolute top-3 start-24 w-4 h-4 p-0">
                  {unreads?.length}
                </Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/returns">{tCommon('returns')}</NavigationItem>
            <NavigationItem href="/user/addresses">{tCommon('addresses')}</NavigationItem>
            <NavigationItem href="/user/reviews">{tCommon('reviews')}</NavigationItem>
            <NavigationItem href="/user/wishlist">{tCommon('wishlist')}</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">{tCommon('settings')}</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">{tCommon('login')}</NavigationItem>
            <NavigationItem href="/register">{tCommon('register')}</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
