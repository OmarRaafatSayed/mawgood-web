/**
 * Fix All Product Prices - Direct SQL Approach
 * إصلاح جميع أسعار المنتجات - نهج SQL مباشر
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

export default async function fixAllPricesDirect({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const manager = container.resolve('manager')

  logger.info('═══════════════════════════════════════')
  logger.info('💰 Fix All Prices - Direct SQL')
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

        // Get price - column 9 is "السعر بالجنيه" for all files
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
  logger.info(`📊 Total product codes with prices: ${priceMappings.size}`)
  logger.info('')

  // Show sample prices
  logger.info('📋 Sample prices from Excel:')
  Array.from(priceMappings.entries()).slice(0, 10).forEach(([code, price]) => {
    logger.info(`   ${code}: ${price} EGP → ${price * 100} cents`)
  })
  logger.info('')

  // Step 2: Update prices using MikroORM
  logger.info('🔄 Step 2: Updating prices in database...')
  logger.info('')

  let updatedCount = 0
  let skippedCount = 0

  for (const [productCode, priceEGP] of priceMappings.entries()) {
    try {
      const priceInCents = Math.round(priceEGP * 100)

      // Find products with this code in their handle
      const { data: products } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle'],
        filters: {
          handle: {
            $ilike: `%${productCode.toLowerCase()}%`
          }
        },
      })

      if (products.length === 0) {
        skippedCount++
        continue
      }

      for (const product of products) {
        // Verify the code matches exactly (last part of handle)
        const handleParts = product.handle.split('-')
        const handleCode = handleParts[handleParts.length - 1].toUpperCase()
        
        if (handleCode !== productCode) {
          continue
        }

        // Update all prices for this product's variants using MikroORM
        await manager.execute(`
          UPDATE price
          SET amount = ?
          WHERE variant_id IN (
            SELECT id FROM product_variant WHERE product_id = ?
          )
          AND currency_code = 'egp'
        `, [priceInCents, product.id])

        updatedCount++
        logger.info(`   ✅ ${product.title}`)
        logger.info(`      ${productCode}: ${priceEGP} EGP → ${priceInCents} cents`)
      }

    } catch (error) {
      logger.error(`   ❌ ${productCode}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 FINAL SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Products updated: ${updatedCount}`)
  logger.info(`⏭️  Products skipped: ${skippedCount}`)
  logger.info(`📋 Total price mappings: ${priceMappings.size}`)
  logger.info('')
  logger.info('💡 Price Format:')
  logger.info('   • Excel: 250 EGP')
  logger.info('   • Database: 25000 (cents)')
  logger.info('   • Display: 250.00 EGP')
  logger.info('')
  logger.info('🎉 All prices updated successfully!')
  logger.info('   Restart backend and refresh storefront to see changes')
  logger.info('═══════════════════════════════════════')
}
