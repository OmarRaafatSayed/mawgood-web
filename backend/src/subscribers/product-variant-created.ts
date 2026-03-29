import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function productVariantCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)

  const variant = await productModuleService.retrieveProductVariant(data.id, {
    relations: ["inventory_items"]
  })

  // Skip if inventory item already exists
  if (variant.inventory_items && variant.inventory_items.length > 0) {
    return
  }

  // Create inventory item for the variant
  const inventoryItem = await inventoryModuleService.createInventoryItems({
    sku: variant.sku || `${variant.product_id}-${variant.id}`,
    title: variant.title || "Inventory Item"
  })

  // Link inventory item to variant
  await productModuleService.updateProductVariants(variant.id, {
    inventory_items: [
      {
        inventory_item_id: inventoryItem.id,
        required_quantity: 1
      }
    ]
  })

  // Get all stock locations and create inventory levels
  const stockLocations = await stockLocationModuleService.listStockLocations()
  
  if (stockLocations.length > 0) {
    const inventoryLevels = stockLocations.map(location => ({
      inventory_item_id: inventoryItem.id,
      location_id: location.id,
      stocked_quantity: 0
    }))

    await inventoryModuleService.createInventoryLevels(inventoryLevels)
  }
}

export const config: SubscriberConfig = {
  event: "product-variant.created",
}
