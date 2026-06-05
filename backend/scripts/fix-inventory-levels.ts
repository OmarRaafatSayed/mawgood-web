// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function fixInventoryLevels({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

  // Get all stock locations
  const [stockLocations] = await stockLocationService.listAndCountStockLocations({}, { take: 100 })
  logger.info(`📦  Found ${stockLocations.length} stock locations`)

  // Use default location (prefer "Default Store Location")
  const defaultLocation =
    stockLocations.find(l => l.name === 'Default Store Location') ||
    stockLocations[0]

  if (!defaultLocation) {
    logger.error('❌ No stock location found! Please create one first.')
    return
  }
  logger.info(`✅  Using location: "${defaultLocation.name}" (${defaultLocation.id})`)

  // Get all inventory items
  const [allItems] = await inventoryService.listAndCountInventoryItems({}, { take: 10000 })
  logger.info(`🔍  Total inventory items: ${allItems.length}`)

  // Get existing levels
  const [existingLevels] = await inventoryService.listAndCountInventoryLevels({}, { take: 20000 })
  const existingItemIds = new Set(existingLevels.map(l => l.inventory_item_id))
  logger.info(`📊  Items with levels: ${existingItemIds.size}`)

  // Find items missing levels
  const itemsWithoutLevels = allItems.filter(item => !existingItemIds.has(item.id))
  logger.info(`⚠️   Items missing levels: ${itemsWithoutLevels.length}`)

  if (itemsWithoutLevels.length === 0) {
    logger.info('✅  All inventory items already have levels!')
    return
  }

  // Create inventory levels in batches
  const BATCH_SIZE = 50
  let created = 0
  let failed = 0

  for (let i = 0; i < itemsWithoutLevels.length; i += BATCH_SIZE) {
    const batch = itemsWithoutLevels.slice(i, i + BATCH_SIZE)

    for (const item of batch) {
      try {
        await inventoryService.createInventoryLevels({
          inventory_item_id: item.id,
          location_id: defaultLocation.id,
          stocked_quantity: 100,
        })
        created++
      } catch (e) {
        // might already exist — skip
        if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
          logger.warn(`   Failed for item ${item.id}: ${e.message}`)
          failed++
        } else {
          created++
        }
      }
    }

    logger.info(`   Progress: ${Math.min(i + BATCH_SIZE, itemsWithoutLevels.length)} / ${itemsWithoutLevels.length}`)
  }

  logger.info(`✅  Done!`)
  logger.info(`   Created: ${created} inventory levels`)
  if (failed > 0) logger.warn(`   Failed: ${failed}`)
  logger.info(`   Each variant now has 100 units in "${defaultLocation.name}"`)
}
