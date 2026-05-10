"use client"

import Image from "next/image"
import { useState } from "react"

const FALLBACK = "/images/placeholder.svg"

export const SellerAvatar = ({
  photo = "",
  size = 32,
  alt = "",
}: {
  photo?: string
  size?: number
  alt?: string
}) => {
  const [src, setSrc] = useState(photo ? decodeURIComponent(photo) : FALLBACK)
  const [errored, setErrored] = useState(false)

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-sm object-cover"
      style={{ maxWidth: size, maxHeight: size }}
      onError={() => {
        if (!errored) { setErrored(true); setSrc(FALLBACK) }
      }}
    />
  )
}
