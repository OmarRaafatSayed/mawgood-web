'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CategoryCard } from '@/components/cells'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HttpTypes } from '@medusajs/types'
import { useTranslations } from 'next-intl'

interface HomeCategoriesProps {
  heading?: string
  categories?: HttpTypes.StoreProductCategory[]
}

interface CategoryItem {
  id: string
  name: string
  handle: string
  icon?: string
  image?: string
}

export function HomeCategories({
  heading,
  categories
}: HomeCategoriesProps) {
  const t = useTranslations('home')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const defaultCategories: CategoryItem[] = [
    { id: '1', name: 'إلكترونيات', handle: 'electronics', icon: '📱' },
    { id: '2', name: 'أزياء نسائية', handle: 'fashion-women', icon: '👗' },
    { id: '3', name: 'أزياء رجالية', handle: 'fashion-men', icon: '👔' },
    { id: '4', name: 'منزل ومطبخ', handle: 'home', icon: '🏠' },
    { id: '5', name: 'جمال وعناية', handle: 'beauty', icon: '💄' },
    { id: '6', name: 'رياضة ولياقة', handle: 'sports', icon: '⚽' },
    { id: '7', name: 'أطفال ولعب', handle: 'toys', icon: '🧸' },
    { id: '8', name: 'كتب', handle: 'books', icon: '📚' },
    { id: '9', name: 'سيارات', handle: 'automotive', icon: '🚗' },
    { id: '10', name: 'بقالة', handle: 'grocery', icon: '🛒' },
    { id: '11', name: 'مستلزمات حيوانات', handle: 'pet-supplies', icon: '🐾' },
    { id: '12', name: 'صحة', handle: 'health', icon: '💊' },
  ]

  const displayCategories: CategoryItem[] = categories?.length 
    ? categories.map(c => ({
        id: c.id,
        name: c.name,
        handle: c.handle || '',
        icon: undefined
      }))
    : defaultCategories

  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setIsBeginning(scrollLeft <= 10)
      setIsEnd(scrollLeft >= scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScrollPosition()
  }, [checkScrollPosition])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'right' ? 200 : -200
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    checkScrollPosition()
  }

  return (
    <section className="py-6 w-full bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex items-center justify-between mb-6 px-4 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {heading || t('browseCategories')}
        </h2>
        <LocalizedClientLink
          href="/categories"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#F36418] hover:text-[#F36418]/80 transition-colors"
        >
          {t('viewAll')}
          <ChevronRight size={18} className="rtl:rotate-180" />
        </LocalizedClientLink>
      </div>

      {/* Mobile: Horizontal scrollable */}
      <div className="lg:hidden relative">
        {/* Left fade gradient */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none 
                      transition-opacity duration-300 ${isBeginning ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Right fade gradient */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none
                      transition-opacity duration-300 ${isEnd ? 'opacity-0' : 'opacity-100'}`}
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {displayCategories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              handle={category.handle}
              icon={category.icon}
            />
          ))}
        </div>

        {/* Navigation buttons - visible on hover */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full 
                     flex items-center justify-center z-20 border-2 border-[#F36418]/20
                     hover:border-[#F36418] hover:bg-[#F36418]/10 transition-all duration-300
                     ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                     ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-[#F36418]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full 
                     flex items-center justify-center z-20 border-2 border-[#F36418]/20
                     hover:border-[#F36418] hover:bg-[#F36418]/10 transition-all duration-300
                     ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                     ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-[#F36418] rtl:rotate-180" />
        </button>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid grid-cols-6 gap-4 px-8">
        {displayCategories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            handle={category.handle}
            icon={category.icon}
          />
        ))}
      </div>
    </section>
  )
}
