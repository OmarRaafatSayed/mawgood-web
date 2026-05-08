'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HttpTypes } from '@medusajs/types'
import { useTranslations } from 'next-intl'

interface HomeCategoriesProps {
  heading?: string
  categories?: HttpTypes.StoreProductCategory[]
}

// Category background colors - واقعية ومتناسقة
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  't-shirts':   { bg: '#FFF3E0', text: '#E65100' },
  'shirts':     { bg: '#E3F2FD', text: '#1565C0' },
  'dresses':    { bg: '#FCE4EC', text: '#880E4F' },
  'pants':      { bg: '#E8F5E9', text: '#1B5E20' },
  'jackets':    { bg: '#EDE7F6', text: '#4527A0' },
  'blouses':    { bg: '#FFF8E1', text: '#F57F17' },
  'skirts':     { bg: '#F3E5F5', text: '#6A1B9A' },
  'shorts':     { bg: '#E0F7FA', text: '#006064' },
  'suits':      { bg: '#EFEBE9', text: '#3E2723' },
  'general':    { bg: '#F5F5F5', text: '#424242' },
}

const DEFAULT_COLOR = { bg: '#FFF3E0', text: '#E65100' }

// Category icons - حروف أولى بدل إيموجي
function getCategoryInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
}

function getCategoryColor(handle: string) {
  const key = handle?.toLowerCase().replace(/[^a-z-]/g, '') || ''
  return CATEGORY_COLORS[key] || DEFAULT_COLOR
}

export function HomeCategories({
  heading,
  categories
}: HomeCategoriesProps) {
  const t = useTranslations('home')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setIsBeginning(scrollLeft <= 10)
      setIsEnd(scrollLeft >= scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScrollPosition()
  }, [checkScrollPosition, categories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'right' ? 240 : -240,
        behavior: 'smooth',
      })
    }
  }

  // No categories = don't render
  if (!categories || categories.length === 0) return null

  return (
    <section className="py-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {heading || t('browseCategories')}
        </h2>
        <LocalizedClientLink
          href="/categories"
          className="text-xs font-semibold text-[#F36418] hover:underline flex items-center gap-1"
        >
          {t('viewAll')}
          <ChevronRight size={14} className="rtl:rotate-180" />
        </LocalizedClientLink>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden relative">
        <div
          className={`absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity ${isBeginning ? 'opacity-0' : 'opacity-100'}`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity ${isEnd ? 'opacity-0' : 'opacity-100'}`}
        />

        <div
          ref={scrollRef}
          onScroll={checkScrollPosition}
          className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat) => {
            const color = getCategoryColor(cat.handle || '')
            const initials = getCategoryInitials(cat.name)
            return (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform duration-200 group-active:scale-95"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {initials}
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center max-w-[64px] leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>

        {/* Scroll buttons */}
        {!isBeginning && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-7 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center z-20 border border-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
        )}
        {!isEnd && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-7 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center z-20 border border-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} className="text-gray-600 rtl:rotate-180" />
          </button>
        )}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:flex flex-wrap gap-4 px-8">
        {categories.map((cat) => {
          const color = getCategoryColor(cat.handle || '')
          const initials = getCategoryInitials(cat.name)
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="flex flex-col items-center gap-2 group w-24"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-200 group-hover:scale-105 group-hover:shadow-md"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {initials}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2">
                {cat.name}
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
