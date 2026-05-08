/**
 * Link Local Images to Products
 * ربط الصور المحلية بالمنتجات في قاعدة البيانات
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import * as http from 'http'

interface ImageLinkStats {
  productsProcessed: number
  imagesLinked: number
  imagesNotFound: number
  errors: string[]
}

// Placeholder image service - generates colored placeholder images
function generatePlaceholderImageUrl(productCode: string, index: number = 0): string {
  // Use a reliable placeholder service
  const colors = ['3498db', 'e74c3c', '2ecc71', 'f39c12', '9b59b6', '1abc9c']
  const color = colors[index % colors.length]
  const text = encodeURIComponent(productCode)
  
  // Using placeholder.com which is reliable
  return `https://via.placeholder.com/800x800/${color}/ffffff?text=${text}`
}

// Download image from URL
async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(outputPath)
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(outputPath)
        resolve(false)
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve(true)
      })
    }).on('error', () => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
      }
      resolve(false)
    })
  })
}

export default async function linkLocalImagesToProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('═══════════════════════════════════════')
  logger.info('🖼️  Linking Local Images to Products')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const stats: ImageLinkStats = {
    productsProcessed: 0,
    imagesLinked: 0,
    imagesNotFound: 0,
    errors: [],
  }

  // Check/create images directory
  const imagesDir = path.join(__dirname, '..', '..', 'data-products', 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
    logger.info(`📁 Created images directory: ${imagesDir}`)
  }

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'thumbnail', 'images'],
    filters: {},
  })

  logger.info(`📊 Found ${products.length} products in database`)
  logger.info('')

  // Get all variants to extract SKUs
  const { data: allVariants } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'product_id', 'sku', 'title'],
    filters: {},
  })

  // Create a map of product_id to variants
  const productVariantsMap = new Map<string, any[]>()
  allVariants.forEach((variant: any) => {
    if (!productVariantsMap.has(variant.product_id)) {
      productVariantsMap.set(variant.product_id, [])
    }
    productVariantsMap.get(variant.product_id)!.push(variant)
  })

  logger.info('🔄 Processing products...')
  logger.info('')

  for (const product of products) {
    try {
      stats.productsProcessed++

      // Skip if product already has images
      if (product.images && product.images.length > 0) {
        logger.info(`   ⏭️  Skipped: ${product.title} (already has ${product.images.length} images)`)
        continue
      }

      // Get product variants
      const variants = productVariantsMap.get(product.id) || []
      if (variants.length === 0) {
        logger.warn(`   ⚠️  No variants found for: ${product.title}`)
        continue
      }

      // Extract product code from handle (last part)
      const handleParts = product.handle.split('-')
      const productCode = handleParts[handleParts.length - 1].toUpperCase()

      // Try to find local images
      const localImages: string[] = []
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

      // Check for images matching product code
      for (const ext of imageExtensions) {
        const imagePath = path.join(imagesDir, `${productCode}${ext}`)
        if (fs.existsSync(imagePath)) {
          localImages.push(imagePath)
        }
      }

      // Check for images matching first variant SKU
      if (localImages.length === 0 && variants.length > 0) {
        const firstSku = variants[0].sku
        for (const ext of imageExtensions) {
          const imagePath = path.join(imagesDir, `${firstSku}${ext}`)
          if (fs.existsSync(imagePath)) {
            localImages.push(imagePath)
          }
        }
      }

      // If no local images found, generate placeholder images
      if (localImages.length === 0) {
        logger.info(`   🎨 Generating placeholder for: ${product.title} (${productCode})`)
        
        // Generate 3 placeholder images with different colors
        const placeholderUrls: string[] = []
        for (let i = 0; i < 3; i++) {
          const placeholderUrl = generatePlaceholderImageUrl(productCode, i)
          placeholderUrls.push(placeholderUrl)
        }

        // Update product with placeholder images
        await productModuleService.updateProducts(product.id, {
          thumbnail: placeholderUrls[0],
          images: placeholderUrls.map(url => ({ url })),
        })

        stats.imagesLinked += placeholderUrls.length
        logger.info(`   ✅ Linked ${placeholderUrls.length} placeholder images`)
        continue
      }

      // Use local images
      const imageUrls = localImages.map(imgPath => {
        // Convert to relative URL
        const fileName = path.basename(imgPath)
        return `/images/products/${fileName}`
      })

      await productModuleService.updateProducts(product.id, {
        thumbnail: imageUrls[0],
        images: imageUrls.map(url => ({ url })),
      })

      stats.imagesLinked += imageUrls.length
      logger.info(`   ✅ ${product.title}`)
      logger.info(`      Linked ${imageUrls.length} local image(s)`)

    } catch (error) {
      stats.errors.push(`${product.title} - ${error.message}`)
      logger.error(`   ❌ ${product.title} - ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 IMAGE LINKING REPORT')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Products processed: ${stats.productsProcessed}`)
  logger.info(`🖼️  Images linked: ${stats.imagesLinked}`)
  logger.info(`⚠️  Images not found: ${stats.imagesNotFound}`)
  
  if (stats.errors.length > 0) {
    logger.warn(`❌ Errors: ${stats.errors.length}`)
    logger.info('')
    logger.info('Error details:')
    stats.errors.slice(0, 10).forEach(err => logger.error(`   - ${err}`))
    if (stats.errors.length > 10) {
      logger.info(`   ... and ${stats.errors.length - 10} more errors`)
    }
  }
  
  logger.info('')
  logger.info('💡 Note: Products without local images have been assigned')
  logger.info('   placeholder images with unique colors based on product code.')
  logger.info('')
  logger.info('📁 To use real images:')
  logger.info(`   1. Place images in: ${imagesDir}`)
  logger.info('   2. Name them: PRODUCTCODE.jpg (e.g., ESH027.jpg)')
  logger.info('   3. Run this script again')
  logger.info('')
  logger.info('🎉 Image linking complete!')
  logger.info('═══════════════════════════════════════')
}
