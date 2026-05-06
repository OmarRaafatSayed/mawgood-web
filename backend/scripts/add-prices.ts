import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows'

export default async function addPricesToProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Adding Prices to Products ===')

  // Get the Arab Countries region
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
    filters: {}
  })
  
  const region = regions.find(r => r.name === 'Arab Countries')
  logger.info(`Region: ${JSON.stringify(region)}`)

  // Get products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title', 'variants.id', 'variants.title'],
    filters: {}
  })

  logger.info(`Found ${products.length} products`)

  // Prices in EGP
  const priceMap: Record<string, number> = {
    'u574-unisex-sneakers': 2800,
    'new-runner-flag-sneakers': 2500,
    'storm-96-2k-lite': 3500,
    'air-force-1-luxe-unisex-sneakers': 3000,
    'classic-cupsole-sneakers': 2000,
  }

  const updates: any[] = []

  for (const product of products) {
    const price = priceMap[product.handle || '']
    if (price && product.variants) {
      for (const variant of product.variants) {
        updates.push({
          id: product.id,
          variants: [{
            id: variant.id,
            prices: [
              { 
                currency_code: 'egp', 
                amount: price,
                region_id: region?.id
              }
            ]
          }]
        })
      }
      logger.info(`Adding prices to ${product.title}`)
    }
  }

  if (updates.length > 0) {
    logger.info(`Updating ${updates.length} variant prices...`)
    await updateProductsWorkflow(container).run({
      input: { products: updates }
    })
    logger.info('Updated prices successfully')
  }

  logger.info('=== Finished ===')
}
