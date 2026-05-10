'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useTranslations } from 'next-intl'
import { HomeIcon, SearchIcon, CartIcon, ProfileIcon, HeartIcon, StoreIcon } from '@/icons'
import { useCartContext } from '@/components/providers'
import Link from 'next/link'

interface BottomNavbarProps {
  isLoggedIn?: boolean
  cartItemsCount?: number
  wishlistCount?: number
}

export function BottomNavbar({
  isLoggedIn = false,
  wishlistCount = 0,
}: BottomNavbarProps) {
  const pathname = usePathname()
  const params = useParams()
  const [activePath, setActivePath] = useState('/')
  const t = useTranslations('common')
  const tVendor = useTranslations('vendor')
  const { cart } = useCartContext()
  const cartCount = (cart as any)?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

  const locale = params?.locale || pathname?.split('/')[1] || 'ar'

  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [pathname])

  const isActive = (path: string) => {
    const full = `/${locale}${path}`
    if (path === '/') return activePath === `/${locale}` || activePath === `/${locale}/` || activePath === '/'
    return activePath.includes(path) || activePath.includes(full)
  }

  const vendorUrl = process.env.NEXT_PUBLIC_VENDOR_URL || 'https://vendor.mercurjs.com'

  const navItems = [
    {
      icon: HomeIcon,
      label: t('home'),
      href: '/',
      active: isActive('/'),
      type: 'link' as const,
    },
    {
      icon: SearchIcon,
      label: t('search'),
      href: '/categories',
      active: isActive('/products') || isActive('/categories'),
      type: 'link' as const,
    },
    {
      icon: StoreIcon,
      label: tVendor('openStore'),
      href: vendorUrl,
      active: false,
      type: 'external' as const,
      highlight: true,
    },
    {
      icon: CartIcon,
      label: t('cart'),
      href: '/cart',
      active: isActive('/cart'),
      badge: cartCount,
      type: 'link' as const,
    },
    {
      icon: isLoggedIn ? HeartIcon : ProfileIcon,
      label: isLoggedIn ? t('wishlist') : t('profile'),
      href: isLoggedIn ? '/user/wishlist' : '/login',
      active: isLoggedIn ? isActive('/user/wishlist') : isActive('/login'),
      badge: isLoggedIn ? wishlistCount : undefined,
      type: 'link' as const,
    },
  ]

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 !w-screen !max-w-none bg-white z-[9999] border-t border-gray-100"
        style={{
          height: 'calc(68px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          width: '100vw',
          maxWidth: 'none',
          left: 0,
          right: 0,
          margin: 0,
        }}
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-full px-1 w-full">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const active = item.active

            // External link for vendor
            if (item.type === 'external') {
              return (
                <Link
                  key={`${item.href}-${idx}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
                  aria-label={item.label}
                >
                  {/* Vendor Store Button - Special Styling */}
                  <div
                    className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #F36418 0%, #FF8C42 100%)',
                      transform: 'translateY(-8px)',
                    }}
                  >
                    <Icon size={26} color="#FFFFFF" />
                  </div>
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: '#F36418' }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            }

            // Regular navigation items
            return (
              <LocalizedClientLink
                key={`${item.href}-${idx}`}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
                aria-label={item.label}
              >
                <div className="relative flex items-center justify-center w-9 h-9">
                  <Icon size={22} className={active ? 'text-[#F36418]' : 'text-gray-400'} />
                  {item.badge && item.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#F36418] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[9px] leading-none"
                  style={{ color: active ? '#F36418' : '#9CA3AF', fontWeight: active ? 600 : 400 }}
                >
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F36418]" />
                )}
              </LocalizedClientLink>
            )
          })}
        </div>
      </nav>
      {/* Spacer */}
      <div
        className="lg:hidden w-full"
        style={{ height: 'calc(68px + env(safe-area-inset-bottom, 0px))' }}
      />
    </>
  )
}
