import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ProductStatus } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'

const productsToInsert = [
  {
    title: 'AIR FORCE 1 LUXE UNISEX Sneakers',
    handle: 'air-force-1-luxe-unisex-sneakers',
    subtitle: 'foam midsole with Air-Sole unit',
    description: 'The iconic Air Force 1 with premium materials and enhanced comfort. Features a full-grain leather upper',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/AIR-FORCE-1-LUXE-UNISEX-1.png',
    options: [{ title: 'Color', values: ['White'] }],
    variants: [{
      title: 'White',
      allow_backorder: false,
      manage_inventory: true,
      prices: [{ currency_code: 'egp', amount: 3000 }],
      options: { Color: 'White' }
    }],
    discountable: true,
    images: [{ url: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/AIR-FORCE-1-LUXE-UNISEX-1.png' }]
  },
  {
    title: 'New Runner Flag Sneakers',
    handle: 'new-runner-flag-sneakers',
    subtitle: 'Heritage-inspired running',
    description: 'Heritage-inspired running silhouette featuring distinctive flag details and national color accents.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/New-Runner-Flag-1.png',
    options: [{ title: 'Size', values: ['38', '39', '40', '41'] }],
    variants: [
      { title: 'Brown / 40', prices: [{ currency_code: 'egp', amount: 2500 }], options: { Size: '40' } },
      { title: 'Brown / 41', prices: [{ currency_code: 'egp', amount: 2500 }], options: { Size: '41' } }
    ],
    discountable: true
  },
  {
    title: 'CLASSIC CUPSOLE Sneakers',
    handle: 'classic-cupsole-sneakers',
    subtitle: 'Retro court style',
    description: 'Retro court style reimagined for today',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/CLASSIC-CUPSOLE-1.png',
    options: [{ title: 'Size', values: ['40', '41', '42'] }],
    variants: [
      { title: 'White / 40', prices: [{ currency_code: 'egp', amount: 2000 }], options: { Size: '40' } },
      { title: 'White / 41', prices: [{ currency_code: 'egp', amount: 2000 }], options: { Size: '41' } }
    ],
    discountable: true
  },
  {
    title: 'STORM 96 2K LITE Sneakers',
    handle: 'storm-96-2k-lite',
    subtitle: 'Retro-futuristic design',
    description: "Retro-futuristic design combining '90s athletic aesthetics with contemporary technology.",
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/STORM-96-2K-LITE-1.png',
    options: [{ title: 'Size', values: ['40', '41', '42'] }],
    variants: [
      { title: 'Black / 41', prices: [{ currency_code: 'egp', amount: 3500 }], options: { Size: '41' } },
      { title: 'Black / 42', prices: [{ currency_code: 'egp', amount: 3500 }], options: { Size: '42' } }
    ],
    discountable: true
  },
  {
    title: 'U574 UNISEX Sneakers',
    handle: 'u574-unisex-sneakers',
    subtitle: 'Classic 574 silhouette',
    description: 'Featuring the classic 574 silhouette with updated materials and cushioning.',
    is_giftcard: false,
    status: ProductStatus.PUBLISHED,
    thumbnail: 'https://mercur-connect.s3.eu-central-1.amazonaws.com/U574-UNISEX-1.png',
    options: [{ title: 'Size', values: ['37', '38', '39', '40'] }],
    variants: [
      { title: 'Orange / 38', prices: [{ currency_code: 'egp', amount: 2800 }], options: { Size: '38' } }
    ],
    discountable: true
  }
]

export default async function seedProductsOnly({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('=== Creating Products (without seller) ===')

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // Get sales channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id'],
    filters: {}
  })
  
  const salesChannelId = salesChannels[0]?.id
  if (!salesChannelId) {
    logger.info('No sales channel found, creating products without sales channel')
  }

  const productsWithSalesChannel = productsToInsert.map(p => ({
    ...p,
    ...(salesChannelId ? { sales_channels: [{ id: salesChannelId }] } : {})
  }))

  const { result } = await createProductsWorkflow(container).run({
    input: { products: productsWithSalesChannel }
  })

  logger.info(`Created ${result.length} products`)

  // Create inventory levels
  const inventoryService = container.resolve(Modules.INVENTORY)
  const items = await inventoryService.listInventoryItems({}, { select: ['id'] })
  
  const stockLocationQuery = await query.graph({
    entity: 'stock_location',
    fields: ['id'],
    filters: {}
  })
  const stockLocationId = stockLocationQuery.data[0]?.id

  if (stockLocationId && items.length > 0) {
    const inventoryLevels = items.map(i => ({
      inventory_item_id: i.id,
      location_id: stockLocationId,
      stocked_quantity: Math.floor(Math.random() * 50) + 10
    }))

    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels }
    })
    logger.info('Created inventory levels')
  }

  logger.info('=== Finished ===')
}
