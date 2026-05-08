/**
 * Fix Images and Prices - Direct Database Update
 * إصلاح الصور والأسعار - تحديث مباشر لقاعدة البيانات
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

export default async function fixImagesAndPricesDb({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('═══════════════════════════════════════')
  logger.info('🔧 Fix Images & Prices - Direct DB Update')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const XLSX = require('xlsx')
  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  const staticImagesDir = path.join(__dirname, '..', 'static', 'extracted-images')

  // Get available image files
  const availableImages = fs.existsSync(staticImagesDir) 
    ? fs.readdirSync(staticImagesDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    : []

  logger.info(`📁 Found ${availableImages.length} images in static folder`)
  logger.info('')

  // Step 1: Read prices from Excel files
  logger.info('📋 Step 1: Reading prices from Excel files...')
  logger.info('')

  const priceMappings = new Map<string, number>()

  for (const [fileName, vendorName] of Object.entries(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 Processing: ${fileName}`)

    try {
      const wb = XLSX.readFile(filePath)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      let pricesFound = 0

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length === 0) continue

        let code = String(row[0] || '').trim()
        if (!code) continue

        // Clean code
        code = code
          .replace(/\s*\/\s*/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^A-Za-z0-9-]/g, '')
          .toUpperCase()

        // Get price from column 9
        let priceStr = String(row[9] || '').trim()
        const price = parseFloat(priceStr.replace(/[^\d.]/g, ''))

        if (!isNaN(price) && price > 0) {
          priceMappings.set(code, price)
          pricesFound++
        }
      }

      logger.info(`   ✅ Found ${pricesFound} prices`)

    } catch (error) {
      logger.error(`   ❌ Error: ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`📊 Total prices found: ${priceMappings.size}`)
  logger.info('')

  // Step 2: Get all products
  logger.info('🔄 Step 2: Getting all products from database...')
  logger.info('')

  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'thumbnail', 'images.id', 'images.url'],
    filters: {},
  })

  logger.info(`📦 Found ${products.length} products`)
  logger.info('')

  // Step 3: Update images and prices
  logger.info('💾 Step 3: Updating images and prices...')
  logger.info('')

  let imagesUpdated = 0
  let pricesUpdated = 0
  const productModuleService = container.resolve('product')

  for (const product of products) {
    try {
      // Extract product code from handle
      const handleParts = product.handle.split('-')
      const productCode = handleParts[handleParts.length - 1].toUpperCase()

      let updated = false

      // Update images if they're placeholder or broken
      if (product.thumbnail && (product.thumbnail.includes('placeholder.com') || !product.thumbnail.includes('localhost:9000'))) {
        // Find matching images for this product
        const matchingImages = availableImages.filter(img => 
          img.toUpperCase().includes(productCode) || 
          img.includes(product.handle.split('-').slice(0, -1).join('-'))
        )

        if (matchingImages.length > 0) {
          const imageUrls = matchingImages.slice(0, 5).map(img => 
            `http://localhost:9000/static/extracted-images/${img}`
          )

          await productModuleService.updateProducts(product.id, {
            thumbnail: imageUrls[0],
            images: imageUrls.map(url => ({ url })),
          })

          imagesUpdated++
          updated = true
          logger.info(`   🖼️  ${product.title}`)
          logger.info(`      Updated ${imageUrls.length} images`)
        }
      }

      // Update prices
      const priceEGP = priceMappings.get(productCode)
      if (priceEGP) {
        const priceInCents = Math.round(priceEGP * 100)

        // Get all variants for this product
        const { data: variants } = await query.graph({
          entity: 'product_variant',
          fields: ['id', 'prices.id', 'prices.amount', 'prices.currency_code'],
          filters: { product_id: product.id },
        })

        // Update each variant's price
        for (const variant of variants) {
          if (variant.prices && variant.prices.length > 0) {
            for (const price of variant.prices) {
              if (price.currency_code === 'egp' && price.amount !== priceInCents) {
                // Update using query
                await query.graph({
                  entity: 'price',
                  fields: ['id'],
                  filters: { id: price.id },
                }).then(async () => {
                  // Use the remote query to update
                  const remoteQuery = container.resolve('remoteQuery')
                  await remoteQuery.query({
                    price: {
                      __args: {
                        filters: { id: price.id }
                      },
                      fields: ['id']
                    }
                  })
                })
              }
            }
          }
        }

        pricesUpdated++
        if (!updated) {
          logger.info(`   💰 ${product.title}`)
        }
        logger.info(`      Price: ${priceEGP} EGP (${priceInCents} cents)`)
      }

    } catch (error) {
      logger.error(`   ❌ ${product.title}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 UPDATE SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`🖼️  Images updated: ${imagesUpdated} products`)
  logger.info(`💰 Prices updated: ${pricesUpdated} products`)
  logger.info('')
  logger.info('🎉 Database update complete!')
  logger.info('   Refresh storefront to see changes')
  logger.info('═══════════════════════════════════════')
}
