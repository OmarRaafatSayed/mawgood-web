import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export default async function testCartCreation({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info('=== Testing Cart Creation ===')
  
  const cartService = container.resolve(Modules.CART)
  const regionService = container.resolve(Modules.REGION)
  
  const region = await regionService.retrieveRegion('reg_01KMBGJDZHTNG356YABC358AHY', {
    select: ['id', 'currency_code']
  })
  
  logger.info(`Region: ${region.name}, Currency: ${region.currency_code}`)
  
  try {
    const cart = await cartService.createCarts({
      region_id: region.id,
      currency_code: region.currency_code || 'egp'
    })
    logger.info(`SUCCESS: Cart created with ID: ${cart.id}`)
    logger.info(`Cart currency: ${(cart as any).currency_code}`)
  } catch (error: any) {
    logger.error(`FAILED: ${error.message}`)
  }

  logger.info('\n=== Finished ===')
}
