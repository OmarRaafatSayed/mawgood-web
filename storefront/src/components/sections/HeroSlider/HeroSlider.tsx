'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

export interface HeroSlide {
  id: string
  image: string
  imageMobile?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

interface HeroSliderProps {
  slides: HeroSlide[]
  autoPlayInterval?: number
}

export function HeroSlider({ slides, autoPlayInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => { setIsClient(true) }, [])

  const goToSlide = useCallback((index: number) => setCurrentIndex(index), [])
  const goToNext = useCallback(() => setCurrentIndex(prev => (prev + 1) % slides.length), [slides.length])
  const goToPrev = useCallback(() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (!slides || slides.length <= 1 || !isClient) return
    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlayInterval, goToNext, slides.length, isClient])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev()
    }
    setTouchStart(null)
  }

  if (!slides || slides.length === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: isClient ? `translateX(${currentIndex * -100}%)` : 'translateX(0)',
          direction: 'ltr',
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative"
            style={{ aspectRatio: '16/6' }}
          >
            <picture>
              {slide.imageMobile && (
                <source media="(max-width: 767px)" srcSet={slide.imageMobile} />
              )}
              <Image
                src={slide.image}
                alt={slide.title || `Slide ${slide.id}`}
                fill
                className="object-cover"
                priority={slide.id === '1'}
                loading={slide.id === '1' ? 'eager' : 'lazy'}
                sizes="(max-width: 767px) 100vw, 100vw"
                quality={slide.id === '1' ? 85 : 75}
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Dots */}
      {slides.length > 1 && isClient && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-white w-5 h-1.5'
                  : 'bg-white/50 w-1.5 h-1.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
