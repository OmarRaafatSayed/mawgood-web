/**
 * Extract Embedded Images from Excel
 * استخراج الصور المدمجة من ملفات الإكسل
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

interface ExtractedImage {
  fileName: string
  data: Buffer
  extension: string
}

async function extractEmbeddedImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('═══════════════════════════════════════')
  logger.info('🖼️  Extract Embedded Images from Excel')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  const outputDir = path.join(dataDir, 'extracted-images')

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    logger.info(`📁 Created output directory: ${outputDir}`)
  }

  let totalImagesExtracted = 0

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }

    logger.info(`📄 Processing: ${fileName}`)
    logger.info('─────────────────────────────────────')

    try {
      // Excel files (.xlsx) are actually ZIP archives
      // Create a temp directory to extract
      const tempDir = path.join(outputDir, 'temp-' + Date.now())
      fs.mkdirSync(tempDir, { recursive: true })

      // Use PowerShell to extract the Excel file (which is a ZIP)
      const psCommand = `Expand-Archive -Path "${filePath}" -DestinationPath "${tempDir}" -Force`
      
      try {
        await execAsync(psCommand, { shell: 'powershell.exe' })
      } catch (extractError) {
        logger.warn(`   ⚠️  Could not extract as ZIP: ${extractError.message}`)
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true })
        }
        logger.info('')
        continue
      }

      // Look for images in xl/media folder
      const mediaDir = path.join(tempDir, 'xl', 'media')
      
      if (fs.existsSync(mediaDir)) {
        const mediaFiles = fs.readdirSync(mediaDir)
        const imageFiles = mediaFiles.filter(file => {
          const ext = path.extname(file).toLowerCase()
          return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)
        })

        if (imageFiles.length > 0) {
          logger.info(`   ✅ Found ${imageFiles.length} embedded images`)
          
          const vendorName = FILE_VENDOR_MAP[fileName].replace(/[^a-zA-Z0-9]/g, '-')
          imageFiles.forEach((imgFile, idx) => {
            const sourcePath = path.join(mediaDir, imgFile)
            const ext = path.extname(imgFile)
            const outputFileName = `${vendorName}-${idx + 1}${ext}`
            const outputPath = path.join(outputDir, outputFileName)
            
            fs.copyFileSync(sourcePath, outputPath)
            const stats = fs.statSync(outputPath)
            logger.info(`      💾 Saved: ${outputFileName} (${stats.size} bytes)`)
            totalImagesExtracted++
          })
        } else {
          logger.warn(`   ⚠️  Media folder exists but contains no images`)
        }
      } else {
        logger.warn(`   ⚠️  No xl/media folder found (no embedded images)`)
      }

      // Clean up temp directory
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }

      logger.info('')

    } catch (error) {
      logger.error(`   ❌ Error processing ${fileName}: ${error.message}`)
      logger.info('')
    }
  }

  logger.info('═══════════════════════════════════════')
  logger.info('📊 EXTRACTION SUMMARY')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Total images extracted: ${totalImagesExtracted}`)
  
  if (totalImagesExtracted > 0) {
    logger.info(`📁 Images saved to: ${outputDir}`)
    logger.info('')
    logger.info('💡 Next Steps:')
    logger.info('   1. Review extracted images')
    logger.info('   2. Match images to products manually or by naming convention')
    logger.info('   3. Run image linking script')
  } else {
    logger.warn('')
    logger.warn('⚠️  NO IMAGES FOUND IN EXCEL FILES')
    logger.warn('')
    logger.warn('📋 Possible reasons:')
    logger.warn('   1. Images were never added to the Excel files')
    logger.warn('   2. Image columns are placeholders for future data')
    logger.warn('   3. Images exist separately and need to be provided')
    logger.warn('')
    logger.warn('💡 Solutions:')
    logger.warn('   1. Ask the data provider for the actual product images')
    logger.warn('   2. Add image URLs to columns 1-5 in the Excel files')
    logger.warn('   3. Place image files in data-products/images/ folder')
    logger.warn('   4. Keep using placeholder images until real images are available')
  }
  
  logger.info('')
  logger.info('═══════════════════════════════════════')
}

export default extractEmbeddedImages
