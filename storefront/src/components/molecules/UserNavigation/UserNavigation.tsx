"use client"
import {
  Badge,
  Card,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { useUnreads } from "@talkjs/react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

export const UserNavigation = () => {
  const unreads = useUnreads()
  const path = usePathname()
  const t = useTranslations('common')

  const navigationItems = [
    { key: 'orders',    href: "/user/orders" },
    { key: 'messages',  href: "/user/messages" },
    { key: 'returns',   href: "/user/returns" },
    { key: 'addresses', href: "/user/addresses" },
    { key: 'reviews',   href: "/user/reviews" },
    { key: 'wishlist',  href: "/user/wishlist" },
  ]

  return (
    <Card className="h-min">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.key}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {t(item.key as any)}
          {item.key === 'messages' && Boolean(unreads?.length) && (
            <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
              {unreads?.length}
            </Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem href="/user/settings" active={path === "/user/settings"}>
        {t('settings')}
      </NavigationItem>
      <LogoutButton className="w-full text-left" />
    </Card>
  )
}
