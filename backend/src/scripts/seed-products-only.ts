import { ExecArgs } from '@medusajs/framework/types'

import {
  createInventoryItemStockLevels,
  createProductCategories,
  createProductCollections,
  createSeller,
  createSellerProducts,
  createSellerShippingOption,
  createSellerStockLocation,
  createServiceZoneForFulfillmentSet
} from './seed/seed-functions'

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve('logger')

  logger.info('=== Creating Products ==='
  
  logger.info('Creating product categories...')
  await createProductCategories(container)
  
  logger.info('Creating product collections...')
  await createProductCollections(container)
  
  logger.info('Creating seller...')
  const seller = await createSeller(container)
  
  logger.info('Creating seller stock location...')
  const salesChannelId = 'sc_01KMBGJDXQHNG356YABC358AHY' // Replace with your sales channel ID
  const stockLocation = await createSellerStockLocation(
    container,
    seller.id,
    salesChannelId
  )
  
  logger.info('Creating service zone...')
  const serviceZone = await createServiceZoneForFulfillmentSet(
    container,
    seller.id,
    stockLocation.fulfillment_sets[0].id
  )
  
  logger.info('Creating seller shipping option...')
  const regionId = 'reg_01KMBGJDZHTNG356YABC358AHY' // Replace with your region ID
  await createSellerShippingOption(
    container,
    seller.id,
    seller.name,
    regionId,
    serviceZone.id
  )
  
  logger.info('Creating seller products...')
  await createSellerProducts(container, seller.id, salesChannelId)
  
  logger.info('Creating inventory levels...')
  await createInventoryItemStockLevels(container, stockLocation.id)
  
  logger.info('=== Finished ===')
}
