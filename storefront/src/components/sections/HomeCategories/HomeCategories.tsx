'use client'

import { useRef } from 'react'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ArrowRightIcon } from '@/icons'
import { HttpTypes } from '@medusajs/types'
import { useTranslations } from 'next-intl'

interface HomeCategoriesProps {
  heading?: string
  categories?: HttpTypes.StoreProductCategory[]
}

export function HomeCategories({ heading, categories }: HomeCategoriesProps) {
  const t = useTranslations('home')
  const tCat = useTranslations('homeCategories')
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'right' ? 200 : -200,
        behavior: 'smooth'
      })
    }
  }

  const defaultCategories = [
    { id: '1', name: tCat('electronics'), handle: 'electronics', icon: '📱' },
    { id: '2', name: tCat('fashionWomen'), handle: 'fashion-women', icon: '👗' },
    { id: '3', name: tCat('fashionMen'), handle: 'fashion-men', icon: '👔' },
    { id: '4', name: tCat('kids'), handle: 'kids', icon: '🧒' },
    { id: '5', name: tCat('beauty'), handle: 'beauty', icon: '💄' },
    { id: '6', name: tCat('homeKitchen'), handle: 'home', icon: '🏠' },
    { id: '7', name: tCat('toys'), handle: 'toys', icon: '🎮' },
    { id: '8', name: tCat('sports'), handle: 'sports', icon: '⚽' },
  ]

  const displayCategories = categories?.length ? categories.map(c => ({
    id: c.id,
    name: c.name,
    handle: c.handle || '',
    icon: '📦'
  })) : defaultCategories

  return (
    <section className="py-6 w-full">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <h2 className="heading-md lg:heading-lg text-gray-900 uppercase">
          {heading || t('shopByCategory')}
        </h2>
        <LocalizedClientLink href="/categories" className="flex items-center gap-1 text-sm text-blue-600 font-medium">
          {t('viewAll')}
          <ArrowRightIcon size={16} className="rtl:rotate-180" />
        </LocalizedClientLink>
      </div>

      <div className="relative lg:hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayCategories.map((category) => (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="flex flex-col items-center min-w-[80px] gap-2"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl lg:text-3xl">
                {category.icon}
              </div>
              <span className="text-xs text-center text-gray-700 font-medium">{category.name}</span>
            </LocalizedClientLink>
          ))}
        </div>
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center z-10">
          <ArrowRightIcon size={16} className="rotate-180" />
        </button>
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center z-10">
          <ArrowRightIcon size={16} />
        </button>
      </div>

      <div className="hidden lg:grid grid-cols-4 gap-4 px-8">
        {displayCategories.map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className="flex flex-col items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
              {category.icon}
            </div>
            <span className="text-sm text-center text-gray-800 font-medium">{category.name}</span>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
