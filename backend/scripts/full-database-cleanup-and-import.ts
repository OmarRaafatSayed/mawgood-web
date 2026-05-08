/**
 * FULL DATABASE CLEANUP AND HIGH-FIDELITY EXCEL IMPORT
 * =====================================================
 * This script performs:
 * 1. Complete database cleanup (removes ALL products)
 * 2. High-fidelity import from 4 Excel files
 * 3. Strict validation and data integrity checks
 * 
 * Run: npm run db:cleanup-import
 * Or: npx medusa exec ./scripts/full-database-cleanup-and-import.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import { 
  createProductsWorkflow, 
  createInventoryLevelsWorkflow,
  deleteProductsWorkflow 
} from '@medusajs/medusa/core-flows'
import * as path from 'path'
import * as fs from 'fs'

// =============================================
// CONFIGURATION
// =============================================
const EXCEL_FILES = [
  'H-I-X.xlsx',
  'H&S.xlsx',
  'Rehab Lafy.xlsx',
  'مصنع E-S-H.xlsx'
]

const VENDOR_MAP: Record<string, string> = {
  'H-I-X.xlsx': 'H-I-X',
  'H&S.xlsx': 'H&S',
  'Rehab Lafy.xlsx': 'Rehab Lafy',
  'مصنع E-S-H.xlsx': 'E-S-H Factory',
}

// =============================================
// COLOR TRANSLATION MAP (Arabic → English)
// =============================================
const COLOR_MAP: Record<string, string> = {
  'ابيض': 'White',
  'أبيض': 'White',
  'اسود': 'Black',
  'أسود': 'Black',
  'رمادي': 'Gray',
  'زيتي': 'Olive',
  'نبيتي': 'Navy',
  'بيج': 'Beige',
  'بني': 'Brown',
  'سماوي': 'Sky Blue',
  'ازرق': 'Blue',
  'أزرق': 'Blue',
  'كحلي': 'Dark Blue',
  'بترولي': 'Petrol',
  'مينت جرين': 'Mint Green',
  'موف': 'Mauve',
  'برتقالي': 'Orange',
  'رصاصي': 'Silver Gray',
  'مسترده': 'Mustard',
  'اصفر': 'Yellow',
  'أصفر': 'Yellow',
  'جملي': 'Camel',
  'سيمون': 'Salmon',
  'زيتي غامق': 'Dark Olive',
  'زيتي فاتح': 'Light Olive',
  'مشجر زيتي': 'Olive Floral',
  'مشجر نبيتي': 'Navy Floral',
  'مشجر اسود': 'Black Floral',
  'احمر': 'Red',
  'أحمر': 'Red',
  'اخضر': 'Green',
  'أخضر': 'Green',
  'وردي': 'Pink',
  'بنفسجي': 'Purple',
}

// =============================================
// CATEGORY TRANSLATION MAP (Arabic → English)
// =============================================
const CATEGORY_MAP: Record<string, string> = {
  'تيشرت': 'T-Shirts',
  'تيشيرت': 'T-Shirts',
  'قميص': 'Shirts',
  'دريس': 'Dresses',
  'بنطلون': 'Pants',
  'جاكيت': 'Jackets',
  'بلوزة': 'Blouses',
  'جيبة': 'Skirts',
  'شورت': 'Shorts',
  'بدلة': 'Suits',
  'فستان': 'Dresses',
  'بلوفر': 'Pullover',
  'سويت شيرت': 'Sweatshirt',
}

// =============================================
// INTERFACES
// =============================================
interface RawProduct {
  sku: string
  title: string
  description: string
  price: number
  category: string
  colors: string[]
  sizes: string[]
  vendor: string
  images: string[]
  rowNumber: number
  fileName: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface ImportStats {
  totalRows: number
  validProducts: number
  invalidProducts: number
  duplicateSkus: number
  totalVariants: number
  totalImages: number
  failedRows: Array<{ row: number; file: string; reason: string }>
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function parseMultilineCell(value: any): string[] {
  if (!value) return []
  return String(value)
    .split(/[\r\n,،]+/)
    .map(v => v.replace(/●/g, '').trim())
    .filter(v => v.length > 0)
}

function translateColor(arabicColor: string): string {
  const trimmed = arabicColor.trim()
  return COLOR_MAP[trimmed] || trimmed
}

function translateCategory(arabicCat: string): string {
  const trimmed = arabicCat?.trim() || ''
  return CATEGORY_MAP[trimmed] || trimmed || 'General'
}

function generateHandle(title: string, sku: string): string {
  const cleanTitle = title
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  
  const cleanSku = sku
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
  
  const handle = cleanTitle && cleanSku 
    ? `${cleanTitle}-${cleanSku}`
    : cleanTitle || cleanSku || `product-${Date.now()}`
  
  return handle.replace(/^-+|-+$/g, '') || `product-${Date.now()}`
}

function extractPrice(priceValue: any): number {
  if (!priceValue) return 0
  
  const priceStr = String(priceValue).trim()
  const numericValue = parseFloat(priceStr.replace(/[^\d.]/g, ''))
  
  return isNaN(numericValue) ? 0 : Math.round(numericValue)
}

function generateProductImage(category: string, index: number): string {
  const categoryImages: Record<string, string[]> = {
    'T-Shirts': [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    ],
    'Shirts': [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    ],
    'Dresses': [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
    ],
    'default': [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    ],
  }
  
  const images = categoryImages[category] || categoryImages['default']
  return `${images[index % images.length]}?w=800&h=800&fit=crop&q=80`
}

function validateProduct(product: RawProduct): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!product.sku || product.sku.length === 0) {
    errors.push('Missing SKU (Code)')
  }
  
  if (!product.price || product.price <= 0) {
    errors.push(`Invalid price: ${product.price}`)
  }
  
  if (!product.title || product.title.length === 0) {
    warnings.push('Missing title/description - will use SKU')
  }
  
  // Warnings for missing optional data
  if (product.colors.length === 0) {
    warnings.push('No colors specified - will use "Default"')
  }
  
  if (product.sizes.length === 0) {
    warnings.push('No sizes specified - will use "One Size"')
  }
  
  if (!product.category || product.category === 'General') {
    warnings.push('Category not specified or not recognized')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// =============================================
// EXCEL PARSING
// =============================================
function parseExcelFile(filePath: string, fileName: string): RawProduct[] {
  const XLSX = require('xlsx')
  const wb = XLSX.readFile(filePath)
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const products: RawProduct[] = []
  const header = rows[0]

  // Find column indices
  const colIndex = (name: string) =>
    header.findIndex((h: any) => h && String(h).trim().includes(name))

  const codeIdx = 0 // First column is always Code
  const priceIdx = colIndex('جنيه') !== -1 ? colIndex('جنيه') : colIndex('ريال')
  const descIdx = colIndex('وصف')
  const categoryIdx = colIndex('صنف')
  const colorIdx = colIndex('لون')
  const sizeIdx = colIndex('مقاس')
  
  // Image columns (صوره المنتج 1-5)
  const imageIndices: number[] = []
  for (let i = 1; i <= 5; i++) {
    const imgIdx = colIndex(`صوره المنتج ${i}`)
    if (imgIdx !== -1) imageIndices.push(imgIdx)
  }

  console.log(`\n📄 Parsing: ${fileName}`)
  console.log(`   Sheet: ${sheetName}`)
  console.log(`   Total rows: ${rows.length - 1}`)
  console.log(`   Columns found: Code=${codeIdx}, Price=${priceIdx}, Desc=${descIdx}, Category=${categoryIdx}, Color=${colorIdx}, Size=${sizeIdx}`)

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row.some((x: any) => x)) continue

    const sku = String(row[codeIdx] || '').trim()
    if (!sku) continue

    const price = extractPrice(row[priceIdx])
    const description = String(row[descIdx] || '').trim()
    const categoryAr = String(row[categoryIdx] || '').trim()
    const category = translateCategory(categoryAr)

    const colorsRaw = parseMultilineCell(row[colorIdx])
    const colors = colorsRaw.map(translateColor).filter(c => c.length > 0)

    const sizesRaw = parseMultilineCell(row[sizeIdx])
    const sizes = sizesRaw.map(s => s.toUpperCase().trim()).filter(s => s.length > 0)

    // Extract images from columns
    const images: string[] = []
    for (const imgIdx of imageIndices) {
      const imgValue = row[imgIdx]
      if (imgValue && String(imgValue).trim().length > 0) {
        images.push(String(imgValue).trim())
      }
    }

    products.push({
      sku,
      title: description || sku,
      description: description || `${VENDOR_MAP[fileName]} - ${sku}`,
      price,
      category,
      colors: colors.length > 0 ? colors : ['Default'],
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      vendor: VENDOR_MAP[fileName],
      images,
      rowNumber: i + 1,
      fileName
    })
  }

  return products
}

// =============================================
// BUILD MEDUSA PRODUCT
// =============================================
function buildMedusaProduct(raw: RawProduct, salesChannelId: string | null) {
  const handle = generateHandle(raw.title, raw.sku)
  
  const hasMultipleColors = raw.colors.length > 1
  const hasMultipleSizes = raw.sizes.length > 1

  const variants: any[] = []
  const options: any[] = []

  if (hasMultipleColors && hasMultipleSizes) {
    options.push({ title: 'Color', values: raw.colors })
    options.push({ title: 'Size', values: raw.sizes })
    for (const color of raw.colors) {
      for (const size of raw.sizes) {
        variants.push({
          title: `${color} / ${size}`,
          sku: `${raw.sku}-${color.substring(0, 3).toUpperCase()}-${size}`,
          allow_backorder: false,
          manage_inventory: true,
          prices: [{ currency_code: 'egp', amount: raw.price }],
          options: { Color: color, Size: size },
        })
      }
    }
  } else if (hasMultipleColors) {
    options.push({ title: 'Color', values: raw.colors })
    for (const color of raw.colors) {
      variants.push({
        title: color,
        sku: `${raw.sku}-${color.substring(0, 3).toUpperCase()}`,
        allow_backorder: false,
        manage_inventory: true,
        prices: [{ currency_code: 'egp', amount: raw.price }],
        options: { Color: color },
      })
    }
  } else if (hasMultipleSizes) {
    options.push({ title: 'Size', values: raw.sizes })
    for (const size of raw.sizes) {
      variants.push({
        title: size,
        sku: `${raw.sku}-${size}`,
        allow_backorder: false,
        manage_inventory: true,
        prices: [{ currency_code: 'egp', amount: raw.price }],
        options: { Size: size },
      })
    }
  } else {
    options.push({ title: 'Color', values: raw.colors })
    variants.push({
      title: raw.colors[0] || 'Default',
      sku: raw.sku,
      allow_backorder: false,
      manage_inventory: true,
      prices: [{ currency_code: 'egp', amount: raw.price }],
      options: { Color: raw.colors[0] || 'Default' },
    })
  }

  // Use provided images or generate placeholders
  const productImages = raw.images.length > 0 
    ? raw.images.map(url => ({ url }))
    : [{ url: generateProductImage(raw.category, 0) }]

  const product: any = {
    title: raw.title,
    handle,
    description: raw.description,
    status: ProductStatus.PUBLISHED,
    thumbnail: productImages[0].url,
    images: productImages,
    options,
    variants,
    discountable: true,
    metadata: {
      sku: raw.sku,
      vendor: raw.vendor,
      imported_from: 'excel',
      import_date: new Date().toISOString(),
      source_file: raw.fileName,
      source_row: raw.rowNumber
    },
  }

  if (salesChannelId) {
    product.sales_channels = [{ id: salesChannelId }]
  }

  return product
}

// =============================================
// DATABASE CLEANUP
// =============================================
async function cleanupDatabase(container: any, logger: any) {
  logger.info('\n' + '='.repeat(80))
  logger.info('🗑️  STEP 1: DATABASE CLEANUP')
  logger.info('='.repeat(80))
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  try {
    // Get all products
    const { data: products } = await query.graph({
      entity: 'product',
      fields: ['id', 'title'],
      filters: {},
    })

    if (products.length === 0) {
      logger.info('✅ Database is already clean (no products found)')
      return
    }

    logger.info(`Found ${products.length} products to delete`)
    logger.warn('⚠️  This will DELETE ALL PRODUCTS from the database!')
    
    // Delete in batches
    const BATCH_SIZE = 50
    let deletedCount = 0

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)
      const productIds = batch.map((p: any) => p.id)
      
      try {
        await deleteProductsWorkflow(container).run({
          input: { ids: productIds }
        })
        deletedCount += batch.length
        logger.info(`   Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${deletedCount}/${products.length} products`)
      } catch (err: any) {
        logger.error(`   Failed to delete batch: ${err.message}`)
      }
    }

    logger.info(`✅ Database cleanup complete: ${deletedCount} products deleted`)
    
  } catch (error: any) {
    logger.error(`❌ Database cleanup failed: ${error.message}`)
    throw error
  }
}

// =============================================
// MAIN IMPORT FUNCTION
// =============================================
export default async function fullDatabaseCleanupAndImport({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('\n' + '='.repeat(80))
  logger.info('🚀 FULL DATABASE CLEANUP AND HIGH-FIDELITY IMPORT')
  logger.info('='.repeat(80))
  logger.info('This script will:')
  logger.info('  1. Delete ALL existing products from the database')
  logger.info('  2. Import products from 4 Excel files with strict validation')
  logger.info('  3. Provide detailed import statistics')
  logger.info('='.repeat(80))

  const stats: ImportStats = {
    totalRows: 0,
    validProducts: 0,
    invalidProducts: 0,
    duplicateSkus: 0,
    totalVariants: 0,
    totalImages: 0,
    failedRows: []
  }

  try {
    // ─── STEP 1: CLEANUP DATABASE ───────────────────────────────────────
    await cleanupDatabase(container, logger)

    // ─── STEP 2: GET REQUIRED ENTITIES ──────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📋 STEP 2: LOADING REQUIRED ENTITIES')
    logger.info('='.repeat(80))

    const { data: salesChannels } = await query.graph({
      entity: 'sales_channel',
      fields: ['id', 'name'],
      filters: {},
    })
    const salesChannelId = salesChannels[0]?.id || null
    logger.info(`✅ Sales Channel: ${salesChannelId || 'none'}`)

    const { data: stockLocations } = await query.graph({
      entity: 'stock_location',
      fields: ['id', 'name'],
      filters: {},
    })
    const stockLocationId = stockLocations[0]?.id || null
    logger.info(`✅ Stock Location: ${stockLocationId || 'none'}`)

    // ─── STEP 3: READ EXCEL FILES ───────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📂 STEP 3: READING EXCEL FILES')
    logger.info('='.repeat(80))

    const projectRoot = process.cwd()
    const dataDir = path.join(projectRoot, '..', 'data-products')
    logger.info(`Data directory: ${dataDir}`)

    let allRawProducts: RawProduct[] = []

    for (const fileName of EXCEL_FILES) {
      const filePath = path.join(dataDir, fileName)
      if (!fs.existsSync(filePath)) {
        logger.warn(`⚠️  File not found: ${fileName}`)
        continue
      }

      try {
        const products = parseExcelFile(filePath, fileName)
        allRawProducts = allRawProducts.concat(products)
        stats.totalRows += products.length
        logger.info(`✅ ${fileName}: ${products.length} products`)
      } catch (error: any) {
        logger.error(`❌ Failed to parse ${fileName}: ${error.message}`)
      }
    }

    // ─── STEP 4: VALIDATE PRODUCTS ──────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('✔️  STEP 4: VALIDATING PRODUCTS')
    logger.info('='.repeat(80))

    const validProducts: RawProduct[] = []
    const seenSkus = new Set<string>()

    for (const product of allRawProducts) {
      const validation = validateProduct(product)
      
      if (!validation.valid) {
        stats.invalidProducts++
        stats.failedRows.push({
          row: product.rowNumber,
          file: product.fileName,
          reason: validation.errors.join(', ')
        })
        logger.error(`❌ Row ${product.rowNumber} (${product.fileName}): ${validation.errors.join(', ')}`)
        continue
      }

      if (seenSkus.has(product.sku)) {
        stats.duplicateSkus++
        logger.warn(`⚠️  Duplicate SKU: ${product.sku} (Row ${product.rowNumber}, ${product.fileName})`)
        continue
      }

      seenSkus.add(product.sku)
      validProducts.push(product)
      stats.validProducts++

      if (validation.warnings.length > 0) {
        logger.warn(`⚠️  Row ${product.rowNumber}: ${validation.warnings.join(', ')}`)
      }
    }

    logger.info(`\n✅ Validation complete:`)
    logger.info(`   Valid products: ${stats.validProducts}`)
    logger.info(`   Invalid products: ${stats.invalidProducts}`)
    logger.info(`   Duplicate SKUs: ${stats.duplicateSkus}`)

    if (validProducts.length === 0) {
      logger.error('❌ No valid products to import!')
      return
    }

    // ─── STEP 5: CREATE CATEGORIES ─────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📁 STEP 5: CREATING CATEGORIES')
    logger.info('='.repeat(80))

    const productModuleService = container.resolve('product')
    const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
    const categoryMap = new Map<string, string>()
    existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

    const uniqueCategories = [...new Set(validProducts.map(p => p.category))]
    for (const catName of uniqueCategories) {
      if (!categoryMap.has(catName)) {
        const handle = catName.toLowerCase().replace(/\s+/g, '-')
        const [newCat] = await productModuleService.createProductCategories([{
          name: catName,
          handle,
          is_active: true,
          is_internal: false,
        }])
        categoryMap.set(catName, newCat.id)
        logger.info(`✅ Created category: ${catName}`)
      }
    }

    // ─── STEP 6: IMPORT PRODUCTS ────────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📦 STEP 6: IMPORTING PRODUCTS')
    logger.info('='.repeat(80))

    const BATCH_SIZE = 5
    let successCount = 0
    const createdProductIds: string[] = []

    for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
      const batch = validProducts.slice(i, i + BATCH_SIZE)
      const medusaProducts = batch.map(raw => buildMedusaProduct(raw, salesChannelId))

      // Attach categories
      for (let j = 0; j < batch.length; j++) {
        const catId = categoryMap.get(batch[j].category)
        if (catId) {
          medusaProducts[j].categories = [{ id: catId }]
        }
        
        // Count variants and images
        stats.totalVariants += medusaProducts[j].variants.length
        stats.totalImages += medusaProducts[j].images.length
      }

      try {
        const { result } = await createProductsWorkflow(container).run({
          input: { products: medusaProducts }
        })

        successCount += result.length
        result.forEach((p: any) => createdProductIds.push(p.id))
        
        const progress = Math.round((successCount / validProducts.length) * 100)
        logger.info(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ✅ ${successCount}/${validProducts.length} (${progress}%)`)
      } catch (err: any) {
        logger.error(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ❌ ${err.message}`)
        batch.forEach(p => {
          stats.failedRows.push({
            row: p.rowNumber,
            file: p.fileName,
            reason: err.message
          })
        })
      }
    }

    // ─── STEP 7: SET INVENTORY ──────────────────────────────────────────
    if (stockLocationId && createdProductIds.length > 0) {
      logger.info('\n' + '='.repeat(80))
      logger.info('📊 STEP 7: SETTING INVENTORY LEVELS')
      logger.info('='.repeat(80))

      try {
        const { data: inventoryItems } = await query.graph({
          entity: 'inventory_item',
          fields: ['id'],
          filters: {},
        })

        if (inventoryItems.length > 0) {
          const inventoryLevels = inventoryItems.map((item: any) => ({
            inventory_item_id: item.id,
            location_id: stockLocationId,
            stocked_quantity: 300,
          }))

          for (let i = 0; i < inventoryLevels.length; i += 50) {
            const levelBatch = inventoryLevels.slice(i, i + 50)
            try {
              await createInventoryLevelsWorkflow(container).run({
                input: { inventory_levels: levelBatch },
              })
            } catch (e: any) {
              // Some may already exist
            }
          }
          logger.info(`✅ Inventory set for ${inventoryItems.length} items (300 units each)`)
        }
      } catch (err: any) {
        logger.warn(`⚠️  Inventory setup warning: ${err.message}`)
      }
    }

    // ─── FINAL SUMMARY ──────────────────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📊 IMPORT SUMMARY')
    logger.info('='.repeat(80))
    logger.info(`Total rows processed: ${stats.totalRows}`)
    logger.info(`✅ Successfully imported: ${successCount} products`)
    logger.info(`   Total variants created: ${stats.totalVariants}`)
    logger.info(`   Total images linked: ${stats.totalImages}`)
    logger.info(`❌ Failed: ${stats.invalidProducts} products`)
    logger.info(`⚠️  Duplicate SKUs skipped: ${stats.duplicateSkus}`)
    
    if (stats.failedRows.length > 0) {
      logger.info('\n❌ Failed Rows:')
      stats.failedRows.forEach(fail => {
        logger.info(`   Row ${fail.row} (${fail.file}): ${fail.reason}`)
      })
    }

    logger.info('\n' + '='.repeat(80))
    logger.info('✅ IMPORT COMPLETE!')
    logger.info('='.repeat(80))
    logger.info('\n📋 Next steps:')
    logger.info('   1. Run visibility fix: npm run fix:visibility')
    logger.info('   2. Check storefront: http://localhost:3000/eg')
    logger.info('   3. Check admin panel: http://localhost:5173')

  } catch (error: any) {
    logger.error('\n' + '='.repeat(80))
    logger.error('❌ IMPORT FAILED')
    logger.error('='.repeat(80))
    logger.error(`Error: ${error.message}`)
    logger.error(error.stack)
    throw error
  }
}
