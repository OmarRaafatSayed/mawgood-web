'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useTranslations } from 'next-intl'
import { HomeIcon, SearchIcon, CartIcon, ProfileIcon, HeartIcon, StoreIcon } from '@/icons'

interface BottomNavbarProps {
  isLoggedIn?: boolean
  cartItemsCount?: number
  wishlistCount?: number
}

export function BottomNavbar({
  isLoggedIn = false,
  cartItemsCount = 0,
  wishlistCount = 0
}: BottomNavbarProps) {
  const pathname = usePathname()
  const params = useParams()
  const [activePath, setActivePath] = useState('/')
  const t = useTranslations('common')
  const vendorT = useTranslations('vendor')

  const locale = params?.locale || pathname?.split('/')[1] || 'ar'
  const vendorPanelUrl = process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:5174'

  const vendorRegisterUrl = `${vendorPanelUrl}/register`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      setActivePath(path)
    }
  }, [])

  const getActiveState = (path: string) => {
    const fullPath = `/${locale}${path}`
    if (path === '/') {
      return activePath === `/${locale}/` || activePath === `/${locale}` || activePath === '/'
    }
    return activePath.includes(path) || activePath.includes(fullPath)
  }

  const navItems = [
    {
      icon: HomeIcon,
      label: t('home'),
      href: '/',
      active: getActiveState('/')
    },
    {
      icon: SearchIcon,
      label: t('search'),
      href: '/products',
      active: getActiveState('/products')
    },
    {
      icon: StoreIcon,
      label: 'كن تاجرًا',
      href: vendorRegisterUrl,
      active: activePath.includes('/vendor') || activePath.includes('/seller'),
      isVendor: true
    },
    {
      icon: CartIcon,
      label: t('cart'),
      href: '/cart',
      active: getActiveState('/cart'),
      badge: cartItemsCount
    },
    {
      icon: isLoggedIn ? HeartIcon : ProfileIcon,
      label: isLoggedIn ? t('wishlist') : t('profile'),
      href: isLoggedIn ? '/user/wishlist' : '/login',
      active: isLoggedIn
        ? getActiveState('/user/wishlist')
        : getActiveState('/login') || getActiveState('/register'),
      badge: isLoggedIn ? wishlistCount : undefined
    }
  ]

  return (
    <>
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-[9999] w-full max-w-screen mx-auto"
        style={{
          height: '72px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="flex items-end justify-between h-full w-full pb-2 px-2 max-w-screen-lg mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon

            if (item.isVendor) {
              return (
                <a
                  key={`vendor-${idx}`}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="relative flex items-center justify-center w-12 h-12 -mt-5
                                 bg-[#F36418] rounded-full shadow-lg
                                 hover:bg-[#F36418]/90 active:scale-95
                                 transition-all duration-200
                                 border-2 border-white"
                      style={{
                        boxShadow: '0 4px 12px rgba(243, 100, 24, 0.35)'
                      }}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <span
                      className="text-[9px] font-medium mt-0.5"
                      style={{
                        color: '#9CA3AF',
                        fontWeight: '500'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </a>
              )
            }

            return (
              <LocalizedClientLink
                key={`${item.href}-${idx}`}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center w-10 h-10">
                    <Icon
                      size={22}
                      className={item.active ? 'text-[#F36418]' : 'text-gray-400'}
                    />
                    {item.badge && item.badge > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center font-bold"
                        style={{
                          minWidth: '16px',
                          height: '16px',
                          backgroundColor: '#F36418',
                          color: 'white',
                          fontSize: '9px',
                          borderRadius: '8px',
                          padding: '0 4px'
                        }}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-medium mt-0.5"
                    style={{
                      color: item.active ? '#F36418' : '#9CA3AF',
                      fontWeight: item.active ? '600' : '500'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
      <div className="lg:hidden w-full" style={{ height: '72px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  )
}
