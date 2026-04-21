// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function fixInventoryItems({ container }: ExecArgs) {
  const logger = container.resolve('logger')
  const productModuleService = container.resolve(Modules.PRODUCT)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)

  logger.info('Fetching all product variants...')
  
  const variants = await productModuleService.listProductVariants({}, {
    relations: ['inventory_items']
  })

  logger.info(`Found ${variants.length} variants`)

  const stockLocations = await stockLocationModuleService.listStockLocations()
  
  for (const variant of variants) {
    if (!variant.inventory_items || variant.inventory_items.length === 0) {
      logger.info(`Creating inventory item for variant: ${variant.id}`)
      
      const inventoryItem = await inventoryModuleService.createInventoryItems({
        sku: variant.sku || `${variant.product_id}-${variant.id}`,
        title: variant.title || 'Inventory Item'
      })

      await productModuleService.updateProductVariants(variant.id, {
        inventory_items: [
          {
            inventory_item_id: inventoryItem.id,
            required_quantity: 1
          }
        ]
      })

      if (stockLocations.length > 0) {
        const inventoryLevels = stockLocations.map(location => ({
          inventory_item_id: inventoryItem.id,
          location_id: location.id,
          stocked_quantity: 0
        }))

        await inventoryModuleService.createInventoryLevels(inventoryLevels)
      }
      
      logger.info(`✓ Created inventory item for variant: ${variant.id}`)
    }
  }

  logger.info('=== Finished fixing inventory items ===')
}
