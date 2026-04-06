'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface HeroSlide {
  id: string
  image: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

interface HeroSliderProps {
  slides: HeroSlide[]
  autoPlayInterval?: number
}

export function HeroSlider({ slides, autoPlayInterval = 2000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!slides || slides.length <= 1 || !isClient) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlayInterval, goToNext, slides.length, isClient])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden px-4 lg:px-8">
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ 
            transform: isClient ? `translateX(${currentIndex * -100}%)` : 'translateX(0)',
            direction: 'ltr'
          }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id}
              className="w-full h-full flex-shrink-0 relative"
            >
              <Image
                src={slide.image}
                alt={slide.title || `Slide ${slide.id}`}
                fill
                className="object-cover rounded-lg"
                priority={slide.id === '1'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                quality={85}
              />
              {(slide.title || slide.subtitle || slide.ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent rounded-lg flex items-center">
                  <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-xl text-white">
                      {slide.subtitle && (
                        <p className="text-sm md:text-base font-semibold mb-2 uppercase tracking-wide">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.title && (
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                          {slide.title}
                        </h2>
                      )}
                      {slide.ctaText && slide.ctaLink && (
                        <Link
                          href={slide.ctaLink}
                          className="inline-block bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
                        >
                          {slide.ctaText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && isClient && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="group relative w-10 h-2 rounded-full overflow-hidden bg-white/40 hover:bg-white/60 transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div 
                className="absolute inset-0 bg-white rounded-full transition-all"
                style={{
                  width: currentIndex === index ? '100%' : '0%',
                  transition: currentIndex === index ? `width ${autoPlayInterval}ms linear` : 'width 300ms ease-out'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
