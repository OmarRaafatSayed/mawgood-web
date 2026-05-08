/**
 * Advanced Data Recovery & Import with Self-Healing
 * نظام استيراد متقدم مع إصلاح تلقائي للمشاكل
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'
import * as path from 'path'
import * as fs from 'fs'

// =============================================
// Configuration
// =============================================
const FILE_VENDOR_MAP: Record<string, string> = {
  'H-I-X.xlsx': 'H-I-X',
  'H&S.xlsx': 'H&S',
  'Rehab Lafy.xlsx': 'Rehab Lafy',
  'مصنع E-S-H.xlsx': 'E-S-H Factory',
}

const COLOR_MAP: Record<string, string> = {
  'اسود': 'Black', 'ابيض': 'White', 'احمر': 'Red', 'ازرق': 'Blue',
  'اخضر': 'Green', 'اصفر': 'Yellow', 'برتقالي': 'Orange', 'بني': 'Brown',
  'رمادي': 'Gray', 'بيج': 'Beige', 'كحلي': 'Navy', 'زهري': 'Pink',
  'بنفسجي': 'Purple', 'كاميل': 'Camel', 'جملي': 'Camel', 'كريمي': 'Cream',
  'نيلي': 'Navy', 'سماوي': 'Sky Blue', 'فيروزي': 'Turquoise', 'موف': 'Mauve',
  'خمري': 'Maroon', 'زيتي': 'Olive', 'ذهبي': 'Gold', 'فضي': 'Silver',
  'اوف وايت': 'Off White', 'روز': 'Rose', 'كافيه': 'Coffee', 'تركواز': 'Turquoise',
  'ليموني': 'Lemon', 'نعناعي': 'Mint', 'بمبي': 'Pink', 'سيمون': 'Salmon',
  'لبني': 'Milky', 'كاكاو': 'Cocoa', 'رصاصي': 'Gray', 'مسترده': 'Mustard',
  'بترولي': 'Petrol', 'مينت جرين': 'Mint Green', 'نبيتي': 'Navy',
}

const CATEGORY_MAP: Record<string, string> = {
  'تيشرت': 'T-Shirts', 'قميص': 'Shirts', 'بنطلون': 'Pants', 'جاكيت': 'Jackets',
  'فستان': 'Dresses', 'تنوره': 'Skirts', 'بلوزه': 'Blouses', 'سويتر': 'Sweaters',
  'هودي': 'Hoodies', 'شورت': 'Shorts', 'جينز': 'Jeans', 'بدله': 'Suits',
  'عباية': 'Abayas', 'جلابيه': 'Galabeyas', 'بيجامه': 'Pajamas', 'بوليفار': 'Pullovers',
  'بولو': 'Polo Shirts', 'كارديجان': 'Cardigans', 'سالوبيت': 'Overalls', 'بليزر': 'Blazers',
  'دريس': 'Dresses', 'عباية': 'Abayas', 'بيجامة': 'Pajamas', 'طقم': 'Sets',
}

interface RawProduct {
  code: string
  title: string
  description: string
  sizes: string[]
  colors: string[]
  price: number
  category: string
  vendor: string
  imageUrls: string[]
}

interface HealingStats {
  duplicateSkusFixed: number
  pricesAdjusted: number
  missingFieldsGenerated: number
  totalRowsProcessed: number
  successfulImports: number
  errors: string[]
}

// =============================================
// Self-Healing Functions
// =============================================

function createSeoHandle(title: string, code: string): string {
  const arabicToLatin: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a',
  }
  
  const slugifiedTitle = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .split('')
    .map(char => /[a-z0-9-]/.test(char) ? char : (arabicToLatin[char] || ''))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return slugifiedTitle ? `${slugifiedTitle}-${code.toLowerCase()}` : code.toLowerCase()
}

function extractImagesFromRow(row: any[]): string[] {
  const images: string[] = []
  
  // Check columns 1-5 for image URLs or base64
  for (let i = 1; i <= 5; i++) {
    const cell = row[i]
    if (!cell) continue
    
    const cellStr = String(cell).trim()
    
    // Check if it's a URL
    if (cellStr.startsWith('http://') || cellStr.startsWith('https://')) {
      images.push(cellStr)
    }
    // Check if it's a base64 image
    else if (cellStr.startsWith('data:image/')) {
      images.push(cellStr)
    }
    // Check if it's a file path
    else if (cellStr.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      // Convert to absolute URL if needed
      images.push(cellStr)
    }
  }
  
  return images
}

function parseExcelFile(filePath: string, vendorName: string, stats: HealingStats): RawProduct[] {
  const XLSX = require('xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const products: RawProduct[] = []
  const categoryPrices: Map<string, number[]> = new Map()

  // First pass: collect prices per category for averaging
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const priceStr = String(row[9] || '').trim()
    const category = String(row[10] || '').trim()
    const price = parseFloat(priceStr.replace(/[^\d.]/g, ''))

    if (!isNaN(price) && price > 0 && category) {
      if (!categoryPrices.has(category)) {
        categoryPrices.set(category, [])
      }
      categoryPrices.get(category)!.push(price)
    }
  }

  // Calculate average prices per category
  const avgPrices: Map<string, number> = new Map()
  categoryPrices.forEach((prices, category) => {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    avgPrices.set(category, Math.round(avg))
  })

  // Second pass: process products with healing
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    stats.totalRowsProcessed++

    let code = String(row[0] || '').trim()
    const sizes = String(row[6] || '').trim()
    let title = String(row[7] || '').trim()
    const colors = String(row[8] || '').trim()
    const priceStr = String(row[9] || '').trim()
    const category = String(row[10] || '').trim()
    const description = String(row[12] || '').trim()

    // HEALING: Clean code - remove invalid URL characters
    if (code) {
      code = code
        .replace(/\s*\/\s*/g, '-') // Replace / with -
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^A-Za-z0-9-]/g, '') // Remove all non-alphanumeric except dash
        .toUpperCase()
    }

    // HEALING: Generate missing code
    if (!code) {
      code = `AUTO-${vendorName.toUpperCase()}-${i}`
      stats.missingFieldsGenerated++
    }

    // HEALING: Generate missing title
    if (!title) {
      title = `${vendorName} Product ${code}`
      stats.missingFieldsGenerated++
    }

    // HEALING: Fix price
    let price = parseFloat(priceStr.replace(/[^\d.]/g, ''))
    if (isNaN(price) || price <= 0) {
      // Use category average or default
      price = avgPrices.get(category) || 100
      stats.pricesAdjusted++
    }

    // Parse sizes and colors
    const sizeList = sizes
      .split(/[,،\s●]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== '●')
    
    const colorList = colors
      .split(/[,،\s●]+/)
      .map(c => c.trim())
      .filter(c => c.length > 0 && c !== '●')

    if (sizeList.length === 0) sizeList.push('One Size')
    if (colorList.length === 0) colorList.push('Default')

    // Extract images
    const imageUrls = extractImagesFromRow(row)

    // Generate description
    let fullDescription = description || title
    if (category) {
      fullDescription += `\n\nالفئة: ${category}`
    }
    fullDescription += `\n\nالمقاسات المتاحة: ${sizeList.join(', ')}`
    fullDescription += `\nالألوان المتاحة: ${colorList.join(', ')}`
    fullDescription += `\n\nالمورد: ${vendorName}`
    fullDescription += `\nكود المنتج: ${code}`

    products.push({
      code,
      title,
      description: fullDescription,
      sizes: sizeList,
      colors: colorList,
      price,
      category,
      vendor: vendorName,
      imageUrls,
    })
  }

  return products
}

