"use client"

import { SingleProductImage } from "@/types/product"
import Image from "next/image"
import { useState } from "react"

const FALLBACK_IMAGE = "/images/placeholder.svg"

export const GalleryCarouselItem = ({
  image,
}: {
  image: SingleProductImage
}) => {
  const [imgSrc, setImgSrc] = useState(
    image.url ? decodeURIComponent(image.url) : FALLBACK_IMAGE
  )
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(FALLBACK_IMAGE)
    }
  }

  return (
    <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
      <Image
        key={image.id}
        src={imgSrc}
        alt={image.alt || "Product image"}
        fill
        sizes="(max-width: 768px) 100vw, 700px"
        className="object-contain"
        onError={handleError}
        priority={false}
      />
    </div>
  )
}
