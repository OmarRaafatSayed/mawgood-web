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
  
  const prod = await listProducts({
    countryCode,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!prod) return null

  // Allow products without seller or with suspended seller to show
  // if (prod.seller?.store_status === "SUSPENDED") {
  //   return NotFound()
  // }

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
