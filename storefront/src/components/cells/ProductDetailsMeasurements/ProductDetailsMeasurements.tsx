import { ProductPageAccordion, ProdutMeasurementRow } from '@/components/molecules'
import { SingleProductMeasurement } from '@/types/product'
import { getTranslations } from 'next-intl/server'

export const ProductDetailsMeasurements = async ({ measurements }: { measurements: SingleProductMeasurement[] }) => {
  const t = await getTranslations('product')

  return (
    <ProductPageAccordion heading={t('measurements')} defaultOpen={false}>
      {measurements.map((item) => (
        <ProdutMeasurementRow key={item.label} measurement={item} />
      ))}
    </ProductPageAccordion>
  )
}
