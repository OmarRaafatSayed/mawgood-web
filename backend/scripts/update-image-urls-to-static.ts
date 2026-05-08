/**
 * Update Image URLs to Point to Static Folder
 * تحديث روابط الصور للإشارة إلى المجلد الثابت
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function updateImageUrlsToStatic({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('═══════════════════════════════════════')
  logger.info('🔗 Update Image URLs to Static Path')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  // Get all products with images
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'thumbnail', 'images'],
    filters: {},
  })

  logger.info(`📦 Found ${products.length} products`)
  logger.info('')

  let updatedCount = 0
  let skippedCount = 0

  for (const product of products) {
    try {
      // Check if product has images that need updating
      if (!product.thumbnail || !product.thumbnail.includes('/extracted-images/')) {
        skippedCount++
        continue
      }

      // Update thumbnail URL
      const newThumbnail = product.thumbnail.replace(
        '/extracted-images/',
        'http://localhost:9000/static/extracted-images/'
      )

      // Update images array URLs
      const newImages = product.images?.map((img: any) => ({
        ...img,
        url: img.url.replace(
          '/extracted-images/',
          'http://localhost:9000/static/extracted-images/'
        ),
      })) || []

      // Update product
      await productModuleService.updateProducts(product.id, {
        thumbnail: newThumbnail,
        images: newImages,
      })

      updatedCount++
      logger.info(`   ✅ ${product.title}`)

    } catch (error) {
      logger.error(`   ❌ ${product.title}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 UPDATE SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Products updated: ${updatedCount}`)
  logger.info(`⏭️  Products skipped: ${skippedCount}`)
  logger.info('')
  logger.info('🌐 Images are now accessible at:')
  logger.info('   http://localhost:9000/static/extracted-images/')
  logger.info('')
  logger.info('🎉 All image URLs updated successfully!')
  logger.info('═══════════════════════════════════════')
}
