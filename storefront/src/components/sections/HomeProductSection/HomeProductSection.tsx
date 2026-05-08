import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import { getCountryFromLocale } from "@/lib/helpers/locale-mapping"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ChevronRight } from "lucide-react"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "eg",
  products = [],
  home = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
}) => {
  const countryCode = getCountryFromLocale(locale)

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {heading}
        </h2>
        {home && (
          <LocalizedClientLink
            href="/products"
            className="text-xs font-semibold text-[#F36418] hover:underline flex items-center gap-1"
          >
            عرض الكل
            <ChevronRight size={14} className="rtl:rotate-180" />
          </LocalizedClientLink>
        )}
      </div>

      <HomeProductsCarousel
        locale={countryCode}
        sellerProducts={products.slice(0, 4)}
        home={home}
      />
    </section>
  )
}
