'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { HomeIcon, FilterIcon, CartIcon, ProfileIcon, HeartIcon } from '@/icons'
import { useTranslations } from 'next-intl'

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
  
  const locale = params?.locale || pathname?.split('/')[1] || 'ar'

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
      index: 0,
      icon: HomeIcon,
      label: t('home'),
      href: '/',
      active: getActiveState('/')
    },
    {
      index: 1,
      icon: FilterIcon,
      label: t('categories'),
      href: '/categories',
      active: getActiveState('/categories')
    },
    {
      index: 2,
      icon: CartIcon,
      label: t('cart'),
      href: '/cart',
      active: getActiveState('/cart'),
      badge: cartItemsCount
    },
    {
      index: 3,
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-[9999] border-t border-gray-200" 
        style={{ 
          height: '70px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <nav 
          className="flex items-center justify-between h-full w-full px-2"
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <LocalizedClientLink
                key={`${item.href}-${idx}`}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 max-w-[80px]"
              >
                <div 
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    item.active ? 'text-[#FF8A00]' : 'text-gray-500'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <Icon size={24} />
                    {item.badge && item.badge > 0 && (
                      <span 
                        className="absolute flex items-center justify-center font-bold"
                        style={{
                          top: '2px',
                          right: '6px',
                          minWidth: '18px',
                          height: '18px',
                          backgroundColor: '#FF8A00',
                          color: 'white',
                          fontSize: '10px',
                          borderRadius: '9px',
                          padding: '0 5px'
                        }}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span 
                    className="text-[10px] font-medium mt-0.5"
                    style={{ 
                      color: item.active ? '#FF8A00' : '#6B7280',
                      fontWeight: item.active ? '600' : '500'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </LocalizedClientLink>
            )
          })}
        </nav>
      </div>
      <div className="lg:hidden" style={{ height: '70px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  )
}
