/**
 * Update Product Handles to Use Product Code Only
 * تحديث handles المنتجات لتستخدم الكود فقط
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function updateProductHandles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('=== 🔄 Updating Product Handles ===')
  logger.info('')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle'],
    filters: {},
  })

  logger.info(`📊 Total products: ${products.length}`)
  logger.info('')

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      // Extract code from current handle (first part before dash)
      // Example: hix001-something-123456 -> hix001
      const currentHandle = product.handle
      const code = currentHandle.split('-')[0]

      // Skip if already in correct format (no dashes or only code)
      if (currentHandle === code) {
        logger.info(`   ⏭️  Skipped: ${product.title} (already correct: ${currentHandle})`)
        continue
      }

      // Update handle to use only the code
      await productModuleService.updateProducts(product.id, {
        handle: code,
      })

      successCount++
      logger.info(`   ✅ Updated: ${product.title}`)
      logger.info(`      Old: ${currentHandle} → New: ${code}`)
    } catch (error) {
      errorCount++
      const errorMsg = `${product.title} - ${error.message}`
      errors.push(errorMsg)
      logger.error(`   ❌ ${errorMsg}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 Update Summary')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Successfully updated: ${successCount} products`)
  if (errorCount > 0) {
    logger.warn(`❌ Failed: ${errorCount} products`)
    logger.info('')
    logger.info('Failed products:')
    errors.forEach(err => logger.error(`   - ${err}`))
  }
  logger.info('')
  logger.info('🎉 Product handles updated successfully!')
  logger.info('═══════════════════════════════════════')
}
