import { ProductPageAccordion } from '@/components/molecules'
import { getTranslations } from 'next-intl/server'

export const ProductDetailsShipping = async () => {
  const t = await getTranslations('product')

  return (
    <ProductPageAccordion heading={t('shippingReturns')} defaultOpen={false}>
      <div className='product-details'>
        <ul>
          <li>{t('shippingDescription')}</li>
          <li>{t('returnDescription')}</li>
        </ul>
      </div>
    </ProductPageAccordion>
  )
}
