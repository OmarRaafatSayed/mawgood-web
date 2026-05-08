/**
 * Simple Product Import from Excel - No Seller Required
 * استيراد بسيط للمنتجات من Excel بدون الحاجة لـ Seller
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
  'اسود': 'Black',
  'ابيض': 'White',
  'احمر': 'Red',
  'ازرق': 'Blue',
  'اخضر': 'Green',
  'اصفر': 'Yellow',
  'برتقالي': 'Orange',
  'بني': 'Brown',
  'رمادي': 'Gray',
  'بيج': 'Beige',
  'كحلي': 'Navy',
  'زهري': 'Pink',
  'بنفسجي': 'Purple',
  'كاميل': 'Camel',
  'جملي': 'Camel',
  'كريمي': 'Cream',
  'نيلي': 'Navy',
  'سماوي': 'Sky Blue',
  'فيروزي': 'Turquoise',
  'موف': 'Mauve',
  'خمري': 'Maroon',
  'زيتي': 'Olive',
  'ذهبي': 'Gold',
  'فضي': 'Silver',
}

const CATEGORY_MAP: Record<string, string> = {
  'تيشرت': 'T-Shirts',
  'قميص': 'Shirts',
  'بنطلون': 'Pants',
  'جاكيت': 'Jackets',
  'فستان': 'Dresses',
  'تنوره': 'Skirts',
  'بلوزه': 'Blouses',
  'سويتر': 'Sweaters',
  'هودي': 'Hoodies',
  'شورت': 'Shorts',
  'جينز': 'Jeans',
  'بدله': 'Suits',
  'عباية': 'Abayas',
  'جلابيه': 'Galabeyas',
  'بيجامه': 'Pajamas',
}

interface RawProduct {
  code: string
  description: string
  sizes: string[]
  colors: string[]
  price: number
  category: string
  vendor: string
}

// =============================================
// Parse Excel File
// =============================================
function parseExcelFile(filePath: string, vendorName: string): RawProduct[] {
  const XLSX = require('xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const products: RawProduct[] = []
  const headerRow = rows[0]

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const code = String(row[0] || '').trim()
    const sizes = String(row[6] || '').trim()
    const description = String(row[7] || '').trim()
    const colors = String(row[8] || '').trim()
    const priceStr = String(row[9] || '').trim()
    const category = String(row[10] || '').trim()

    if (!code || !description || !priceStr) continue

    const price = parseFloat(priceStr.replace(/[^\d.]/g, ''))
    if (isNaN(price) || price <= 0) continue

    const sizeList = sizes.split(/[,،\s]+/).filter(s => s.length > 0)
    const colorList = colors.split(/[,،\s]+/).filter(c => c.length > 0)

    if (sizeList.length === 0) sizeList.push('One Size')
    if (colorList.length === 0) colorList.push('Default')

    products.push({
      code,
      description,
      sizes: sizeList,
      colors: colorList,
      price,
      category,
      vendor: vendorName,
    })
  }

  return products
}

// =============================================
// Main Import Function
// =============================================
export default async function importProductsSimple({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Simple Product Import Started ===')

  // Get Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannelId = salesChannels[0]?.id
  logger.info(`Sales Channel: ${salesChannelId || 'none'}`)

  // Get Stock Location
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id
  logger.info(`Stock Location: ${stockLocationId || 'none'}`)

  // Get or create categories
  const productModuleService = container.resolve('product')
  const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
  const categoryMap = new Map<string, string>()
  existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

  // Read Excel files
  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  logger.info(`Reading Excel files from: ${dataDir}`)

  let allRawProducts: RawProduct[] = []

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found: ${filePath}`)
      continue
    }
    logger.info(`Reading: ${fileName}`)
    const products = parseExcelFile(filePath, FILE_VENDOR_MAP[fileName])
    logger.info(`  → Found ${products.length} products`)
    allRawProducts = allRawProducts.concat(products)
  }

  logger.info(`Total products to import: ${allRawProducts.length}`)

  if (allRawProducts.length === 0) {
    logger.error('No products found!')
    return
  }

  // Create missing categories
  const uniqueCategories = new Set(allRawProducts.map(p => CATEGORY_MAP[p.category] || p.category))
  for (const catName of uniqueCategories) {
    if (!categoryMap.has(catName)) {
      const newCat = await productModuleService.createProductCategories({
        name: catName,
        is_active: true,
        is_internal: false,
      })
      categoryMap.set(catName, newCat.id)
      logger.info(`Created category: ${catName}`)
    }
  }

  // Import products in batches
  const BATCH_SIZE = 5
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < allRawProducts.length; i += BATCH_SIZE) {
    const batch = allRawProducts.slice(i, i + BATCH_SIZE)
    logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allRawProducts.length / BATCH_SIZE)}`)

    for (const raw of batch) {
      try {
        const categoryName = CATEGORY_MAP[raw.category] || raw.category
        const categoryId = categoryMap.get(categoryName)

        const timestamp = Date.now().toString().slice(-6)
        const variants = []
        for (const color of raw.colors) {
          for (const size of raw.sizes) {
            const colorEn = COLOR_MAP[color] || color
            const sku = `${raw.code}-${colorEn.substring(0, 3).toUpperCase()}-${size}-${timestamp}`
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

        const productData = {
          title: raw.description,
          handle: `${raw.code.toLowerCase()}-${raw.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`,
          status: ProductStatus.PUBLISHED,
          description: `${raw.description} - ${raw.vendor}`,
          category_ids: categoryId ? [categoryId] : [],
          sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
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

        successCount++
        logger.info(`✅ Imported: ${raw.description} (${variants.length} variants)`)
      } catch (error) {
        errorCount++
        logger.error(`❌ Failed: ${raw.description} - ${error.message}`)
      }
    }
  }

  logger.info('')
  logger.info('=== Import Complete ===')
  logger.info(`✅ Successfully imported: ${successCount} products`)
  if (errorCount > 0) logger.warn(`❌ Failed: ${errorCount} products`)
  logger.info('')
  logger.info('🌐 Check storefront at: http://localhost:3000/ar/categories')
}
