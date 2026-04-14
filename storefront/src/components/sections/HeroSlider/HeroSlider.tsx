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
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full max-w-screen mx-auto">
        <div
          className="relative w-full h-[42vw] sm:h-[240px] md:h-[320px] lg:h-[400px] xl:h-[450px]"
          style={{
            clipPath: 'url(#hero-curve)',
          }}
        >
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <clipPath id="hero-curve" clipPathUnits="objectBoundingBox">
                <path
                  d="M 0,0 L 1,0 L 1,0.95 Q 0.5,1 0,0.95 Z"
                />
              </clipPath>
            </defs>
          </svg>
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
                <picture>
                  {slide.imageMobile && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.imageMobile}
                    />
                  )}
                  <Image
                    src={slide.image}
                    alt={`Slide ${slide.id}`}
                    fill
                    className="object-cover"
                    priority={slide.id === '1'}
                    sizes="(max-width: 767px) 100vw, (max-width: 1024px) 90vw, 1200px"
                    quality={90}
                  />
                </picture>
              </div>
            ))}
          </div>
        </div>
      </div>

      {slides.length > 1 && isClient && (
        <div className="relative -mt-6 flex justify-center items-center gap-1.5 z-10">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-primary w-6' : 'bg-white/60 hover:bg-white/80 w-1.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
