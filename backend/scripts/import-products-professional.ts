/**
 * Professional Product Import System
 * نظام احترافي لاستيراد المنتجات مع الصور والأوصاف
 * 
 * Excel Structure Expected:
 * Column 0: Product Code (كود المنتج)
 * Column 1-5: Reserved
 * Column 6: Sizes (المقاسات) - comma separated
 * Column 7: Description (الوصف) - will be used as TITLE
 * Column 8: Colors (الألوان) - comma separated
 * Column 9: Price (السعر)
 * Column 10: Category (الفئة)
 * Column 11: Image URL or Path (رابط الصورة أو المسار)
 * Column 12: Additional Description (وصف إضافي) - will be used as DESCRIPTION
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
  'اوف وايت': 'Off White',
  'روز': 'Rose',
  'كافيه': 'Coffee',
  'تركواز': 'Turquoise',
  'ليموني': 'Lemon',
  'نعناعي': 'Mint',
  'بمبي': 'Pink',
  'سيمون': 'Salmon',
  'لبني': 'Milky',
  'كاكاو': 'Cocoa',
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
  'بوليفار': 'Pullovers',
  'بولو': 'Polo Shirts',
  'كارديجان': 'Cardigans',
  'سالوبيت': 'Overalls',
  'بليزر': 'Blazers',
}

interface RawProduct {
  code: string
  title: string // العنوان الرئيسي
  description: string // الوصف التفصيلي
  sizes: string[]
  colors: string[]
  price: number
  category: string
  vendor: string
  imageUrl?: string // رابط الصورة
}

// =============================================
// Image Handling
// =============================================
function getProductImageUrl(code: string, vendor: string, imageUrl?: string): string | null {
  // إذا كان هناك رابط صورة في الإكسل، استخدمه
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl
  }

  // البحث عن صورة محلية في مجلد الصور
  const imagesDir = path.join(__dirname, '..', '..', 'data-products', 'images')
  
  // محاولة إيجاد الصورة بأسماء مختلفة
  const possibleNames = [
    `${code}.jpg`,
    `${code}.jpeg`,
    `${code}.png`,
    `${code}.webp`,
    `${vendor}-${code}.jpg`,
    `${vendor}-${code}.jpeg`,
    `${vendor}-${code}.png`,
    `${vendor}-${code}.webp`,
  ]

  for (const name of possibleNames) {
    const imagePath = path.join(imagesDir, name)
    if (fs.existsSync(imagePath)) {
      // إرجاع رابط نسبي أو مطلق حسب الإعداد
      return `/images/products/${name}`
    }
  }

  // صورة افتراضية إذا لم توجد صورة
  return null
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

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const code = String(row[0] || '').trim()
    
    // Get image URLs from columns 1-5 (صورة المنتج 1-5)
    const imageUrls: string[] = []
    for (let imgCol = 1; imgCol <= 5; imgCol++) {
      const imgUrl = String(row[imgCol] || '').trim()
      if (imgUrl && (imgUrl.startsWith('http://') || imgUrl.startsWith('https://'))) {
        imageUrls.push(imgUrl)
      }
    }
    
    const sizes = String(row[6] || '').trim()
    const title = String(row[7] || '').trim() // العنوان الرئيسي
    const colors = String(row[8] || '').trim()
    const priceStr = String(row[9] || '').trim()
    const category = String(row[10] || '').trim()
    const description = String(row[12] || '').trim() // الوصف التفصيلي

    if (!code || !title || !priceStr) continue

    const price = parseFloat(priceStr.replace(/[^\d.]/g, ''))
    if (isNaN(price) || price <= 0) continue

    const sizeList = sizes.split(/[,،\s]+/).filter(s => s.length > 0)
    const colorList = colors.split(/[,،\s]+/).filter(c => c.length > 0)

    if (sizeList.length === 0) sizeList.push('One Size')
    if (colorList.length === 0) colorList.push('Default')

    // إنشاء وصف احترافي
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
      title, // العنوان الرئيسي
      description: fullDescription, // الوصف الكامل
      sizes: sizeList,
      colors: colorList,
      price,
      category,
      vendor: vendorName,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined, // Use first image URL
    })
  }

  return products
}

// =============================================
// Main Import Function
// =============================================
export default async function importProductsProfessional({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== 🚀 Professional Product Import Started ===')
  logger.info('')

  // Get Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannelId = salesChannels[0]?.id
  logger.info(`📢 Sales Channel: ${salesChannels[0]?.name || 'none'} (${salesChannelId})`)

  // Get Stock Location
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id
  logger.info(`📦 Stock Location: ${stockLocations[0]?.name || 'none'} (${stockLocationId})`)

  // Get or create categories
  const productModuleService = container.resolve('product')
  const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
  const categoryMap = new Map<string, string>()
  existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

  // Read Excel files
  const dataDir = path.join(__dirname, '..', '..', 'data-products')
  logger.info(`📁 Reading Excel files from: ${dataDir}`)
  logger.info('')

  let allRawProducts: RawProduct[] = []

  for (const fileName of Object.keys(FILE_VENDOR_MAP)) {
    const filePath = path.join(dataDir, fileName)
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${fileName}`)
      continue
    }
    logger.info(`📄 Reading: ${fileName}`)
    try {
      const products = parseExcelFile(filePath, FILE_VENDOR_MAP[fileName])
      logger.info(`   ✅ Found ${products.length} products`)
      allRawProducts = allRawProducts.concat(products)
    } catch (error) {
      logger.error(`   ❌ Error reading ${fileName}: ${error.message}`)
    }
  }

  logger.info('')
  logger.info(`📊 Total products to import: ${allRawProducts.length}`)
  logger.info('')

  if (allRawProducts.length === 0) {
    logger.error('❌ No products found!')
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
      logger.info(`📁 Created category: ${catName}`)
    }
  }

  // Import products in batches
  const BATCH_SIZE = 5
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  logger.info('')
  logger.info('🔄 Starting import...')
  logger.info('')

  for (let i = 0; i < allRawProducts.length; i += BATCH_SIZE) {
    const batch = allRawProducts.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(allRawProducts.length / BATCH_SIZE)
    
    logger.info(`📦 Batch ${batchNum}/${totalBatches}`)

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

        // Get image URL
        const imageUrl = getProductImageUrl(raw.code, raw.vendor, raw.imageUrl)
        const images = imageUrl ? [{ url: imageUrl }] : []

        // Create SEO-friendly handle using transliteration
        // Convert Arabic to Latin characters for URL safety
        const transliterateArabic = (text: string): string => {
          const arabicToLatin: Record<string, string> = {
            'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
            'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
            'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
            'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
            'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
            'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
            'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
            'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
            'ة': 'h', 'ء': 'a',
            // Vowels
            'َ': 'a', 'ُ': 'u', 'ِ': 'i',
            'ّ': '', 'ْ': '',
          }
          
          return text.split('').map(char => arabicToLatin[char] || char).join('')
        }
        
        const slugifiedTitle = raw.title
          .toLowerCase()
          .replace(/\s+/g, '-') // Replace spaces with dashes
          .split('')
          .map(char => {
            // Keep English letters, numbers, and dashes
            if (/[a-z0-9-]/.test(char)) return char
            // Transliterate Arabic
            const arabicToLatin: Record<string, string> = {
              'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
              'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
              'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
              'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
              'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
              'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
              'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
              'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
              'ة': 'h', 'ء': 'a',
            }
            return arabicToLatin[char] || ''
          })
          .join('')
          .replace(/-+/g, '-') // Replace multiple dashes with single dash
          .replace(/^-|-$/g, '') // Remove leading/trailing dashes
        
        // Format: transliterated-name-code
        // Example: qamis-babl-mhajr-esh027
        const seoHandle = slugifiedTitle 
          ? `${slugifiedTitle}-${raw.code.toLowerCase()}`
          : raw.code.toLowerCase()

        const productData = {
          title: raw.title, // العنوان الرئيسي
          handle: seoHandle, // استخدام اسم المنتج المترجم + الكود للـ SEO
          status: ProductStatus.PUBLISHED,
          description: raw.description, // الوصف الكامل
          category_ids: categoryId ? [categoryId] : [],
          sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
          images, // الصور
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
        const imageStatus = images.length > 0 ? '🖼️' : '⚠️ (no image)'
        logger.info(`   ✅ ${raw.title} ${imageStatus}`)
        logger.info(`      ${variants.length} variants | ${raw.vendor}`)
      } catch (error) {
        errorCount++
        const errorMsg = `${raw.title} - ${error.message}`
        errors.push(errorMsg)
        logger.error(`   ❌ ${errorMsg}`)
      }
    }
    logger.info('')
  }

  logger.info('═══════════════════════════════════════')
  logger.info('📊 Import Summary')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Successfully imported: ${successCount} products`)
  if (errorCount > 0) {
    logger.warn(`❌ Failed: ${errorCount} products`)
    logger.info('')
    logger.info('Failed products:')
    errors.forEach(err => logger.error(`   - ${err}`))
  }
  logger.info('')
  logger.info('🌐 Check storefront at: http://localhost:3000/ar/categories')
  logger.info('═══════════════════════════════════════')
}
