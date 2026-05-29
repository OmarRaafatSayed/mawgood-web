import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { IInventoryService, IStockLocationService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Auto-link new inventory items to the default stock location.
 * This prevents the "0 available at 0 locations" issue for every new product.
 */
export default async function autoLinkInventorySubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)
  const stockLocationService: IStockLocationService = container.resolve(Modules.STOCK_LOCATION)

  try {
    // Get all stock locations
    const stock_locations = await stockLocationService.listStockLocations({}, { take: 1 })

    if (!stock_locations || stock_locations.length === 0) {
      console.log("[auto-link-inventory] No stock locations found, skipping")
      return
    }

    const locationId = stock_locations[0].id
    const itemId = data.id

    // Check if already linked
    const levels = await inventoryService.listInventoryLevels({ inventory_item_id: itemId })

    if (levels && levels.length > 0) {
      console.log(`[auto-link-inventory] Item ${itemId} already linked, skipping`)
      return
    }

    // Link to default location with 9999 stock
    await inventoryService.createInventoryLevels([{
      inventory_item_id: itemId,
      location_id: locationId,
      stocked_quantity: 9999,
    }])

    console.log(`[auto-link-inventory] Linked ${itemId} to ${locationId} with 9999 stock`)
  } catch (error) {
    console.error("[auto-link-inventory] Error:", error.message)
  }
}

export const config: SubscriberConfig = {
  event: "inventory-item.created",
}
