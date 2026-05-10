"use client"

import useEmblaCarousel from "embla-carousel-react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"
import { ProductCarouselIndicator } from "@/components/molecules"
import { useScreenSize } from "@/hooks/useScreenSize"

const FALLBACK_IMAGE = "/images/placeholder.svg"

function CarouselSlide({
  slide,
  idx,
}: {
  slide: NonNullable<HttpTypes.StoreProduct["images"]>[number]
  idx: number
}) {
  const [src, setSrc] = useState(
    slide.url ? decodeURIComponent(slide.url) : FALLBACK_IMAGE
  )
  const [errored, setErrored] = useState(false)

  return (
    <Image
      priority={idx === 0}
      fetchPriority={idx === 0 ? "high" : "auto"}
      src={src}
      alt={`Product image ${idx + 1}`}
      width={700}
      height={700}
      quality={idx === 0 ? 85 : 70}
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="max-h-[700px] w-full h-auto aspect-square object-cover object-center"
      data-testid={`product-carousel-image-${idx}`}
      onError={() => {
        if (!errored) {
          setErrored(true)
          setSrc(FALLBACK_IMAGE)
        }
      }}
    />
  )
}

export const ProductCarousel = ({
  slides = [],
}: {
  slides: HttpTypes.StoreProduct["images"]
}) => {
  const screenSize = useScreenSize()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis:
      screenSize === "xs" || screenSize === "sm" || screenSize === "md"
        ? "x"
        : "y",
    loop: true,
    align: "start",
  })

  return (
    <div className="embla relative" data-testid="product-carousel">
      <div
        className="embla__viewport overflow-hidden rounded-xs"
        ref={emblaRef}
        data-testid="product-carousel-viewport"
      >
        <div className="embla__container h-[350px] lg:h-fit max-h-[698px] flex lg:block" data-testid="product-carousel-container">
          {(slides || []).map((slide, idx) => (
            <div
              key={slide.id}
              className="embla__slide min-w-0 h-[350px] lg:h-fit"
              data-testid={`product-carousel-slide-${idx}`}
            >
              <CarouselSlide slide={slide} idx={idx} />
            </div>
          ))}
        </div>
        {slides?.length ? (
          <ProductCarouselIndicator slides={slides} embla={emblaApi} />
        ) : null}
      </div>
    </div>
  )
}
