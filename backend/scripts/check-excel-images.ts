/**
 * Check Excel Files for Image URLs
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

export default async function checkExcelImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const XLSX = require('xlsx')

  logger.info('=== 📸 Checking Excel Files for Images ===')
  logger.info('')

  const dataDir = path.join(__dirname, '..', '..', 'data-products')

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 File: ${fileName}`)
    
    const wb = XLSX.readFile(filePath)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

    logger.info(`   Total rows: ${rows.length}`)
    logger.info(`   Header: ${JSON.stringify(rows[0])}`)
    logger.info('')
    logger.info('   Sample products:')

    for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
      const row = rows[i]
      const code = String(row[0] || '').trim()
      const title = String(row[7] || '').trim()
      const imageUrl = String(row[11] || '').trim()

      logger.info(`   ${i}. Code: ${code}`)
      logger.info(`      Title: ${title}`)
      logger.info(`      Image URL (Column 11): ${imageUrl || '(empty)'}`)
      logger.info('')
    }

    logger.info('---')
    logger.info('')
  }

  // Check if images directory exists
  const imagesDir = path.join(dataDir, 'images')
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir)
    logger.info(`📁 Images directory found: ${imagesDir}`)
    logger.info(`   Total image files: ${imageFiles.length}`)
    if (imageFiles.length > 0) {
      logger.info('   Sample files:')
      imageFiles.slice(0, 10).forEach(file => {
        logger.info(`      - ${file}`)
      })
    }
  } else {
    logger.warn(`⚠️  Images directory not found: ${imagesDir}`)
    logger.info('   You need to create this directory and add product images')
  }

  logger.info('')
  logger.info('=== Check Complete ===')
}
