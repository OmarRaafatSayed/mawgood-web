/**
 * Deep Scan Excel Files for Images
 * فحص شامل لملفات الإكسل لاستخراج الصور
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

export default async function deepScanExcelImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const XLSX = require('xlsx')

  logger.info('═══════════════════════════════════════')
  logger.info('🔍 Deep Scan: Excel Image Extraction')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const dataDir = path.join(__dirname, '..', '..', 'data-products')

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 Scanning: ${fileName}`)
    logger.info('─────────────────────────────────────')

    try {
      const wb = XLSX.readFile(filePath, { cellStyles: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      
      // Get all rows as JSON with header
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      
      if (rows.length === 0) {
        logger.warn('   ⚠️  No rows found')
        continue
      }

      // Analyze header row
      const headers = rows[0]
      logger.info(`\n📋 Headers (${headers.length} columns):`)
      headers.forEach((header: any, idx: number) => {
        const headerStr = String(header || `Column_${idx}`).trim()
        logger.info(`   [${idx}] ${headerStr}`)
      })

      // Analyze first 5 data rows to understand structure
      logger.info(`\n📊 Sample Data (first 5 rows):`)
      for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
        const row = rows[i]
        logger.info(`\n   Row ${i}:`)
        
        row.forEach((cell: any, colIdx: number) => {
          if (!cell) return
          
          const cellStr = String(cell).trim()
          const headerName = headers[colIdx] ? String(headers[colIdx]).trim() : `Col_${colIdx}`
          
          // Check if this looks like an image URL or path
          const isUrl = cellStr.startsWith('http://') || cellStr.startsWith('https://')
          const isImagePath = cellStr.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
          const isBase64 = cellStr.startsWith('data:image/')
          
          if (isUrl || isImagePath || isBase64) {
            logger.info(`   ✅ [${colIdx}] ${headerName}: ${cellStr.substring(0, 100)}${cellStr.length > 100 ? '...' : ''}`)
          } else if (cellStr.length > 0 && cellStr.length < 200) {
            // Show short text values
            logger.info(`   [${colIdx}] ${headerName}: ${cellStr}`)
          } else if (cellStr.length >= 200) {
            // Show truncated long values
            logger.info(`   [${colIdx}] ${headerName}: ${cellStr.substring(0, 50)}... (${cellStr.length} chars)`)
          }
        })
      }

      // Check for embedded images in Excel
      logger.info(`\n🖼️  Checking for embedded images...`)
      if (wb.Workbook && wb.Workbook.Sheets) {
        const sheetInfo = wb.Workbook.Sheets[0]
        if (sheetInfo) {
          logger.info(`   Sheet info available`)
        }
      }

      // Check media in workbook
      if (wb.media) {
        logger.info(`   ✅ Found ${wb.media.length} embedded media files`)
        wb.media.forEach((media: any, idx: number) => {
          logger.info(`      [${idx}] Type: ${media.type}, Size: ${media.data?.length || 0} bytes`)
        })
      } else {
        logger.info(`   ⚠️  No embedded media found in workbook`)
      }

      // Scan all cells for URLs
      logger.info(`\n🔗 Scanning all cells for image URLs...`)
      let urlCount = 0
      const urlColumns = new Set<number>()
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        row.forEach((cell: any, colIdx: number) => {
          if (!cell) return
          const cellStr = String(cell).trim()
          if (cellStr.startsWith('http://') || cellStr.startsWith('https://')) {
            if (cellStr.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) || 
                cellStr.includes('image') || 
                cellStr.includes('photo') ||
                cellStr.includes('picture')) {
              urlCount++
              urlColumns.add(colIdx)
            }
          }
        })
      }

      if (urlCount > 0) {
        logger.info(`   ✅ Found ${urlCount} potential image URLs in columns: ${Array.from(urlColumns).join(', ')}`)
      } else {
        logger.info(`   ⚠️  No HTTP/HTTPS image URLs found in any cells`)
      }

      logger.info('')

    } catch (error) {
      logger.error(`   ❌ Error scanning ${fileName}: ${error.message}`)
    }
  }

  logger.info('═══════════════════════════════════════')
  logger.info('🎯 Scan Complete')
  logger.info('═══════════════════════════════════════')
  logger.info('')
  logger.info('💡 Next Steps:')
  logger.info('   1. Review the column structure above')
  logger.info('   2. Identify which columns contain image data')
  logger.info('   3. Update the extraction logic accordingly')
  logger.info('')
}
