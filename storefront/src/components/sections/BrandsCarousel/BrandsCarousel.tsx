'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

interface Brand {
  id: string | number
  name: string
  logo?: string
  href?: string
}

interface BrandsCarouselProps {
  heading?: string
  brands?: Brand[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function BrandsCarousel({
  heading,
  brands,
  autoPlay = true,
  autoPlayInterval = 3000
}: BrandsCarouselProps) {
  const t = useTranslations('home')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  // Default brands for demonstration
  const defaultBrands: Brand[] = [
    { id: '1', name: 'Nike', logo: '/images/brands/Nike.svg' },
    { id: '2', name: 'Adidas', logo: '/images/brands/Adidas.svg' },
    { id: '3', name: 'Puma', logo: '/images/brands/Puma.svg' },
    { id: '4', name: 'Zara', logo: '/images/brands/Zara.svg' },
    { id: '5', name: 'H&M', logo: '/images/brands/H&M.svg' },
    { id: '6', name: 'Apple', logo: '/images/brands/Apple.svg' },
    { id: '7', name: 'Samsung', logo: '/images/brands/Samsung.svg' },
    { id: '8', name: 'Sony', logo: '/images/brands/Sony.svg' },
  ]

  const displayBrands = brands && brands.length > 0 ? brands : defaultBrands

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

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoPlay || isHovering) return

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth

        if (scrollLeft >= maxScroll - 10) {
          // Reset to beginning
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Scroll to next brand
          const cardWidth = 160 // Approximate card width + gap
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
        }
      }
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, isHovering, autoPlayInterval])

  const handleScroll = () => {
    checkScrollPosition()
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'right' ? 320 : -320
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-6 w-full bg-white">
      <div className="flex items-center justify-between mb-6 px-4 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {heading || t('popularBrands')}
        </h2>
        <LocalizedClientLink
          href="/brands"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#F36418] hover:text-[#F36418]/80 transition-colors"
        >
          {t('viewAll')}
          <ChevronRight size={18} className="rtl:rotate-180" />
        </LocalizedClientLink>
      </div>

      <div className="relative">
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
          className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {displayBrands.map((brand) => (
            <div
              key={brand.id}
              className="flex-shrink-0 w-36 h-24 sm:w-44 sm:h-28 bg-gray-50 rounded-xl 
                         border border-gray-100 hover:border-[#F36418]/30 
                         transition-all duration-300 ease-out
                         flex items-center justify-center p-4
                         hover:shadow-md hover:bg-[#F36418]/5 group"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain 
                             transition-transform duration-300 group-hover:scale-105
                             filter grayscale hover:grayscale-0"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-600 group-hover:text-[#F36418]">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
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
    </section>
  )
}
