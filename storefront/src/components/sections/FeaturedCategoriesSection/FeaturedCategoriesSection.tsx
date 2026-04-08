'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CategoryCard } from '@/components/cells'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FeaturedCategoryItem {
  id: string
  name: string
  handle: string
  icon?: string
  image?: string
}

interface FeaturedCategoriesSectionProps {
  sectionTitle: string
  viewAllLink: string
  categories: FeaturedCategoryItem[]
}

export function FeaturedCategoriesSection({
  sectionTitle,
  viewAllLink,
  categories
}: FeaturedCategoriesSectionProps) {
  const t = useTranslations('common')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

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
    <section className="py-6 w-full bg-white">
      <div className="flex items-center justify-between mb-6 px-4 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {sectionTitle}
        </h2>
        <LocalizedClientLink
          href={viewAllLink}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#FF8A00] hover:text-[#FF8A00]/80 transition-colors"
        >
          {t('viewAll')}
          <ArrowRight size={18} className="rtl:rotate-180" />
        </LocalizedClientLink>
      </div>

      {/* Mobile: Horizontal scrollable */}
      <div className="lg:hidden relative">
        {/* Left fade gradient */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none 
                      transition-opacity duration-300 ${isBeginning ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Right fade gradient */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none
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
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              handle={category.handle}
              icon={category.icon}
              image={category.image}
            />
          ))}
        </div>

        {/* Navigation buttons - visible on hover */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full 
                     flex items-center justify-center z-20 border-2 border-[#FF8A00]/20
                     hover:border-[#FF8A00] hover:bg-[#FF8A00]/10 transition-all duration-300
                     ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                     ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-[#FF8A00]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full 
                     flex items-center justify-center z-20 border-2 border-[#FF8A00]/20
                     hover:border-[#FF8A00] hover:bg-[#FF8A00]/10 transition-all duration-300
                     ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                     ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-[#FF8A00] rtl:rotate-180" />
        </button>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid grid-cols-6 gap-4 px-8">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            handle={category.handle}
            icon={category.icon}
            image={category.image}
          />
        ))}
      </div>
    </section>
  )
}
