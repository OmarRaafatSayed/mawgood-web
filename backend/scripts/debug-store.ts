// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export default async function debugStore({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info('=== Debugging Store Configuration ===')
  
  const storeModule = container.resolve(Modules.STORE)
  
  const stores = await storeModule.retrieveStore('store_01KMBGJDZHTNG356YABC358AHY', {
    relations: ['currencies']
  }).catch(() => null)
  
  if (!stores) {
    const allStores = await storeModule.listStores({})
    logger.info(`Found ${allStores.length} stores`)
    
    if (allStores.length > 0) {
      const store = allStores[0]
      logger.info(`\nStore: ${store.name}`)
      logger.info(`  Default Currency: ${store.default_currency_code}`)
      logger.info(`  Currencies: ${store.currencies?.map((c: any) => c.code).join(', ') || 'none'}`)
    }
  } else {
    logger.info(`Store: ${stores.name}`)
    logger.info(`  Default Currency: ${stores.default_currency_code}`)
  }

  logger.info('\n=== Testing Cart Creation ===')
  const cartService = container.resolve(Modules.CART)

  try {
    const cart = await cartService.createCarts({
      region_id: 'reg_01KMBGJDZHTNG356YABC358AHY',
      currency_code: 'egp'
    })
    logger.info(`Cart created: ${cart.id}`)
  } catch (error: any) {
    logger.error(`Cart creation failed: ${error.message}`)
  }

  logger.info('\n=== Finished ===')
}
