import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function assignCategoriesToProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Assigning Categories to Products ===')

  // Get categories
  const { data: categories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'handle', 'name'],
    filters: {}
  })

  // Get products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title'],
    filters: {}
  })

  // Map product handles to category handles
  const productCategoryMap: Record<string, string> = {
    'u574-unisex-sneakers': 'Apparel & Accessories',
    'new-runner-flag-sneakers': 'Sports & Entertainment',
    'classic-cupsole-sneakers': 'Apparel & Accessories',
    'storm-96-2k-lite': 'Sports & Entertainment',
    'air-force-1-luxe-unisex-sneakers': 'Apparel & Accessories',
  }

  // Get database module
  const dbModule = container.resolve(Modules.DATABASE)
  
  let updated = 0

  for (const product of products) {
    const categoryHandle = productCategoryMap[product.handle || '']
    if (categoryHandle) {
      const category = categories.find(c => c.handle === categoryHandle)
      if (category) {
        logger.info(`Updating ${product.title} with category ${category.name}`)
        
        try {
          await dbModule.withTransaction(async (manager: any) => {
            await manager.query(`
              INSERT INTO product_category_product (product_id, product_category_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [product.id, category.id])
          })
          updated++
          logger.info(`Updated ${product.title} successfully`)
        } catch (err: any) {
          logger.info(`Error: ${err.message}`)
        }
      }
    }
  }

  logger.info(`Updated ${updated} products`)
  logger.info('=== Finished ===')
}
