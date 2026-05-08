/**
 * Final Image Verification
 * التحقق النهائي من الصور
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'

export default async function verifyImagesFinal({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('═══════════════════════════════════════')
  logger.info('🔍 Final Image Verification')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  // Check static folder
  const staticImagesDir = path.join(__dirname, '..', 'static', 'extracted-images')
  const imageFiles = fs.existsSync(staticImagesDir) 
    ? fs.readdirSync(staticImagesDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    : []

  logger.info('📁 Static Folder Check:')
  logger.info(`   Location: ${staticImagesDir}`)
  logger.info(`   Images found: ${imageFiles.length}`)
  logger.info('')

  // Get products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'thumbnail', 'images'],
    filters: {},
  })

  // Categorize products
  const withRealImages = products.filter((p: any) => 
    p.thumbnail && p.thumbnail.includes('/static/extracted-images/')
  )
  const withPlaceholders = products.filter((p: any) => 
    p.thumbnail && p.thumbnail.includes('placeholder.com')
  )
  const withoutImages = products.filter((p: any) => !p.thumbnail)

  logger.info('📊 Database Status:')
  logger.info(`   Total products: ${products.length}`)
  logger.info(`   ✅ With real images: ${withRealImages.length} (${Math.round(withRealImages.length / products.length * 100)}%)`)
  logger.info(`   🎨 With placeholders: ${withPlaceholders.length} (${Math.round(withPlaceholders.length / products.length * 100)}%)`)
  logger.info(`   ⚠️  Without images: ${withoutImages.length}`)
  logger.info('')

  // Sample products with real images
  logger.info('📸 Sample Products with Real Images:')
  withRealImages.slice(0, 10).forEach((p: any) => {
    const imageCount = p.images?.length || 0
    logger.info(`   ✅ ${p.title}`)
    logger.info(`      ${imageCount} images | ${p.thumbnail.split('/').pop()}`)
  })
  logger.info('')

  // Image count distribution
  const imageCountMap = new Map<number, number>()
  withRealImages.forEach((p: any) => {
    const count = p.images?.length || 0
    imageCountMap.set(count, (imageCountMap.get(count) || 0) + 1)
  })

  logger.info('📊 Image Distribution:')
  Array.from(imageCountMap.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([count, products]) => {
      logger.info(`   ${count} image${count !== 1 ? 's' : ''}: ${products} products`)
    })
  logger.info('')

  // Vendor breakdown
  const vendorStats = new Map<string, number>()
  withRealImages.forEach((p: any) => {
    const thumbnail = p.thumbnail || ''
    if (thumbnail.includes('H-I-X')) vendorStats.set('H-I-X', (vendorStats.get('H-I-X') || 0) + 1)
    else if (thumbnail.includes('H-S')) vendorStats.set('H&S', (vendorStats.get('H&S') || 0) + 1)
    else if (thumbnail.includes('Rehab-Lafy')) vendorStats.set('Rehab Lafy', (vendorStats.get('Rehab Lafy') || 0) + 1)
    else if (thumbnail.includes('E-S-H-Factory')) vendorStats.set('E-S-H Factory', (vendorStats.get('E-S-H Factory') || 0) + 1)
  })

  logger.info('📊 Products by Vendor:')
  Array.from(vendorStats.entries()).forEach(([vendor, count]) => {
    logger.info(`   ${vendor}: ${count} products`)
  })
  logger.info('')

  logger.info('═══════════════════════════════════════')
  logger.info('✅ VERIFICATION COMPLETE')
  logger.info('═══════════════════════════════════════')
  logger.info('')
  logger.info('🎉 Summary:')
  logger.info(`   • ${imageFiles.length} images in static folder`)
  logger.info(`   • ${withRealImages.length} products with real images`)
  logger.info(`   • ${withPlaceholders.length} products with placeholders`)
  logger.info(`   • Success rate: ${Math.round(withRealImages.length / products.length * 100)}%`)
  logger.info('')
  logger.info('🌐 Test URLs:')
  logger.info('   • Backend: http://localhost:9000/static/extracted-images/')
  logger.info('   • Storefront: http://localhost:3000/ar/products/')
  logger.info('   • Admin: http://localhost:9000/app/products')
  logger.info('')
  logger.info('📄 Full report: IMAGE-EXTRACTION-REPORT.md')
  logger.info('═══════════════════════════════════════')
}
