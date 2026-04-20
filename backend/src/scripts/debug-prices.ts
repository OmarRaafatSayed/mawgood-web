import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function debugPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Debugging Prices ===')

  // Get products with variant prices
  const { data: products } = await query.graph({
    entity: 'product',
    fields: [
      'id', 
      'title', 
      'handle',
      'variants.id',
      'variants.title',
      'variants.prices.*'
    ],
    filters: {}
  })

  for (const product of products) {
    logger.info(`Product: ${product.title} (${product.handle})`)
    if (product.variants) {
      for (const variant of product.variants) {
        logger.info(`  Variant: ${variant.title}`)
        logger.info(`  Prices: ${JSON.stringify(variant.prices)}`)
      }
    }
  }

  logger.info('=== Finished ===')
}
