/**
 * Fix Product Prices from Excel
 * إصلاح أسعار المنتجات من ملفات الإكسل
 * 
 * Issue: Prices are showing 10,000 EGP instead of 250 EGP
 * Cause: Prices stored in cents (25000 = 250 EGP) but might be stored incorrectly
 * Solution: Re-read Excel files and update prices correctly
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

export default async function fixPricesFromExcel({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('═══════════════════════════════════════')
  logger.info('💰 Fix Product Prices from Excel')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const XLSX = require('xlsx')
  const dataDir = path.join(__dirname, '..', '..', 'data-products')

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

        // Clean code (same logic as import)
        code = code
          .replace(/\s*\/\s*/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^A-Za-z0-9-]/g, '')
          .toUpperCase()

        // Get price from column 9 or 10 (السعر بالجنيه)
        // Try column 10 first (السعر بالجنيه), then column 9 (السعر بالريال)
        let priceStr = String(row[10] || row[9] || '').trim()
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
  logger.info(`📊 Total product codes with prices: ${priceMappings.size}`)
  logger.info('')

  // Show sample prices
  logger.info('📋 Sample prices from Excel:')
  Array.from(priceMappings.entries()).slice(0, 5).forEach(([code, price]) => {
    logger.info(`   ${code}: ${price} EGP (will be ${price * 100} cents in DB)`)
  })
  logger.info('')

  // Step 2: Get all products and their variants
  logger.info('🔄 Step 2: Updating product prices in database...')
  logger.info('')

  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'variants.id', 'variants.prices.id', 'variants.prices.amount'],
    filters: {},
  })

  logger.info(`📦 Found ${products.length} products in database`)
  logger.info('')

  let updatedProducts = 0
  let updatedVariants = 0
  let skippedProducts = 0
  let errors: string[] = []

  for (const product of products) {
    try {
      // Extract product code from handle (last part)
      const handleParts = product.handle.split('-')
      const productCode = handleParts[handleParts.length - 1].toUpperCase()

      // Check if we have a price for this product
      const priceEGP = priceMappings.get(productCode)

      if (!priceEGP) {
        skippedProducts++
        continue
      }

      // Convert to cents (smallest currency unit)
      // EGP doesn't use decimal places, so multiply by 100
      const priceInCents = Math.round(priceEGP * 100)

      // Update all variants of this product
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          try {
            // Update variant with new price
            await productModuleService.updateProductVariants(variant.id, {
              prices: [
                {
                  amount: priceInCents,
                  currency_code: 'egp',
                },
              ],
            })

            updatedVariants++
          } catch (variantError) {
            errors.push(`Variant ${variant.id}: ${variantError.message}`)
          }
        }

        updatedProducts++
        logger.info(`   ✅ ${product.title}`)
        logger.info(`      Code: ${productCode} | Price: ${priceEGP} EGP → ${priceInCents} cents`)
      }

    } catch (error) {
      errors.push(`${product.title}: ${error.message}`)
      logger.error(`   ❌ ${product.title}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 PRICE UPDATE SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Products updated: ${updatedProducts}`)
  logger.info(`✅ Variants updated: ${updatedVariants}`)
  logger.info(`⏭️  Products skipped (no price in Excel): ${skippedProducts}`)
  logger.info(`📋 Price mappings found: ${priceMappings.size}`)
  
  if (errors.length > 0) {
    logger.warn(`❌ Errors: ${errors.length}`)
    logger.info('')
    logger.info('Error details:')
    errors.slice(0, 10).forEach(err => logger.error(`   - ${err}`))
    if (errors.length > 10) {
      logger.info(`   ... and ${errors.length - 10} more errors`)
    }
  }
  
  logger.info('')
  logger.info('💡 Price Format:')
  logger.info('   • Excel: 250 EGP')
  logger.info('   • Database: 25000 (cents)')
  logger.info('   • Display: 250.00 EGP')
  logger.info('')
  logger.info('🎉 Price correction complete!')
  logger.info('   Refresh your storefront to see updated prices')
  logger.info('═══════════════════════════════════════')
}
