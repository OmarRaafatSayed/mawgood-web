import { Photo } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

type ThumbnailProps = {
  src?: string | null
  alt?: string
  size?: "small" | "base" | "large"
}

export const Thumbnail = ({ src, alt, size = "base" }: ThumbnailProps) => {
  const [hasError, setHasError] = useState(false)

  return (
    <div
      className={clx(
        "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border",
        {
          "h-8 w-6": size === "base",
          "h-5 w-4": size === "small",
          "h-12 w-12": size === "large",
        }
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <Photo className="text-ui-fg-subtle" />
      )}
    </div>
  )
}
