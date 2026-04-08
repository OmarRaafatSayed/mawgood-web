'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

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
      <div className="relative w-full h-[280px] md:h-[350px] lg:h-[450px]">
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
                alt={`Slide ${slide.id}`}
                fill
                className="object-cover rounded-lg"
                priority={slide.id === '1'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                quality={85}
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && isClient && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-[#FF8A00] w-6' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
