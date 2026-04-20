import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function debugRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const currencyService = container.resolve(Modules.CURRENCY)

  logger.info('=== Debugging Region and Currencies ===')

  const regions = await regionService.listRegions({})
  logger.info(`Found ${regions.length} regions`)

  for (const region of regions) {
    logger.info(`\nRegion: ${region.name} (${region.id})`)
    logger.info(`  Currency Code: ${region.currency_code}`)
    logger.info(`  Created At: ${region.created_at}`)
  }

  const currencies = await currencyService.listCurrencies({})
  logger.info(`\n=== Currencies (${currencies.length}) ===`)
  for (const currency of currencies) {
    logger.info(`  ${currency.code} - ${currency.name}`)
  }

  logger.info('\n=== Testing Cart Creation with explicit currency ===')

  const cartService = container.resolve(Modules.CART)

  try {
    const cart = await cartService.createCarts({
      region_id: 'reg_01KMBGJDZHTNG356YABC358AHY',
      currency_code: 'egp'
    })
    logger.info(`Cart created successfully: ${cart.id}`)
  } catch (error: any) {
    logger.error(`Cart creation failed: ${error.message}`)
  }

  logger.info('\n=== Finished ===')
}
