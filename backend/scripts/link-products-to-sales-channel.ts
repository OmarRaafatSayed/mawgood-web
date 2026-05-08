/**
 * Link all products to the default sales channel
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export default async function linkProductsToSalesChannel({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  logger.info('=== Linking Products to Sales Channel ===')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title'],
    filters: {},
  })

  logger.info(`Found ${products.length} products`)

  // Get the default sales channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })

  if (salesChannels.length === 0) {
    logger.error('No sales channel found!')
    return
  }

  const salesChannel = salesChannels[0]
  logger.info(`Using sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // Link each product to the sales channel
  let linked = 0
  for (const product of products) {
    try {
      await remoteLink.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [Modules.SALES_CHANNEL]: {
          sales_channel_id: salesChannel.id,
        },
      })
      linked++
      if (linked % 50 === 0) {
        logger.info(`Linked ${linked}/${products.length} products...`)
      }
    } catch (error: any) {
      // Ignore if already linked
      if (!error.message?.includes('already exists')) {
        logger.warn(`Failed to link product ${product.title}: ${error.message}`)
      }
    }
  }

  logger.info(`\n=== Successfully linked ${linked} products to sales channel ===`)
}
