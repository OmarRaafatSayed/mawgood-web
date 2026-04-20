import { ProductDetails, ProductGallery } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import NotFound from "@/app/not-found"
import { getCountryFromLocale } from "@/lib/helpers/locale-mapping"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  const countryCode = getCountryFromLocale(locale);
  
  let prod;
  try {
    const result = await listProducts({
      countryCode,
      queryParams: { handle: [handle], limit: 1 },
      forceCache: false,
    })
    prod = result.response.products[0]
  } catch (error) {
    console.error("Error fetching product:", error)
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Error loading product</h2>
        <p className="text-gray-500 mt-2">Please try again later.</p>
      </div>
    )
  }

  if (!prod) {
    return NotFound()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row lg:gap-12" data-testid="product-details-page">
        <div className="md:w-1/2 md:px-2" data-testid="product-gallery-container">
          <ProductGallery images={prod?.images || []} />
        </div>
        <div className="md:w-1/2 md:px-2" data-testid="product-details-container">
          <ProductDetails product={prod} locale={locale} />
        </div>
      </div>
      <div className="my-8">
        {prod.seller?.products && prod.seller.products.length > 0 && (
          <HomeProductSection
            heading="More from this seller"
            products={prod.seller.products}
            locale={locale}
          />
        )}
      </div>
    </>
  )
}
