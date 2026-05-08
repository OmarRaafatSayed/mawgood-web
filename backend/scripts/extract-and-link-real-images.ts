/**
 * Extract Real Images from Excel and Link to Products
 * استخراج الصور الحقيقية من الإكسل وربطها بالمنتجات
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const FILE_VENDOR_MAP: Record<string, string> = {
  'H-I-X.xlsx': 'H-I-X',
  'H&S.xlsx': 'H&S',
  'Rehab Lafy.xlsx': 'Rehab Lafy',
  'مصنع E-S-H.xlsx': 'E-S-H Factory',
}

interface ImageMapping {
  productCode: string
  vendor: string
  imageFiles: string[]
}

interface ExtractionStats {
  totalImagesExtracted: number
  productsUpdated: number
  productsWithoutImages: number
  errors: string[]
}

export default async function extractAndLinkRealImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('═══════════════════════════════════════')
  logger.info('🖼️  Extract & Link Real Images')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const stats: ExtractionStats = {
    totalImagesExtracted: 0,
    productsUpdated: 0,
    productsWithoutImages: 0,
    errors: [],
  }

  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  const extractedImagesDir = path.join(dataDir, 'extracted-images')
  const tempBaseDir = path.join(dataDir, 'temp-extracts')

  // Create directories
  if (!fs.existsSync(extractedImagesDir)) {
    fs.mkdirSync(extractedImagesDir, { recursive: true })
  }
  if (!fs.existsSync(tempBaseDir)) {
    fs.mkdirSync(tempBaseDir, { recursive: true })
  }

  // Step 1: Extract images from all Excel files
  logger.info('📦 Step 1: Extracting images from Excel files...')
  logger.info('')

  const vendorImageMappings: Map<string, string[]> = new Map()

  for (const [fileName, vendorName] of Object.entries(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 Processing: ${fileName}`)

    try {
      // Copy Excel to ZIP
      const zipPath = path.join(dataDir, fileName.replace('.xlsx', '.zip'))
      fs.copyFileSync(filePath, zipPath)

      // Extract ZIP
      const tempDir = path.join(tempBaseDir, vendorName.replace(/[^a-zA-Z0-9]/g, '-'))
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
      fs.mkdirSync(tempDir, { recursive: true })

      const psCommand = `Expand-Archive -Path "${zipPath}" -DestinationPath "${tempDir}" -Force`
      await execAsync(psCommand, { shell: 'powershell.exe' })

      // Check for media folder
      const mediaDir = path.join(tempDir, 'xl', 'media')
      
      if (fs.existsSync(mediaDir)) {
        const mediaFiles = fs.readdirSync(mediaDir)
        const imageFiles = mediaFiles.filter(file => {
          const ext = path.extname(file).toLowerCase()
          return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)
        })

        if (imageFiles.length > 0) {
          logger.info(`   ✅ Found ${imageFiles.length} images`)
          
          const vendorImages: string[] = []
          
          // Copy images to extracted-images folder with vendor prefix
          imageFiles.forEach((imgFile, idx) => {
            const sourcePath = path.join(mediaDir, imgFile)
            const ext = path.extname(imgFile)
            const vendorPrefix = vendorName.replace(/[^a-zA-Z0-9]/g, '-')
            const newFileName = `${vendorPrefix}-${idx + 1}${ext}`
            const destPath = path.join(extractedImagesDir, newFileName)
            
            fs.copyFileSync(sourcePath, destPath)
            vendorImages.push(newFileName)
            stats.totalImagesExtracted++
          })

          vendorImageMappings.set(vendorName, vendorImages)
          logger.info(`   💾 Saved ${vendorImages.length} images`)
        } else {
          logger.warn(`   ⚠️  No images found in media folder`)
        }
      } else {
        logger.warn(`   ⚠️  No xl/media folder found`)
      }

      // Clean up ZIP file
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath)
      }

    } catch (error) {
      logger.error(`   ❌ Error: ${error.message}`)
      stats.errors.push(`${fileName}: ${error.message}`)
    }

    logger.info('')
  }

  // Clean up temp directories
  if (fs.existsSync(tempBaseDir)) {
    fs.rmSync(tempBaseDir, { recursive: true, force: true })
  }

  logger.info('═══════════════════════════════════════')
  logger.info(`📊 Extracted ${stats.totalImagesExtracted} images from Excel files`)
  logger.info('═══════════════════════════════════════')
  logger.info('')

  if (stats.totalImagesExtracted === 0) {
    logger.warn('⚠️  No images found in any Excel files!')
    logger.info('')
    return
  }

  // Step 2: Read Excel files to get product codes and map to images
  logger.info('📋 Step 2: Mapping images to products...')
  logger.info('')

  const XLSX = require('xlsx')
  const productImageMap: Map<string, string[]> = new Map()

  for (const [fileName, vendorName] of Object.entries(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) continue

    const vendorImages = vendorImageMappings.get(vendorName) || []
    if (vendorImages.length === 0) continue

    try {
      const wb = XLSX.readFile(filePath)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      // Get product codes from column 0
      const productCodes: string[] = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length === 0) continue
        
        let code = String(row[0] || '').trim()
        if (!code) continue

        // Clean code (same logic as import)
        code = code
          .replace(/\s*\/\s*/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^A-Za-z0-9-]/g, '')
          .toUpperCase()

        productCodes.push(code)
      }

      // Distribute images among products
      // Assuming images are in order corresponding to products
      const imagesPerProduct = Math.floor(vendorImages.length / productCodes.length)
      const remainingImages = vendorImages.length % productCodes.length

      let imageIndex = 0
      productCodes.forEach((code, idx) => {
        const numImages = imagesPerProduct + (idx < remainingImages ? 1 : 0)
        const productImages = vendorImages.slice(imageIndex, imageIndex + numImages)
        
        if (productImages.length > 0) {
          productImageMap.set(code, productImages)
        }
        
        imageIndex += numImages
      })

      logger.info(`   ✅ ${vendorName}: Mapped ${productCodes.length} products`)

    } catch (error) {
      logger.error(`   ❌ Error mapping ${fileName}: ${error.message}`)
      stats.errors.push(`Mapping ${fileName}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`📊 Total products with image mappings: ${productImageMap.size}`)
  logger.info('')

  // Step 3: Update products in database
  logger.info('🔄 Step 3: Updating products in database...')
  logger.info('')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle'],
    filters: {},
  })

  logger.info(`📦 Found ${products.length} products in database`)
  logger.info('')

  for (const product of products) {
    try {
      // Extract product code from handle (last part)
      const handleParts = product.handle.split('-')
      const productCode = handleParts[handleParts.length - 1].toUpperCase()

      // Check if we have images for this product
      const imageFiles = productImageMap.get(productCode)

      if (!imageFiles || imageFiles.length === 0) {
        stats.productsWithoutImages++
        continue
      }

      // Convert file names to URLs
      const imageUrls = imageFiles.map(fileName => 
        `/extracted-images/${fileName}`
      )

      // Update product
      await productModuleService.updateProducts(product.id, {
        thumbnail: imageUrls[0],
        images: imageUrls.map(url => ({ url })),
      })

      stats.productsUpdated++
      logger.info(`   ✅ ${product.title}`)
      logger.info(`      ${imageUrls.length} real images linked | Code: ${productCode}`)

    } catch (error) {
      stats.errors.push(`${product.title}: ${error.message}`)
      logger.error(`   ❌ ${product.title}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 FINAL REPORT')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Images extracted: ${stats.totalImagesExtracted}`)
  logger.info(`✅ Products updated with real images: ${stats.productsUpdated}`)
  logger.info(`⚠️  Products without images: ${stats.productsWithoutImages}`)
  
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
  logger.info('📁 Images location:')
  logger.info(`   ${extractedImagesDir}`)
  logger.info('')
  logger.info('💡 Next Steps:')
  logger.info('   1. Copy extracted-images folder to your public/static directory')
  logger.info('   2. Update image URLs in product service to point to correct path')
  logger.info('   3. Verify images display correctly in storefront')
  logger.info('')
  logger.info('🎉 Real images successfully extracted and linked!')
  logger.info('═══════════════════════════════════════')
}
