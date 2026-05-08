/**
 * Check Import Readiness
 * ======================
 * Verifies that all prerequisites are met before running the import
 * 
 * Run: npx medusa exec ./scripts/check-import-readiness.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as path from 'path'
import * as fs from 'fs'

const EXCEL_FILES = [
  'H-I-X.xlsx',
  'H&S.xlsx',
  'Rehab Lafy.xlsx',
  'مصنع E-S-H.xlsx'
]

export default async function checkImportReadiness({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('\n' + '='.repeat(80))
  logger.info('🔍 CHECKING IMPORT READINESS')
  logger.info('='.repeat(80))

  let allChecksPass = true

  // ─── CHECK 1: Excel Files ────────────────────────────────────────────
  logger.info('\n📂 CHECK 1: Excel Files')
  const projectRoot = process.cwd()
  const dataDir = path.join(projectRoot, '..', 'data-products')
  
  if (!fs.existsSync(dataDir)) {
    logger.error(`❌ Data directory not found: ${dataDir}`)
    allChecksPass = false
  } else {
    logger.info(`✅ Data directory exists: ${dataDir}`)
    
    for (const fileName of EXCEL_FILES) {
      const filePath = path.join(dataDir, fileName)
      if (!fs.existsSync(filePath)) {
        logger.error(`❌ File not found: ${fileName}`)
        allChecksPass = false
      } else {
        const stats = fs.statSync(filePath)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        logger.info(`✅ ${fileName} (${sizeMB} MB)`)
      }
    }
  }

  // ─── CHECK 2: Database Connection ────────────────────────────────────
  logger.info('\n🗄️  CHECK 2: Database Connection')
  try {
    const { data: products } = await query.graph({
      entity: 'product',
      fields: ['id'],
      filters: {},
    })
    logger.info(`✅ Database connected (${products.length} products currently in DB)`)
    if (products.length > 0) {
      logger.warn(`⚠️  WARNING: ${products.length} products will be DELETED during import!`)
    }
  } catch (error: any) {
    logger.error(`❌ Database connection failed: ${error.message}`)
    allChecksPass = false
  }

  // ─── CHECK 3: Sales Channel ──────────────────────────────────────────
  logger.info('\n🛒 CHECK 3: Sales Channel')
  try {
    const { data: salesChannels } = await query.graph({
      entity: 'sales_channel',
      fields: ['id', 'name'],
      filters: {},
    })
    if (salesChannels.length === 0) {
      logger.error('❌ No sales channel found - run seed script first')
      allChecksPass = false
    } else {
      logger.info(`✅ Sales Channel: ${salesChannels[0].name} (${salesChannels[0].id})`)
    }
  } catch (error: any) {
    logger.error(`❌ Failed to check sales channel: ${error.message}`)
    allChecksPass = false
  }

  // ─── CHECK 4: Stock Location ─────────────────────────────────────────
  logger.info('\n📦 CHECK 4: Stock Location')
  try {
    const { data: stockLocations } = await query.graph({
      entity: 'stock_location',
      fields: ['id', 'name'],
      filters: {},
    })
    if (stockLocations.length === 0) {
      logger.warn('⚠️  No stock location found - inventory levels will not be set')
    } else {
      logger.info(`✅ Stock Location: ${stockLocations[0].name} (${stockLocations[0].id})`)
    }
  } catch (error: any) {
    logger.error(`❌ Failed to check stock location: ${error.message}`)
    allChecksPass = false
  }

  // ─── CHECK 5: XLSX Package ───────────────────────────────────────────
  logger.info('\n📚 CHECK 5: Required Packages')
  try {
    require('xlsx')
    logger.info('✅ xlsx package installed')
  } catch (error) {
    logger.error('❌ xlsx package not found - run: npm install xlsx')
    allChecksPass = false
  }

  // ─── CHECK 6: Sample Excel Data ──────────────────────────────────────
  logger.info('\n📊 CHECK 6: Sample Excel Data')
  try {
    const XLSX = require('xlsx')
    const sampleFile = path.join(dataDir, EXCEL_FILES[0])
    if (fs.existsSync(sampleFile)) {
      const wb = XLSX.readFile(sampleFile)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
      
      logger.info(`✅ Sample file readable: ${EXCEL_FILES[0]}`)
      logger.info(`   Sheet: ${wb.SheetNames[0]}`)
      logger.info(`   Rows: ${rows.length - 1}`)
      logger.info(`   Headers: ${rows[0].slice(0, 5).join(', ')}...`)
    }
  } catch (error: any) {
    logger.error(`❌ Failed to read sample Excel: ${error.message}`)
    allChecksPass = false
  }

  // ─── FINAL SUMMARY ───────────────────────────────────────────────────
  logger.info('\n' + '='.repeat(80))
  if (allChecksPass) {
    logger.info('✅ ALL CHECKS PASSED - Ready to import!')
    logger.info('='.repeat(80))
    logger.info('\n📋 To start the import, run:')
    logger.info('   npm run db:cleanup-import')
    logger.info('\n⚠️  WARNING: This will DELETE ALL existing products!')
  } else {
    logger.error('❌ SOME CHECKS FAILED - Fix issues before importing')
    logger.info('='.repeat(80))
  }

  logger.info('')
}
