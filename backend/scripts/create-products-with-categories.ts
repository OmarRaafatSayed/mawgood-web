import { ExecArgs } from '@medusajs/framework/types'
import { ProductStatus } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { createProductsWorkflow } from '@medusajs/medusa/core-flows'

const productsToInsert = [
  {
    title: 'U574 UNISEX Sneakers',
    handle: 'u574-unisex-sneakers-new',
    subtitle: 'Classic 574 silhouette',
    description: 'Featuring the classic 574 silhouette with updated materials and cushioning.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/U574-UNISEX-1.png',
    options: [{ title: 'Size', values: ['37', '38', '39', '40'] }],
    variants: [
      { title: 'Orange / 38', prices: [{ currency_code: 'egp', amount: 2800 }], options: { Size: '38' } }
    ],
    discountable: true,
    category_id: 'pcat_01KMBGJE83EQ9MF531M9ACVX9X'
  },
  {
    title: 'New Runner Flag Sneakers',
    handle: 'new-runner-flag-sneakers-new',
    subtitle: 'Heritage-inspired running',
    description: 'Heritage-inspired running silhouette featuring distinctive flag details.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/New-Runner-Flag-1.png',
    options: [{ title: 'Size', values: ['38', '39', '40', '41'] }],
    variants: [
      { title: 'Brown / 40', prices: [{ currency_code: 'egp', amount: 2500 }], options: { Size: '40' } }
    ],
    discountable: true,
    category_id: 'pcat_01KMBGJE84SV12PW1RD7DRXHAS'
  },
  {
    title: 'STORM 96 2K LITE Sneakers',
    handle: 'storm-96-2k-lite-new',
    subtitle: 'Retro-futuristic design',
    description: "Retro-futuristic design combining '90s athletic aesthetics.",
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/STORM-96-2K-LITE-1.png',
    options: [{ title: 'Size', values: ['40', '41', '42'] }],
    variants: [
      { title: 'Black / 41', prices: [{ currency_code: 'egp', amount: 3500 }], options: { Size: '41' } }
    ],
    discountable: true,
    category_id: 'pcat_01KMBGJE84SV12PW1RD7DRXHAS'
  },
  {
    title: 'AIR FORCE 1 LUXE Sneakers',
    handle: 'air-force-1-luxe-new',
    subtitle: 'Air-Sole unit',
    description: 'The iconic Air Force 1 with premium materials.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/AIR-FORCE-1-LUXE-UNISEX-1.png',
    options: [{ title: 'Size', values: ['40', '41', '42'] }],
    variants: [
      { title: 'White / 41', prices: [{ currency_code: 'egp', amount: 3000 }], options: { Size: '41' } }
    ],
    discountable: true,
    category_id: 'pcat_01KMBGJE83EQ9MF531M9ACVX9X'
  },
  {
    title: 'CLASSIC CUPSOLE Sneakers',
    handle: 'classic-cupsole-new',
    subtitle: 'Retro court style',
    description: 'Retro court style reimagined for today.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/CLASSIC-CUPSOLE-1.png',
    options: [{ title: 'Size', values: ['40', '41', '42'] }],
    variants: [
      { title: 'White / 41', prices: [{ currency_code: 'egp', amount: 2000 }], options: { Size: '41' } }
    ],
    discountable: true,
    category_id: 'pcat_01KMBGJE83EQ9MF531M9ACVX9X'
  }
]

export default async function createProductsWithCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('=== Creating Products with Categories ===')

  const { result } = await createProductsWorkflow(container).run({
    input: { products: productsToInsert }
  })

  logger.info(`Created ${result.length} products with categories`)
  logger.info('=== Finished ===')
}
