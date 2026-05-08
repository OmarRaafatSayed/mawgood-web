"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { Product } from "@/types/product"

export const ProductCard = ({
  product,
  className,
}: {
  product: HttpTypes.StoreProduct | Product
  className?: string
}) => {
  if (!product) return null

  const { cheapestPrice } = getProductPrice({ product: product as HttpTypes.StoreProduct })
  const productName = String(product.title || "Product")

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={cn(
        "group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100",
        "hover:shadow-md transition-shadow duration-200",
        "w-full",
        className
      )}
      data-testid="product-card"
      data-product-handle={product.handle}
      aria-label={`View ${productName}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={decodeURIComponent(product.thumbnail)}
            alt={productName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid="product-card-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Image
              src="/images/placeholder.svg"
              alt={productName}
              width={80}
              height={80}
              className="opacity-30"
              data-testid="product-card-placeholder-image"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1" data-testid="product-card-info">
        <h3
          className="text-[13px] sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug"
          data-testid="product-card-title"
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mt-1" data-testid="product-card-price">
          {cheapestPrice?.calculated_price ? (
            <>
              <span
                className="text-sm font-bold text-[#F36418]"
                data-testid="product-card-current-price"
              >
                {cheapestPrice.calculated_price}
              </span>
              {cheapestPrice.calculated_price !== cheapestPrice.original_price && (
                <span
                  className="text-xs text-gray-400 line-through"
                  data-testid="product-card-original-price"
                >
                  {cheapestPrice.original_price}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
