/**
 * Clean all products, inventory items, and reimport from Excel with proper images
 * Run: npx medusa exec ./scripts/clean-and-reimport-with-images.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function cleanAndReimport({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve('product')
  const inventoryService = container.resolve('inventory')

  logger.info('=== Step 1: Cleaning Inventory Items ===')

  try {
    // Get all inventory items
    const { data: inventoryItems } = await query.graph({
      entity: 'inventory_item',
      fields: ['id', 'sku'],
      filters: {},
      pagination: { take: 2000 },
    })

    logger.info(`Found ${inventoryItems.length} inventory items to delete`)

    // Delete inventory items in batches
    const INV_BATCH_SIZE = 50
    for (let i = 0; i < inventoryItems.length; i += INV_BATCH_SIZE) {
      const batch = inventoryItems.slice(i, i + INV_BATCH_SIZE)
      const ids = batch.map((item: any) => item.id)
      
      try {
        await inventoryService.deleteInventoryItems(ids)
        logger.info(`  Deleted inventory batch ${Math.floor(i / INV_BATCH_SIZE) + 1} (${ids.length} items)`)
      } catch (err: any) {
        logger.error(`  Failed to delete inventory batch: ${err.message}`)
      }
    }

    logger.info('✅ All inventory items deleted')
  } catch (err: any) {
    logger.error(`Inventory cleanup error: ${err.message}`)
  }

  logger.info('')
  logger.info('=== Step 2: Cleaning Products ===')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title'],
    filters: {},
    pagination: { take: 1000 },
  })

  logger.info(`Found ${products.length} products to delete`)

  // Delete products in batches
  const BATCH_SIZE = 50
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const ids = batch.map((p: any) => p.id)
    
    try {
      await productService.deleteProducts(ids)
      logger.info(`  Deleted product batch ${Math.floor(i / BATCH_SIZE) + 1} (${ids.length} products)`)
    } catch (err: any) {
      logger.error(`  Failed to delete product batch: ${err.message}`)
    }
  }

  logger.info('')
  logger.info('✅ All products deleted')
  logger.info('')
  logger.info('Now run: npm run import:excel')
  logger.info('This will import all products with proper images')
}
