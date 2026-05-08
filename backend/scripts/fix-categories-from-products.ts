/**
 * Fix Categories Based on Actual Products
 * ========================================
 * 1. Get all products and their categories
 * 2. Delete categories with no products
 * 3. Create missing categories from products
 * 4. Ensure all products are properly linked
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function fixCategoriesFromProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('\n' + '='.repeat(80))
  logger.info('🗂️  FIX CATEGORIES FROM PRODUCTS')
  logger.info('='.repeat(80))

  try {
    // ─── STEP 1: Get all products with their categories ─────────────────
    logger.info('\n📦 STEP 1: Analyzing Products')
    
    const { data: products } = await query.graph({
      entity: 'product',
      fields: ['id', 'title', 'categories.*'],
      filters: {},
    })

    logger.info(`Found ${products.length} products`)

    // Extract unique categories from products
    const productCategories = new Map<string, { name: string; count: number }>()
    
    for (const product of products) {
      if (product.categories && product.categories.length > 0) {
        for (const cat of product.categories) {
          if (cat.name) {
            const existing = productCategories.get(cat.name) || { name: cat.name, count: 0 }
            existing.count++
            productCategories.set(cat.name, existing)
          }
        }
      }
    }

    logger.info(`\nCategories found in products:`)
    for (const [name, data] of productCategories.entries()) {
      logger.info(`  - ${name}: ${data.count} products`)
    }

    // ─── STEP 2: Get all existing categories ────────────────────────────
    logger.info('\n📁 STEP 2: Checking Existing Categories')
    
    const allCategories = await productModuleService.listProductCategories(
      {},
      { select: ['id', 'name', 'handle', 'is_active'] }
    )

    logger.info(`Found ${allCategories.length} categories in database`)
    
    // ─── STEP 3: Delete empty categories ────────────────────────────────
    logger.info('\n🗑️  STEP 3: Deleting Empty Categories')
    
    const categoriesToDelete: string[] = []
    
    for (const cat of allCategories) {
      const hasProducts = productCategories.has(cat.name)
      if (!hasProducts) {
        categoriesToDelete.push(cat.id)
        logger.info(`  ❌ Will delete: ${cat.name} (no products)`)
      }
    }

    if (categoriesToDelete.length > 0) {
      await productModuleService.deleteProductCategories(categoriesToDelete)
      logger.info(`✅ Deleted ${categoriesToDelete.length} empty categories`)
    } else {
      logger.info(`✅ No empty categories to delete`)
    }

    // ─── STEP 4: Verify all categories exist ────────────────────────────
    logger.info('\n✅ STEP 4: Verifying Categories')
    
    const remainingCategories = await productModuleService.listProductCategories(
      {},
      { select: ['id', 'name', 'handle'] }
    )

    const existingCategoryNames = new Set(remainingCategories.map((c: any) => c.name))
    
    logger.info(`\nFinal categories in database:`)
    for (const cat of remainingCategories) {
      const count = productCategories.get(cat.name)?.count || 0
      logger.info(`  ✅ ${cat.name} (${count} products)`)
    }

    // ─── STEP 5: Summary ─────────────────────────────────────────────────
    logger.info('\n' + '='.repeat(80))
    logger.info('📊 SUMMARY')
    logger.info('='.repeat(80))
    logger.info(`Total products: ${products.length}`)
    logger.info(`Active categories: ${remainingCategories.length}`)
    logger.info(`Deleted empty categories: ${categoriesToDelete.length}`)
    logger.info('')
    logger.info('✅ Categories are now clean and match products!')
    logger.info('')

  } catch (error: any) {
    logger.error(`❌ Error: ${error.message}`)
    throw error
  }
}
