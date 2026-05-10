"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"
import { useState } from "react"
import { Brand } from "@/types/brands"

const FALLBACK = "/images/placeholder.svg"

interface BrandCardProps {
  brand: Brand
}

export function BrandCard({ brand }: BrandCardProps) {
  const [src, setSrc] = useState(
    brand.logo ? decodeURIComponent(brand.logo) : FALLBACK
  )
  const [errored, setErrored] = useState(false)

  return (
    <LocalizedClientLink href={brand.href}>
      <div className="relative border border-secondary rounded-sm bg-action h-[320px] w-[320px] 2xl:h-[400px] 2xl:w-[400px] flex items-center justify-center hover:rounded-full transition-all duration-200">
        <Image
          src={src}
          alt={brand.name}
          fill
          className="object-contain brightness-0 invert"
          onError={() => {
            if (!errored) { setErrored(true); setSrc(FALLBACK) }
          }}
        />
      </div>
    </LocalizedClientLink>
  )
}
