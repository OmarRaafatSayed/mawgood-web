/**
 * Check Specific Product by Handle
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function checkSpecificProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const handleToCheck = 'esh027'

  logger.info(`=== Checking Product: ${handleToCheck} ===`)
  logger.info('')

  // Get product by handle
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'status', 'description'],
    filters: { handle: handleToCheck },
  })

  if (products.length === 0) {
    logger.error(`❌ Product with handle "${handleToCheck}" not found!`)
    return
  }

  const product = products[0]
  logger.info(`✅ Product found!`)
  logger.info(`   Title: ${product.title}`)
  logger.info(`   Handle: ${product.handle}`)
  logger.info(`   Status: ${product.status}`)
  logger.info(`   Description: ${product.description?.substring(0, 100)}...`)
  logger.info('')

  // Get variants
  const { data: variants } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'title', 'sku'],
    filters: { product_id: product.id },
  })

  logger.info(`   Variants: ${variants.length}`)
  variants.slice(0, 5).forEach((v: any) => {
    logger.info(`      - ${v.title} (${v.sku})`)
  })

  logger.info('')
  logger.info('=== Check Complete ===')
}
