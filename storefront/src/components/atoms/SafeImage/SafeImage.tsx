"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

const FALLBACK_SRC = "/images/placeholder.svg"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

/**
 * SafeImage - Next.js Image with automatic fallback on error.
 * Prevents broken image icons anywhere in the app.
 */
export const SafeImage = ({
  src,
  alt,
  fallbackSrc = FALLBACK_SRC,
  ...props
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [errored, setErrored] = useState(false)

  const handleError = () => {
    if (!errored) {
      setErrored(true)
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || ""}
      onError={handleError}
    />
  )
}
