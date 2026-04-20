import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function debugInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('Fetching all products with variants and inventory...')
  
  const result = await query.graph({
    entity: 'product',
    fields: [
      'id',
      'title',
      'status',
      'variants.id',
      'variants.title',
      'variants.sku',
      'variants.manage_inventory',
      'variants.allow_backorder',
      'variants.inventory_items.id',
      'variants.inventory_items.stocked_quantity',
      'variants.inventory_items.reserved_quantity',
      'variants.prices.id',
      'variants.prices.currency_code',
      'variants.prices.amount',
    ],
    filters: {}
  })

  logger.info(`Found ${result.data.length} products`)
  
  for (const product of result.data) {
    logger.info(`\n=== Product: ${product.title} (${product.id}) ===`)
    logger.info(`Status: ${product.status}`)
    logger.info(`Variants: ${product.variants?.length || 0}`)
    
    for (const variant of product.variants || []) {
      logger.info(`  - Variant: ${variant.title} (${variant.id})`)
      logger.info(`    SKU: ${variant.sku}`)
      logger.info(`    Manage Inventory: ${variant.manage_inventory}`)
      logger.info(`    Allow Backorder: ${variant.allow_backorder}`)
      logger.info(`    Inventory Items: ${variant.inventory_items?.length || 0}`)
      
      if (variant.inventory_items && variant.inventory_items.length > 0) {
        for (const inv of variant.inventory_items) {
          logger.info(`      - ID: ${inv.id}, Stocked: ${inv.stocked_quantity}, Reserved: ${inv.reserved_quantity}`)
        }
      }
      
      logger.info(`    Prices: ${variant.prices?.length || 0}`)
      for (const price of variant.prices || []) {
        logger.info(`      - ${price.currency_code}: ${price.amount}`)
      }
    }
  }

  logger.info('\n=== Finished ===')
}
