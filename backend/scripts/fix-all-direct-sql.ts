/**
 * Fix All - Direct SQL Execution
 * إصلاح الكل - تنفيذ SQL مباشر
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

export default async function fixAllDirectSql({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const knex = container.resolve('pg.connection')

  logger.info('═══════════════════════════════════════')
  logger.info('🔧 Fix All - Direct SQL')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const XLSX = require('xlsx')
  const dataDir = path.join(__dirname, '..', '..', 'data-products')

  // Step 1: Read prices from Excel
  logger.info('📋 Step 1: Reading prices from Excel...')
  logger.info('')

  const priceMappings = new Map<string, number>()

  for (const [fileName, vendorName] of Object.entries(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) continue

    logger.info(`📄 ${fileName}`)

    try {
      const wb = XLSX.readFile(filePath)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      let count = 0
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length === 0) continue

        let code = String(row[0] || '').trim()
          .replace(/\s*\/\s*/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^A-Za-z0-9-]/g, '')
          .toUpperCase()

        if (!code) continue

        const priceStr = String(row[9] || '').trim()
        const price = parseFloat(priceStr.replace(/[^\d.]/g, ''))

        if (!isNaN(price) && price > 0) {
          priceMappings.set(code, price)
          count++
        }
      }
      logger.info(`   ✅ ${count} prices`)
    } catch (error) {
      logger.error(`   ❌ ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`📊 Total: ${priceMappings.size} prices`)
  logger.info('')

  // Step 2: Update prices using direct SQL
  logger.info('💰 Step 2: Updating prices (Direct SQL)...')
  logger.info('')

  let pricesUpdated = 0

  for (const [productCode, priceEGP] of priceMappings.entries()) {
    try {
      const priceInCents = Math.round(priceEGP * 100)

      // Update prices for products matching this code
      const result = await knex.raw(`
        UPDATE price
        SET amount = ?
        WHERE variant_id IN (
          SELECT pv.id
          FROM product_variant pv
          JOIN product p ON p.id = pv.product_id
          WHERE p.handle LIKE ?
        )
        AND currency_code = 'egp'
      `, [priceInCents, `%${productCode.toLowerCase()}`])

      if (result.rowCount > 0) {
        pricesUpdated++
        logger.info(`   ✅ ${productCode}: ${priceEGP} EGP → ${priceInCents} cents`)
      }
    } catch (error) {
      logger.error(`   ❌ ${productCode}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`💰 Prices updated: ${pricesUpdated} products`)
  logger.info('')

  // Step 3: Update images
  logger.info('🖼️  Step 3: Updating images (Direct SQL)...')
  logger.info('')

  const staticImagesDir = path.join(__dirname, '..', 'static', 'extracted-images')
  const availableImages = fs.existsSync(staticImagesDir)
    ? fs.readdirSync(staticImagesDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    : []

  logger.info(`📁 Found ${availableImages.length} images`)
  logger.info('')

  // Create image mapping by vendor prefix
  const imagesByVendor = new Map<string, string[]>()
  availableImages.forEach(img => {
    const prefix = img.split('-')[0]
    if (!imagesByVendor.has(prefix)) {
      imagesByVendor.set(prefix, [])
    }
    imagesByVendor.get(prefix)!.push(img)
  })

  // Get all products
  const products = await knex.raw(`
    SELECT id, title, handle, thumbnail
    FROM product
    WHERE thumbnail LIKE '%placeholder%' OR thumbnail NOT LIKE '%localhost:9000%'
  `)

  let imagesUpdated = 0

  for (const product of products.rows) {
    try {
      const handleParts = product.handle.split('-')
      const productCode = handleParts[handleParts.length - 1].toUpperCase()
      
      // Find vendor prefix from handle
      let vendorPrefix = ''
      if (product.handle.includes('h-i-x')) vendorPrefix = 'H-I-X'
      else if (product.handle.includes('h-s')) vendorPrefix = 'H-S'
      else if (product.handle.includes('rehab-lafy')) vendorPrefix = 'Rehab-Lafy'
      else if (product.handle.includes('e-s-h-factory')) vendorPrefix = 'E-S-H-Factory'

      const vendorImages = imagesByVendor.get(vendorPrefix) || []
      
      if (vendorImages.length > 0) {
        // Assign images based on product index
        const productIndex = parseInt(productCode.replace(/[^\d]/g, '')) || 0
        const imageIndex = productIndex % vendorImages.length
        const imageName = vendorImages[imageIndex]
        const imageUrl = `http://localhost:9000/static/extracted-images/${imageName}`

        // Update product thumbnail
        await knex.raw(`
          UPDATE product
          SET thumbnail = ?
          WHERE id = ?
        `, [imageUrl, product.id])

        // Update product images
        await knex.raw(`
          DELETE FROM image WHERE product_id = ?
        `, [product.id])

        await knex.raw(`
          INSERT INTO image (id, url, product_id, created_at, updated_at)
          VALUES (gen_random_uuid(), ?, ?, NOW(), NOW())
        `, [imageUrl, product.id])

        imagesUpdated++
        logger.info(`   ✅ ${product.title.substring(0, 40)}...`)
      }
    } catch (error) {
      logger.error(`   ❌ ${product.title}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 FINAL SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`💰 Prices updated: ${pricesUpdated} products`)
  logger.info(`🖼️  Images updated: ${imagesUpdated} products`)
  logger.info('')
  logger.info('🎉 All updates complete!')
  logger.info('   Refresh storefront to see changes')
  logger.info('═══════════════════════════════════════')
}