// =============================================
// Main Import Function
// =============================================
export default async function advancedImportWithHealing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('═══════════════════════════════════════')
  logger.info('🚀 Advanced Data Recovery & Import')
  logger.info('   with Self-Healing Enabled')
  logger.info('═══════════════════════════════════════')
  logger.info('')

  const stats: HealingStats = {
    duplicateSkusFixed: 0,
    pricesAdjusted: 0,
    missingFieldsGenerated: 0,
    totalRowsProcessed: 0,
    successfulImports: 0,
    errors: [],
  }

  // Get Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannelId = salesChannels[0]?.id

  // Get Stock Location
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id

  // Get or create categories
  const productModuleService = container.resolve('product')
  const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
  const categoryMap = new Map<string, string>()
  existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

  // Get existing products to avoid duplicates
  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle'],
    filters: {},
  })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))
  logger.info(`📊 Found ${existingProducts.length} existing products in database`)
  logger.info('')

  // Track used SKUs
  const usedSkus = new Set<string>()

  // Read Excel files
  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  let allRawProducts: RawProduct[] = []

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }
    logger.info(`📄 Processing: ${fileName}`)
    try {
      const products = parseExcelFile(filePath, FILE_VENDOR_MAP[fileName], stats)
      logger.info(`   ✅ Extracted ${products.length} products`)
      allRawProducts = allRawProducts.concat(products)
    } catch (error) {
      logger.error(`   ❌ Error reading ${fileName}: ${error.message}`)
      stats.errors.push(`File ${fileName}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`📊 Total products extracted: ${allRawProducts.length}`)
  logger.info(`📊 Rows processed: ${stats.totalRowsProcessed}`)
  logger.info(`🔧 Prices adjusted: ${stats.pricesAdjusted}`)
  logger.info(`🔧 Missing fields generated: ${stats.missingFieldsGenerated}`)
  logger.info('')

  // Create missing categories
  const uniqueCategories = new Set(
    allRawProducts.map(p => CATEGORY_MAP[p.category] || p.category)
  )
  for (const catName of uniqueCategories) {
    if (!categoryMap.has(catName)) {
      const newCat = await productModuleService.createProductCategories({
        name: catName,
        is_active: true,
        is_internal: false,
      })
      categoryMap.set(catName, newCat.id)
      logger.info(`📁 Created category: ${catName}`)
    }
  }

  logger.info('')
  logger.info('🔄 Starting import with duplicate prevention...')
  logger.info('')

  // Import products
  for (const raw of allRawProducts) {
    try {
      const categoryName = CATEGORY_MAP[raw.category] || raw.category
      const categoryId = categoryMap.get(categoryName)

      // Create SEO-friendly handle
      const baseHandle = createSeoHandle(raw.title, raw.code)
      let handle = baseHandle
      let handleSuffix = 1

      // HEALING: Ensure unique handle
      while (existingHandles.has(handle)) {
        handle = `${baseHandle}-${handleSuffix}`
        handleSuffix++
        stats.duplicateSkusFixed++
      }
      existingHandles.add(handle)

      // Create variants with unique SKUs
      const variants = []
      for (const color of raw.colors) {
        for (const size of raw.sizes) {
          const colorEn = COLOR_MAP[color] || color
          let baseSku = `${raw.code}-${colorEn.substring(0, 3).toUpperCase()}-${size}`
            .replace(/[^A-Z0-9-]/g, '')
          
          let sku = baseSku
          let skuSuffix = 1

          // HEALING: Ensure unique SKU
          while (usedSkus.has(sku)) {
            sku = `${baseSku}-DUP${skuSuffix}`
            skuSuffix++
            stats.duplicateSkusFixed++
          }
          usedSkus.add(sku)

          variants.push({
            title: `${colorEn} / ${size}`,
            sku,
            options: {
              Color: colorEn,
              Size: size,
            },
            prices: [
              {
                amount: raw.price * 100,
                currency_code: 'egp',
              },
            ],
          })
        }
      }

      // Prepare images
      const images = raw.imageUrls.length > 0 
        ? raw.imageUrls.map(url => ({ url }))
        : []

      const productData = {
        title: raw.title,
        handle,
        status: ProductStatus.PUBLISHED,
        description: raw.description,
        category_ids: categoryId ? [categoryId] : [],
        sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
        images,
        options: [
          { title: 'Color', values: raw.colors.map(c => COLOR_MAP[c] || c) },
          { title: 'Size', values: raw.sizes },
        ],
        variants,
      }

      const { result } = await createProductsWorkflow(container).run({
        input: { products: [productData] },
      })

      const product = result[0]

      // Set inventory
      if (stockLocationId && product.variants) {
        const inventoryItems = []
        for (const variant of product.variants) {
          if (variant.inventory_items?.[0]?.inventory_item_id) {
            inventoryItems.push({
              inventory_item_id: variant.inventory_items[0].inventory_item_id,
              location_id: stockLocationId,
              stocked_quantity: 300,
            })
          }
        }

        if (inventoryItems.length > 0) {
          await createInventoryLevelsWorkflow(container).run({
            input: { inventory_levels: inventoryItems },
          })
        }
      }

      stats.successfulImports++
      const imageStatus = images.length > 0 ? `🖼️ ${images.length} img` : '⚠️ no img'
      logger.info(`   ✅ ${raw.title} ${imageStatus}`)
      logger.info(`      ${variants.length} variants | Handle: ${handle}`)
    } catch (error) {
      const errorMsg = `${raw.title} (${raw.code}) - ${error.message}`
      stats.errors.push(errorMsg)
      logger.error(`   ❌ ${errorMsg}`)
    }
  }

  // Get final count
  const { data: finalProducts } = await query.graph({
    entity: 'product',
    fields: ['id'],
    filters: {},
  })

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 FINAL HEALING REPORT')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Successfully imported: ${stats.successfulImports} products`)
  logger.info(`🔧 Duplicate SKUs fixed: ${stats.duplicateSkusFixed}`)
  logger.info(`💰 Prices adjusted from zero: ${stats.pricesAdjusted}`)
  logger.info(`📝 Missing fields generated: ${stats.missingFieldsGenerated}`)
  logger.info(`📊 Total rows processed: ${stats.totalRowsProcessed}`)
  logger.info(`📦 Final product count in DB: ${finalProducts.length}`)
  
  if (stats.errors.length > 0) {
    logger.warn(`❌ Errors encountered: ${stats.errors.length}`)
    logger.info('')
    logger.info('Error details:')
    stats.errors.slice(0, 10).forEach(err => logger.error(`   - ${err}`))
    if (stats.errors.length > 10) {
      logger.info(`   ... and ${stats.errors.length - 10} more errors`)
    }
  }
  
  logger.info('')
  logger.info('🎉 Import complete!')
  logger.info('═══════════════════════════════════════')
}
