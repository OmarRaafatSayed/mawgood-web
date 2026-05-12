/**
 * Professional Product Import from Validated JSON
 * استيراد احترافي للمنتجات من JSON مع الأسعار والصور والمخزون
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'
import * as path from 'path'
import * as fs from 'fs'

interface ValidatedProduct {
  title: string
  sku: string
  price: number
  handle: string
  description: string
  category: string
  brand: string
  variants: Array<{
    title: string
    option_name: string
  }>
  images: string[]
  inventory: number
}

// =============================================
// Main Import Function
// =============================================
export default async function importFromJson({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Professional Product Import from JSON ===')

  // Read validated JSON
  const jsonPath = path.join(__dirname, 'imports', 'products-validated.json')
  if (!fs.existsSync(jsonPath)) {
    logger.error(`JSON file not found: ${jsonPath}`)
    logger.error('Please run: python scripts/excel-to-json-validator.py')
    return
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  const products: ValidatedProduct[] = JSON.parse(jsonContent)

  if (!products || products.length === 0) {
    logger.error('No products found in JSON file!')
    return
  }

  logger.info(`Found ${products.length} validated products`)

  // Get Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  
  if (!salesChannels || salesChannels.length === 0) {
    logger.error('No sales channels found!')
    return
  }

  const salesChannelId = salesChannels[0].id
  logger.info(`Using Sales Channel: ${salesChannelId}`)

  // Get Stock Location
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })

  if (!stockLocations || stockLocations.length === 0) {
    logger.error('No stock locations found!')
    return
  }

  const stockLocationId = stockLocations[0].id
  logger.info(`Using Stock Location: ${stockLocationId}`)

  // Get or create categories
  const productModuleService = container.resolve('product')
  const existingCats = await productModuleService.listProductCategories({}, { select: ['id', 'name'] })
  const categoryMap = new Map<string, string>()
  existingCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id))

  // Create missing categories
  const uniqueCategories = new Set(products.map(p => p.category))
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

  // Import products
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    
    try {
      logger.info(`[${i + 1}/${products.length}] Importing: ${product.title}`)

      const categoryId = categoryMap.get(product.category)

      // Build variants
      const variants = []
      
      if (product.variants && product.variants.length > 0) {
        // Group variants by option type
        const colorVariants = product.variants.filter(v => v.option_name === 'Color')
        const sizeVariants = product.variants.filter(v => v.option_name === 'Size')
        
        if (colorVariants.length > 0 && sizeVariants.length > 0) {
          // Create combination of colors and sizes
          for (const color of colorVariants) {
            for (const size of sizeVariants) {
              variants.push({
                title: `${color.title} / ${size.title}`,
                sku: `${product.sku}-${color.title.substring(0, 3).toUpperCase()}-${size.title}`,
                options: {
                  Color: color.title,
                  Size: size.title,
                },
                prices: [
                  {
                    amount: Math.round(product.price * 100), // Convert to cents
                    currency_code: 'egp',
                  },
                ],
              })
            }
          }
        } else if (colorVariants.length > 0) {
          // Only colors
          for (const color of colorVariants) {
            variants.push({
              title: color.title,
              sku: `${product.sku}-${color.title.substring(0, 3).toUpperCase()}`,
              options: {
                Color: color.title,
              },
              prices: [
                {
                  amount: Math.round(product.price * 100),
                  currency_code: 'egp',
                },
              ],
            })
          }
        } else if (sizeVariants.length > 0) {
          // Only sizes
          for (const size of sizeVariants) {
            variants.push({
              title: size.title,
              sku: `${product.sku}-${size.title}`,
              options: {
                Size: size.title,
              },
              prices: [
                {
                  amount: Math.round(product.price * 100),
                  currency_code: 'egp',
                },
              ],
            })
          }
        } else {
          // Default variant
          variants.push({
            title: 'Default',
            sku: product.sku,
            options: {},
            prices: [
              {
                amount: Math.round(product.price * 100),
                currency_code: 'egp',
              },
            ],
          })
        }
      } else {
        // No variants - create default
        variants.push({
          title: 'Default',
          sku: product.sku,
          options: {},
          prices: [
            {
              amount: Math.round(product.price * 100),
              currency_code: 'egp',
            },
          ],
        })
      }

      // Build options
      const options = []
      const colorVariants = product.variants?.filter(v => v.option_name === 'Color') || []
      const sizeVariants = product.variants?.filter(v => v.option_name === 'Size') || []
      
      if (colorVariants.length > 0) {
        options.push({
          title: 'Color',
          values: colorVariants.map(v => v.title),
        })
      }
      
      if (sizeVariants.length > 0) {
        options.push({
          title: 'Size',
          values: sizeVariants.map(v => v.title),
        })
      }

      // Create product
      const productData = {
        title: product.title,
        handle: product.handle,
        status: ProductStatus.PUBLISHED,
        description: product.description,
        category_ids: categoryId ? [categoryId] : [],
        sales_channels: [{ id: salesChannelId }],
        options: options.length > 0 ? options : undefined,
        variants,
        // Images will be added later when we have proper image handling
      }

      const { result } = await createProductsWorkflow(container).run({
        input: { products: [productData] },
      })

      const createdProduct = result[0]

      // Set inventory for all variants
      if (createdProduct.variants && createdProduct.variants.length > 0) {
        const inventoryItems = []
        
        for (const variant of createdProduct.variants) {
          if (variant.inventory_items?.[0]?.inventory_item_id) {
            inventoryItems.push({
              inventory_item_id: variant.inventory_items[0].inventory_item_id,
              location_id: stockLocationId,
              stocked_quantity: product.inventory || 100,
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
      logger.info(`   ✅ Success: ${variants.length} variants, ${product.price} EGP`)
      
    } catch (error: any) {
      errorCount++
      const errorMsg = `${product.title}: ${error.message}`
      errors.push(errorMsg)
      logger.error(`   ❌ Failed: ${errorMsg}`)
    }
  }

  logger.info('')
  logger.info('=== Import Complete ===')
  logger.info(`✅ Successfully imported: ${successCount} products`)
  
  if (errorCount > 0) {
    logger.warn(`❌ Failed: ${errorCount} products`)
    logger.warn('Errors:')
    errors.forEach(err => logger.warn(`  - ${err}`))
  }
  
  logger.info('')
  logger.info('🌐 Check products at: https://admin.mawgood.cloud')
  logger.info('🛍️ Check storefront at: https://mawgood.cloud')
}
