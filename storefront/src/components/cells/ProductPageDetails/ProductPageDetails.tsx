import { ProductPageAccordion } from "@/components/molecules"
import { getTranslations } from "next-intl/server"

export const ProductPageDetails = async ({ details }: { details: string }) => {
  if (!details) return null
  const t = await getTranslations('product')

  return (
    <ProductPageAccordion heading={t('productDetails')} defaultOpen={false} data-testid="product-details-section">
      <div className="product-details" dangerouslySetInnerHTML={{ __html: details }} data-testid="product-details-content" />
    </ProductPageAccordion>
  )
}
