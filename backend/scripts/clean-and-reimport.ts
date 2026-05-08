/**
 * Clean All Products and Re-import
 * حذف جميع المنتجات وإعادة الاستيراد من جديد
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { deleteProductsWorkflow } from '@medusajs/medusa/core-flows'

export default async function cleanAndReimport({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('═══════════════════════════════════════')
  logger.info('🗑️  Clean and Re-import Products')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title'],
    filters: {},
  })

  logger.info(`Found ${products.length} products to delete`)
  logger.info('')

  if (products.length === 0) {
    logger.info('✅ No products to delete')
    logger.info('')
    logger.info('Now run: npm run import:professional')
    return
  }

  // Delete products in batches
  const BATCH_SIZE = 20
  let deletedCount = 0

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(products.length / BATCH_SIZE)

    logger.info(`🗑️  Deleting batch ${batchNum}/${totalBatches} (${batch.length} products)`)

    try {
      await deleteProductsWorkflow(container).run({
        input: {
          ids: batch.map((p: any) => p.id),
        },
      })
      deletedCount += batch.length
      logger.info(`   ✅ Deleted ${deletedCount}/${products.length}`)
    } catch (error) {
      logger.error(`   ❌ Error deleting batch: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Deleted ${deletedCount} products`)
  logger.info('═══════════════════════════════════════')
  logger.info('')
  logger.info('📝 Next steps:')
  logger.info('   1. Make sure your Excel files are ready')
  logger.info('   2. Add product images to: data-products/images/')
  logger.info('   3. Run: npm run import:professional')
  logger.info('')
}
