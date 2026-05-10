"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"
import { useState } from "react"

const FALLBACK = "/images/placeholder.svg"

export function CategoryCard({
  category,
}: {
  category: { name: string; handle: string }
}) {
  const [imgSrc, setImgSrc] = useState(`/images/categories/${category.handle}.png`)
  const [errored, setErrored] = useState(false)

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="relative flex flex-col items-center border rounded-sm bg-component transition-all hover:rounded-full w-[233px] aspect-square"
    >
      <div className="flex relative aspect-square overflow-hidden w-[200px]">
        <Image
          loading="lazy"
          src={imgSrc}
          alt={`category - ${category.name}`}
          width={200}
          height={200}
          sizes="(min-width: 1024px) 200px, 40vw"
          className="object-contain scale-90 rounded-full"
          onError={() => {
            if (!errored) { setErrored(true); setImgSrc(FALLBACK) }
          }}
        />
      </div>
      <h3 className="w-full text-center label-lg text-primary">
        {category.name}
      </h3>
    </LocalizedClientLink>
  )
}
