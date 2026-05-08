/**
 * Update Existing Products with Images and Descriptions
 * تحديث المنتجات الموجودة بالصور والأوصاف بدون حذفها
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'

export default async function updateProductsInfo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('═══════════════════════════════════════')
  logger.info('🔄 Update Products with Images & Descriptions')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'description'],
    filters: {},
  })

  logger.info(`Found ${products.length} products`)
  logger.info('')

  const imagesDir = path.join(__dirname, '..', '..', 'data-products', 'images')
  
  if (!fs.existsSync(imagesDir)) {
    logger.warn(`⚠️  Images directory not found: ${imagesDir}`)
    logger.info('   Create it and add images, then run this script again')
    return
  }

  let updatedCount = 0
  let skippedCount = 0

  for (const product of products) {
    try {
      // Extract product code from handle
      // handle format: "code-vendor-timestamp"
      const handleParts = product.handle.split('-')
      const code = handleParts[0]?.toUpperCase()

      if (!code) {
        logger.warn(`⚠️  Could not extract code from handle: ${product.handle}`)
        skippedCount++
        continue
      }

      // Look for image
      const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp']
      let imageFound = false
      let imageUrl = null

      for (const ext of possibleExtensions) {
        const imagePath = path.join(imagesDir, `${code}.${ext}`)
        if (fs.existsSync(imagePath)) {
          imageUrl = `/images/products/${code}.${ext}`
          imageFound = true
          break
        }
      }

      // Prepare update data
      const updateData: any = {}
      let hasUpdates = false

      // Add image if found
      if (imageFound && imageUrl) {
        updateData.images = [{ url: imageUrl }]
        hasUpdates = true
      }

      // Enhance description if it's too short or missing
      if (!product.description || product.description.length < 50) {
        const enhancedDescription = `${product.title}

منتج عالي الجودة من مجموعتنا المميزة.

المميزات:
• جودة عالية
• تصميم عصري
• مناسب لجميع الأوقات
• متوفر بألوان ومقاسات متعددة

كود المنتج: ${code}

ملاحظة: للحصول على أفضل النتائج، يرجى اتباع تعليمات العناية الموجودة على الملصق.`

        updateData.description = enhancedDescription
        hasUpdates = true
      }

      // Update product if there are changes
      if (hasUpdates) {
        await productModuleService.updateProducts(product.id, updateData)
        
        const updates = []
        if (updateData.images) updates.push('🖼️ image')
        if (updateData.description) updates.push('📝 description')
        
        logger.info(`✅ ${product.title}`)
        logger.info(`   Updated: ${updates.join(', ')}`)
        updatedCount++
      } else {
        skippedCount++
      }

    } catch (error) {
      logger.error(`❌ Failed to update ${product.title}: ${error.message}`)
      skippedCount++
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Updated: ${updatedCount} products`)
  logger.info(`⏭️  Skipped: ${skippedCount} products`)
  logger.info('═══════════════════════════════════════')
  logger.info('')
  logger.info('🌐 Check storefront at: http://localhost:3000/ar/categories')
  logger.info('')
}
