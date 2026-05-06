// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function debugInventoryLevels({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

  logger.info('=== Debugging Inventory Levels ===')

  const inventoryItems = await inventoryService.listInventoryItems({}, {
    select: ['id', 'sku', 'title'],
  })

  logger.info(`Found ${inventoryItems.length} inventory items`)

  for (const item of inventoryItems) {
    logger.info(`\nInventory Item: ${item.title || item.sku} (${item.id})`)

    const levels = await inventoryService.listInventoryLevels({
      inventory_item_id: item.id
    })

    logger.info(`  Levels: ${levels.length}`)
    for (const level of levels) {
      logger.info(`    - Location: ${level.location_id}`)
      logger.info(`      Stocked: ${level.stocked_quantity}`)
      logger.info(`      Reserved: ${level.reserved_quantity}`)
    }
  }

  const stockLocations = await stockLocationService.listStockLocations()
  
  logger.info(`\n=== Stock Locations (${stockLocations.length}) ===`)
  for (const loc of stockLocations) {
    logger.info(`  - ${loc.name} (${loc.id})`)
  }

  logger.info('\n=== Finished ===')
}
