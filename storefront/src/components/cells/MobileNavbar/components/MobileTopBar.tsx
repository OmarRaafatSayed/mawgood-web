'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HttpTypes } from '@medusajs/types'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CartDropdown } from '@/components/cells'
import { HeartIcon, SearchIcon, ProfileIcon, LocationIcon, CloseIcon } from '@/icons'
import { Badge } from '@/components/atoms'
import { Wishlist } from '@/types/wishlist'

interface MobileTopBarProps {
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
  isLoggedIn: boolean
  wishlist: Wishlist
  userCity?: string
}

export function MobileTopBar({
  parentCategories,
  categories,
  isLoggedIn,
  wishlist,
  userCity = 'القاهرة'
}: MobileTopBarProps) {
  const t = useTranslations('common')
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const wishlistCount = wishlist?.products?.length || 0

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <div 
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2"
              aria-label={t('menu')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6ZM3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12ZM3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18Z" fill="#333333"/>
              </svg>
            </button>

            <button className="flex items-center gap-1 text-sm text-gray-700">
              <LocationIcon size={18} />
              <span>{userCity}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2"
            aria-label={t('search')}
          >
            <SearchIcon size={20} />
          </button>

          <div className="flex items-center gap-1">
            {isLoggedIn ? (
              <LocalizedClientLink href="/user" className="p-2" aria-label={t('profile')}>
                <ProfileIcon size={20} />
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink href="/login" className="p-2" aria-label={t('login')}>
                <ProfileIcon size={20} />
              </LocalizedClientLink>
            )}

            {isLoggedIn && (
              <LocalizedClientLink href="/user/wishlist" className="relative p-2" aria-label={t('wishlist')}>
                <HeartIcon size={20} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px]">
                    {wishlistCount}
                  </Badge>
                )}
              </LocalizedClientLink>
            )}

            <CartDropdown />
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-3 border-b">
              <button onClick={() => setIsSearchOpen(false)} className="p-2 -ml-2">
                <CloseIcon size={20} />
              </button>
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder') || 'ما الذي تبحث عنه؟'}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-right"
                    autoFocus
                  />
                </div>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-500 mb-4">عمليات البحث الشائعة</p>
              <div className="space-y-2">
                {['آيفون', 'سامسونج', 'أديداس', 'لابتوب'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term)
                      router.push(`/search?q=${encodeURIComponent(term)}`)
                      setIsSearchOpen(false)
                    }}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white">
          <div className="flex items-center justify-between px-3 py-3 border-b">
            <LocalizedClientLink href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/Logo.svg"
                width={100}
                height={32}
                alt="Logo"
                priority
              />
            </LocalizedClientLink>
            <button onClick={() => setIsMenuOpen(false)} className="p-2">
              <CloseIcon size={24} />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            <nav className="p-4">
              {parentCategories.map((parent) => (
                <div key={parent.id} className="border-b py-3">
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    className="block font-medium text-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  {parent.category_children?.map((child) => (
                    <LocalizedClientLink
                      key={child.id}
                      href={`/categories/${child.handle}`}
                      className="block py-2 text-sm text-gray-600 pl-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {child.name}
                    </LocalizedClientLink>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="lg:hidden h-[88px]" />
    </>
  )
}
