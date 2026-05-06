import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'

export default async function createMegaTestProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  
  logger.info('=== Creating Mega Test Product ===')

  // 1. Get default sales channel
  const [salesChannel] = await salesChannelModule.listSalesChannels({ 
    name: 'Default Sales Channel' 
  })
  
  if (!salesChannel) {
    logger.error('No default sales channel found. Please run seed first.')
    return
  }

  // 2. Get first available stock location
  const [stockLocation] = await stockLocationModule.listStockLocations({})
  if (!stockLocation) {
    logger.error('No stock location found. Please run seed first.')
    return
  }

  // 3. Create Product
  const productData = {
    title: "Mawgood Mega Test Product",
    subtitle: "Premium Testing Quality",
    description: "This is a product created for testing purposes with 1000 units of stock.",
    handle: "mawgood-mega-test-product-" + Date.now(),
    status: "published" as any,
    thumbnail: "https://mawgood.cloud/logo.png",
    options: [{ title: "Size", values: ["One Size"] }],
    variants: [{
      title: "Default",
      sku: "TEST-MEGA-" + Date.now(),
      manage_inventory: true,
      prices: [
        { currency_code: "egp", amount: 10 },
        { currency_code: "usd", amount: 1 }
      ],
      options: { "Size": "One Size" }
    }],
    sales_channels: [{ id: salesChannel.id }]
  }

  logger.info(`Creating product: ${productData.title}...`)
  
  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [productData]
    }
  })

  const product = products[0]

  // 4. Set stock level
  const inventoryService = container.resolve(Modules.INVENTORY)
  
  // Find inventory items created for the variants
  for (const variant of product.variants) {
    const inventoryItems = await inventoryService.listInventoryItems({
      sku: variant.sku
    })

    if (inventoryItems.length > 0) {
      logger.info(`Setting stock (1000) for variant: ${variant.title}...`)
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map(item => ({
            inventory_item_id: item.id,
            location_id: stockLocation.id,
            stocked_quantity: 1000
          }))
        }
      })
    }
  }

  logger.info('=== Success! Product Created ===')
  logger.info(`Product Title: ${product.title}`)
  logger.info(`Product Handle: ${product.handle}`)
}
