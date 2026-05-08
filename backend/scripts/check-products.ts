/**
 * Check Products in Database
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function checkProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Checking Products ===')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'status', 'created_at'],
    filters: {},
  })

  logger.info(`Total products in database: ${products.length}`)

  if (products.length > 0) {
    logger.info('\nFirst 10 products:')
    products.slice(0, 10).forEach((p: any, i: number) => {
      logger.info(`${i + 1}. ${p.title} (${p.status}) - ${p.handle}`)
    })
  }

  // Check sales channels
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })

  logger.info(`\nSales Channels: ${salesChannels.length}`)
  salesChannels.forEach((sc: any) => {
    logger.info(`  - ${sc.name} (${sc.id})`)
  })

  // Check product variants and prices
  logger.info('\nChecking product variants and prices...')
  const firstProduct = products[0]
  
  if (firstProduct) {
    const { data: variants } = await query.graph({
      entity: 'product_variant',
      fields: ['id', 'title', 'sku', 'product_id'],
      filters: { product_id: firstProduct.id },
    })
    
    logger.info(`\nSample Product: ${firstProduct.title}`)
    logger.info(`  Status: ${firstProduct.status}`)
    logger.info(`  Variants: ${variants.length}`)
    
    if (variants.length > 0) {
      const variant = variants[0]
      logger.info(`  First Variant: ${variant.title || 'Default'}`)
      logger.info(`    SKU: ${variant.sku}`)
    }
  }
  
  // Check all prices in the system
  const { data: allPrices } = await query.graph({
    entity: 'price',
    fields: ['id', 'amount', 'currency_code'],
    filters: {},
  })
  
  logger.info(`\nTotal Prices in database: ${allPrices.length}`)
  if (allPrices.length > 0) {
    logger.info('Sample prices:')
    allPrices.slice(0, 5).forEach((price: any) => {
      logger.info(`  - ${price.amount / 100} ${price.currency_code}`)
    })
  } else {
    logger.warn('WARNING: No prices found in database! Products need prices to be visible.')
  }
  
  // Check regions
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
    filters: {},
  })
  
  logger.info(`\nRegions: ${regions.length}`)
  regions.forEach((region: any) => {
    logger.info(`  - ${region.name} (${region.currency_code})`)
  })

  logger.info('\n=== Check Complete ===')
}
