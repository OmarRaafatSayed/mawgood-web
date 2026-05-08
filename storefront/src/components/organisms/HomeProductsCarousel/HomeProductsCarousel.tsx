import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ChevronRight } from "lucide-react"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  const validSellerProducts = sellerProducts?.filter(Boolean) || []

  const {
    response: { products },
  } = await listProducts({
    countryCode: locale,
    queryParams: {
      limit: home ? 8 : undefined,
      order: "created_at",
      handle: home
        ? undefined
        : validSellerProducts.map((product) => product.handle),
    },
    forceCache: !home,
  })

  const displayProducts = validSellerProducts.length ? validSellerProducts : products

  if (!displayProducts.length) return null

  return (
    <div className="w-full">
      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* View all link */}
      {home && displayProducts.length >= 8 && (
        <div className="mt-4 flex justify-center">
          <LocalizedClientLink
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#F36418] text-[#F36418] text-sm font-semibold hover:bg-[#F36418] hover:text-white transition-colors duration-200"
          >
            عرض كل المنتجات
            <ChevronRight size={16} className="rtl:rotate-180" />
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
