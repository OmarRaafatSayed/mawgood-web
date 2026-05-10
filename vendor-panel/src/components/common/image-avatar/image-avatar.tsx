import { clx } from "@medusajs/ui"
import { useState } from "react"
import imagesConverter from "../../../utils/images-conventer"

const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3Ccircle cx='24' cy='18' r='8' fill='%23d1d5db'/%3E%3Cellipse cx='24' cy='38' rx='14' ry='8' fill='%23d1d5db'/%3E%3C/svg%3E`

export default function ImageAvatar({
  src,
  size = 6,
  rounded = false,
}: {
  src: string
  size?: number
  rounded?: boolean
}) {
  const formattedSrc = imagesConverter(src)
  const [imgSrc, setImgSrc] = useState(formattedSrc)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(FALLBACK_SVG)
    }
  }

  return (
    <img
      src={imgSrc}
      alt="avatar"
      className={clx(
        `w-${size} h-${size} border rounded-md object-cover`,
        rounded && "rounded-full"
      )}
      onError={handleError}
      loading="lazy"
    />
  )
}
