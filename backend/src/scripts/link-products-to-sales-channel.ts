import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function linkProductsToSalesChannel({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Linking Products to Sales Channel ===')

  // Get the default sales channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {}
  })

  const salesChannel = salesChannels.find(sc => sc.name === 'Default Sales Channel')
  if (!salesChannel) {
    logger.info('No sales channel found')
    return
  }

  logger.info(`Sales Channel: ${salesChannel.name} (${salesChannel.id})`)

  // Get products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title'],
    filters: {}
  })

  logger.info(`Found ${products.length} products`)

  // Link products to sales channel
  const links = products.map(p => ({
    [Modules.PRODUCT]: {
      product_id: p.id
    },
    [Modules.SALES_CHANNEL]: {
      sales_channel_id: salesChannel.id
    }
  }))

  if (links.length > 0) {
    await link.create(links)
    logger.info(`Linked ${links.length} products to sales channel`)
  }

  logger.info('=== Finished ===')
}
