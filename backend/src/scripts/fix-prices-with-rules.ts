import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function fixPricesWithRules({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Fixing Prices with Region Rules ===')

  // Get region
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
    filters: {}
  })

  const region = regions.find(r => r.name === 'Arab Countries')
  if (!region) {
    logger.info('No region found')
    return
  }

  logger.info(`Region: ${region.name} (${region.id})`)

  // Get products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title', 'variants.id'],
    filters: {}
  })

  const priceModule = container.resolve(Modules.PRICING)
  
  // Delete existing prices and create new ones with region rules
  for (const product of products) {
    if (!product.variants?.length) continue
    
    for (const variant of product.variants) {
      // Delete existing prices for this variant
      try {
        // Get price set ID
        const priceSets = await query.graph({
          entity: 'money_amount',
          fields: ['id', 'price_set_id'],
          filters: {
            variant_id: variant.id
          }
        })
        
        if (priceSets.data.length > 0) {
          for (const price of priceSets.data) {
            await priceModule.deletePrices([price.id])
          }
        }
        
        // Create new price with region rule
        const priceSetId = priceSets.data[0]?.price_set_id
        
        if (priceSetId) {
          // Create price with region rule
          await priceModule.createPrices([
            {
              price_set_id: priceSetId,
              amount: 100,
              currency_code: 'egp',
              rules: [
                { rule_type: 'region_id', value: region.id }
              ]
            }
          ])
        }
        
        logger.info(`Fixed price for variant ${variant.id}`)
      } catch (err: any) {
        logger.info(`Error: ${err.message}`)
      }
    }
  }

  logger.info('=== Finished ===')
}
