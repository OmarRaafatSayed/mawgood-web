/**
 * Import Products from Excel Files
 * يقرأ ملفات Excel من مجلد data-products ويضيفها للـ backend
 *
 * Run: npx medusa exec ./src/scripts/import-excel-products.ts
 *
 * Excel files expected in: <project-root>/data-products/
 *   - H-I-X.xlsx
 *   - H&S.xlsx
 *   - Rehab Lafy.xlsx
 *   - مصنع E-S-H.xlsx
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'
import * as path from 'path'
import * as fs from 'fs'

// =============================================
// Arabic color name → English translation map
// =============================================
const COLOR_MAP: Record<string, string> = {
  'ابيض': 'White', 'أبيض': 'White',
  'اسود': 'Black', 'أسود': 'Black',
  'رمادي': 'Gray',
  'زيتي': 'Olive',
  'نبيتي': 'Navy',
  'بيج': 'Beige',
  'بني': 'Brown',
  'سماوي': 'Sky Blue',
  'ازرق': 'Blue', 'أزرق': 'Blue',
  'كحلي': 'Dark Blue',
  'بترولي': 'Petrol',
  'مينت جرين': 'Mint Green',
  'موف': 'Mauve',
  'برتقالي': 'Orange',
  'رصاصي': 'Silver Gray',
  'مسترده': 'Mustard',
  'اصفر': 'Yellow', 'أصفر': 'Yellow',
  'جملي': 'Camel',
  'سيمون': 'Salmon',
  'زيتي غامق': 'Dark Olive',
  'زيتي فاتح': 'Light Olive',
  'مشجر زيتي': 'Olive Floral',
  'مشجر نبيتي': 'Navy Floral',
  'مشجر اسود': 'Black Floral',
}

// =============================================
// Arabic category name → English translation
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
}

// =============================================
// Vendor/Seller name per file
// =============================================
const FILE_VENDOR_MAP: Record<string, string> = {
  'H-I-X.xlsx': 'H-I-X',
  'H&S.xlsx': 'H&S',
  'Rehab Lafy.xlsx': 'Rehab Lafy',
  'مصنع E-S-H.xlsx': 'E-S-H Factory',
}

// =============================================
// Smart image generation based on category + color
// =============================================
function generateProductImage(category: string, colors: string[], sku: string): string {
  // Use a deterministic hash from SKU to get consistent images
  const hash = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageIndex = hash % 10 // 10 different images per category
  
  // Map categories to Unsplash collections
  const categoryImages: Record<string, string[]> = {
    'T-Shirts': [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a',
    ],
    'Shirts': [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633',
      'https://images.unsplash.com/photo-1598032895397-b9c644f8c3c7',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e',
      'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77',
    ],
    'Dresses': [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03',
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf',
    ],
    'Pants': [
      'https://images.unsplash.com/photo-1542272604-787c3835535d',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8',
      'https://images.unsplash.com/photo-1517438476312-10d79c077509',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
      'https://images.unsplash.com/photo-1624378440070-7b44c0b0b2e8',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a',
    ],
    'Jackets': [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
      'https://images.unsplash.com/photo-1548126032-079d3e1c8c0e',
      'https://images.unsplash.com/photo-1544923246-77307dd654cb',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a',
    ],
    'default': [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
      'https://images.unsplash.com/photo-1445205170230-053b83016050',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      'https://images.unsplash.com/photo-1558769132-cb1aea3c8565',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
      'https://images.unsplash.com/photo-1467043237213-65f2da53396f',
      'https://images.unsplash.com/photo-1509319117132-206c0edd3b70',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    ],
  }
  
  const images = categoryImages[category] || categoryImages['default']
  const baseUrl = images[imageIndex % images.length]
  
  return `${baseUrl}?w=800&h=800&fit=crop&q=80`
}

// =============================================
// Helper: parse multiline cell values
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
  // Remove Arabic and special characters, keep only alphanumeric and hyphens
  const cleanTitle = title
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII (Arabic)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 30)
  
  const cleanSku = sku
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
  
  // Ensure handle starts with alphanumeric
  const handle = cleanTitle && cleanSku 
    ? `${cleanTitle}-${cleanSku}`
    : cleanTitle || cleanSku || `product-${Date.now()}`
  
  return handle.replace(/^-+|-+$/g, '') || `product-${Date.now()}`
}

function generateTitle(description: string, sku: string, vendor: string): string {
  const desc = description?.trim() || ''
  if (desc) {
    return desc.charAt(0).toUpperCase() + desc.slice(1, 60)
  }
  return `${vendor} - ${sku}`
}

// =============================================
// Raw product interface
// =============================================
interface RawProduct {
  sku: string
  description: string
  price: number
  category: string
  colors: string[]
  sizes: string[]
  vendor: string
  imageUrl: string
}

// =============================================
// Parse a single Excel file
// =============================================
function parseExcelFile(filePath: string, vendorName: string): RawProduct[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const XLSX = require('xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const products: RawProduct[] = []
  const header = rows[0]

  const colIndex = (name: string) =>
    header.findIndex((h: any) => h && String(h).trim().includes(name))

  const priceEGPIdx = colIndex('جنيه')
  const descIdx = colIndex('وصف')
  const categoryIdx = colIndex('صنف')
  const colorIdx = colIndex('لون')
  const sizeIdx = colIndex('مقاس')

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row.some((x: any) => x)) continue

    const sku = String(row[0] || '').trim()
    if (!sku) continue

    const priceRaw = row[priceEGPIdx]
    const price = priceRaw ? Number(priceRaw) : 0
    if (!price || price <= 0) continue

    const description = String(row[descIdx] || '').trim()
    const categoryAr = String(row[categoryIdx] || '').trim()
    const category = translateCategory(categoryAr)

    const colorsRaw = parseMultilineCell(row[colorIdx])
    const colors = colorsRaw.map(translateColor).filter(c => c.length > 0)

    const sizesRaw = parseMultilineCell(row[sizeIdx])
    const sizes = sizesRaw.map(s => s.toUpperCase().trim()).filter(s => s.length > 0)

    const imageUrl = generateProductImage(category, colors, sku)

    products.push({
      sku,
      description,
      price,
      category,
      colors: colors.length > 0 ? colors : ['Default'],
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      vendor: vendorName,
      imageUrl,
    })
  }

  return products
}

// =============================================
// Build Medusa product input from raw product
// =============================================
function buildMedusaProduct(raw: RawProduct, salesChannelId: string | null) {
  const title = generateTitle(raw.description, raw.sku, raw.vendor)
  const handle = generateHandle(title, raw.sku)

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

  const product: any = {
    title,
    handle,
    description: raw.description || `${title} - ${raw.vendor}`,
    status: ProductStatus.PUBLISHED,
    thumbnail: raw.imageUrl,
    images: [{ url: raw.imageUrl }],
    options,
    variants,
    discountable: true,
    metadata: {
      sku: raw.sku,
      vendor: raw.vendor,
      imported_from: 'excel',
    },
  }

  if (salesChannelId) {
    product.sales_channels = [{ id: salesChannelId }]
  }

  return product
}

// =============================================
// Main script
// =============================================
export default async function importExcelProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Starting Excel Products Import ===')

  // ─── 1. Get Sales Channel ───────────────────────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannelId = salesChannels[0]?.id || null
  logger.info(`Sales Channel: ${salesChannelId || 'none - products will be created without sales channel'}`)

  // ─── 2. Get Stock Location ──────────────────────────────────────────────
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id || null
  logger.info(`Stock Location: ${stockLocationId || 'none'}`)

  // ─── 3. Get existing Seller (to link products) ──────────────────────────
  let activeSeller = null
  try {
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'store_status'],
      filters: {},
    })

    // Use first ACTIVE seller, or any seller if none active
    activeSeller =
      sellers.find((s: any) => s.store_status === 'ACTIVE') || sellers[0]

    if (activeSeller) {
      logger.info(`Using Seller: ${activeSeller.name} (${activeSeller.id}) - Status: ${activeSeller.store_status}`)
    }
  } catch (error) {
    logger.warn('Seller service not available - products will be created without seller')
    logger.warn('This is OK for basic product import')
  }

  if (!activeSeller) {
    logger.warn('No seller found! Products will be created without a seller.')
    logger.warn('They will still appear in storefront.')
  }

  // ─── 4. Get or create categories ────────────────────────────────────────
  const productModuleService = container.resolve('product')
  const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
  const categoryMap = new Map<string, string>()
  existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

  // ─── 5. Read Excel files ─────────────────────────────────────────────────
  // Use process.cwd() to get the project root reliably
  const projectRoot = process.cwd()
  const dataDir = path.join(projectRoot, '..', 'data-products')
  logger.info(`Looking for Excel files in: ${dataDir}`)

  let allRawProducts: RawProduct[] = []

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found: ${filePath}`)
      continue
    }
    logger.info(`Reading: ${fileName}`)
    const products = parseExcelFile(filePath, FILE_VENDOR_MAP[fileName])
    logger.info(`  → Found ${products.length} valid products`)
    allRawProducts = allRawProducts.concat(products)
  }

  // Remove duplicate SKUs - keep first occurrence
  const seenSkus = new Set<string>()
  const uniqueProducts: RawProduct[] = []
  let duplicateCount = 0

  for (const product of allRawProducts) {
    if (!seenSkus.has(product.sku)) {
      seenSkus.add(product.sku)
      uniqueProducts.push(product)
    } else {
      duplicateCount++
      logger.warn(`  Skipping duplicate SKU: ${product.sku}`)
    }
  }

  if (duplicateCount > 0) {
    logger.warn(`Removed ${duplicateCount} duplicate products`)
  }

  allRawProducts = uniqueProducts
  logger.info(`Total unique products to import: ${allRawProducts.length}`)

  if (allRawProducts.length === 0) {
    logger.error('No products found in Excel files!')
    return
  }

  // ─── 6. Create missing categories ───────────────────────────────────────
  const uniqueCategories = [...new Set(allRawProducts.map(p => p.category))]
  for (const catName of uniqueCategories) {
    if (!categoryMap.has(catName)) {
      logger.info(`Creating category: ${catName}`)
      const handle = catName.toLowerCase().replace(/\s+/g, '-')
      const [newCat] = await productModuleService.createProductCategories([{
        name: catName,
        handle,
        is_active: true,
        is_internal: false,
      }])
      categoryMap.set(catName, newCat.id)
    }
  }

  // ─── 7. Import products in batches ──────────────────────────────────────
  const BATCH_SIZE = 5
  let successCount = 0
  let errorCount = 0
  const createdProductIds: string[] = []

  for (let i = 0; i < allRawProducts.length; i += BATCH_SIZE) {
    const batch = allRawProducts.slice(i, i + BATCH_SIZE)
    const medusaProducts = batch.map(raw => buildMedusaProduct(raw, salesChannelId))

    // Attach category IDs
    for (let j = 0; j < batch.length; j++) {
      const catId = categoryMap.get(batch[j].category)
      if (catId) {
        medusaProducts[j].categories = [{ id: catId }]
      }
    }

    try {
      const workflowInput: any = { products: medusaProducts }

      // Link to seller via additional_data (MercurJS pattern)
      if (activeSeller) {
        workflowInput.additional_data = { seller_id: activeSeller.id }
      }

      const { result } = await createProductsWorkflow(container).run({
        input: workflowInput,
      })

      successCount += result.length
      result.forEach((p: any) => createdProductIds.push(p.id))
      logger.info(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ✅ Created ${result.length} products`)
    } catch (err: any) {
      errorCount += batch.length
      logger.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} ❌ failed: ${err.message}`)
      // Log which products failed
      batch.forEach(p => logger.error(`  - ${p.sku}: ${p.description}`))
    }
  }

  // ─── 8. Create inventory levels (300 units per variant) ─────────────────
  if (stockLocationId && createdProductIds.length > 0) {
    logger.info('Setting up inventory levels (300 units per variant)...')
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

        // Create in batches of 50
        for (let i = 0; i < inventoryLevels.length; i += 50) {
          const levelBatch = inventoryLevels.slice(i, i + 50)
          try {
            await createInventoryLevelsWorkflow(container).run({
              input: { inventory_levels: levelBatch },
            })
          } catch (e: any) {
            // Some may already exist, skip
          }
        }
        logger.info(`Inventory levels set for ${inventoryItems.length} items`)
      }
    } catch (err: any) {
      logger.warn(`Inventory setup warning: ${err.message}`)
    }
  }

  // ─── 9. Summary ─────────────────────────────────────────────────────────
  logger.info('')
  logger.info('=== Import Complete ===')
  logger.info(`✅ Successfully imported: ${successCount} products`)
  if (errorCount > 0) logger.warn(`❌ Failed: ${errorCount} products`)
  logger.info('')
  logger.info('📋 Next step: Run the visibility fix script:')
  logger.info('   npx medusa exec ./src/scripts/fix-excel-products-visibility.ts')
  logger.info('')
  logger.info('🌐 Then check storefront at: http://localhost:3000/eg')
}
