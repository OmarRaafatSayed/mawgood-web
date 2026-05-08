/**
 * Update Product Images from Excel Files
 * تحديث صور المنتجات من ملفات Excel
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'

const FILE_VENDOR_MAP: Record<string, string> = {
  'H-I-X.xlsx': 'H-I-X',
  'H&S.xlsx': 'H&S',
  'Rehab Lafy.xlsx': 'Rehab Lafy',
  'مصنع E-S-H.xlsx': 'E-S-H Factory',
}

interface ProductImageData {
  code: string
  imageUrls: string[]
}

function parseExcelForImages(filePath: string): ProductImageData[] {
  const XLSX = require('xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const products: ProductImageData[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const code = String(row[0] || '').trim()
    if (!code) continue

    // Get image URLs from columns 1-5 (صورة المنتج 1-5)
    const imageUrls: string[] = []
    for (let imgCol = 1; imgCol <= 5; imgCol++) {
      const imgUrl = String(row[imgCol] || '').trim()
      if (imgUrl && (imgUrl.startsWith('http://') || imgUrl.startsWith('https://'))) {
        imageUrls.push(imgUrl)
      }
    }

    if (imageUrls.length > 0) {
      products.push({ code, imageUrls })
    }
  }

  return products
}

export default async function updateProductImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('=== 🖼️  Updating Product Images from Excel ===')
  logger.info('')

  // Read Excel files and collect image data
  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  const allImageData: Map<string, string[]> = new Map()

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 Reading: ${fileName}`)
    const imageData = parseExcelForImages(filePath)
    logger.info(`   Found ${imageData.length} products with images`)

    imageData.forEach(({ code, imageUrls }) => {
      allImageData.set(code.toLowerCase(), imageUrls)
    })
  }

  logger.info('')
  logger.info(`📊 Total products with images: ${allImageData.size}`)
  logger.info('')

  // Get all products from database
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'images'],
    filters: {},
  })

  logger.info(`🔄 Updating ${products.length} products...`)
  logger.info('')

  let successCount = 0
  let skippedCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      // Extract code from handle (last part after last dash)
      const handleParts = product.handle.split('-')
      const code = handleParts[handleParts.length - 1].toUpperCase()

      // Check if we have images for this code
      const imageUrls = allImageData.get(code.toLowerCase())

      if (!imageUrls || imageUrls.length === 0) {
        skippedCount++
        logger.info(`   ⏭️  Skipped: ${product.title} (${code}) - No images in Excel`)
        continue
      }

      // Check if product already has images
      if (product.images && product.images.length > 0) {
        skippedCount++
        logger.info(`   ⏭️  Skipped: ${product.title} (${code}) - Already has images`)
        continue
      }

      // Update product with images
      await productModuleService.updateProducts(product.id, {
        images: imageUrls.map(url => ({ url })),
      })

      successCount++
      logger.info(`   ✅ Updated: ${product.title} (${code})`)
      logger.info(`      Added ${imageUrls.length} image(s)`)
      logger.info(`      First image: ${imageUrls[0].substring(0, 60)}...`)
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
  logger.info(`⏭️  Skipped: ${skippedCount} products`)
  if (errorCount > 0) {
    logger.warn(`❌ Failed: ${errorCount} products`)
    logger.info('')
    logger.info('Failed products:')
    errors.forEach(err => logger.error(`   - ${err}`))
  }
  logger.info('')
  logger.info('🎉 Product images updated!')
  logger.info('═══════════════════════════════════════')
}
