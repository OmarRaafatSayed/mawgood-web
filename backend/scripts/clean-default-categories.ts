/**
 * Clean Default/Fake Categories
 * يمسح كل الفئات الافتراضية ويبقي فقط فئات المنتجات الحقيقية
 *
 * Run: npx medusa exec ./src/scripts/clean-default-categories.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

// الفئات الحقيقية اللي جاية من Excel - هي اللي هتبقى
const REAL_CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Dresses',
  'Pants',
  'Jackets',
  'Blouses',
  'Skirts',
  'Shorts',
  'Suits',
  'General',
]

export default async function cleanDefaultCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve('product')

  logger.info('=== Cleaning Default/Fake Categories ===')

  // Get all categories
  const allCategories = await productModuleService.listProductCategories(
    {},
    { select: ['id', 'name', 'handle'] }
  )

  logger.info(`Found ${allCategories.length} total categories:`)
  allCategories.forEach((cat: any) => logger.info(`  - ${cat.name} (${cat.handle})`))

  // Separate real from fake
  const realCategoryNames = REAL_CATEGORIES.map(n => n.toLowerCase())
  
  const toDelete = allCategories.filter((cat: any) => {
    const nameLower = cat.name.toLowerCase()
    return !realCategoryNames.includes(nameLower)
  })

  const toKeep = allCategories.filter((cat: any) => {
    const nameLower = cat.name.toLowerCase()
    return realCategoryNames.includes(nameLower)
  })

  logger.info(`\nCategories to KEEP (${toKeep.length}):`)
  toKeep.forEach((cat: any) => logger.info(`  ✅ ${cat.name}`))

  logger.info(`\nCategories to DELETE (${toDelete.length}):`)
  toDelete.forEach((cat: any) => logger.info(`  ❌ ${cat.name}`))

  if (toDelete.length === 0) {
    logger.info('\nNo categories to delete!')
    return
  }

  // Delete fake categories
  let deletedCount = 0
  let errorCount = 0

  for (const cat of toDelete) {
    try {
      // First check if any products are using this category
      const products = await productModuleService.listProducts(
        { categories: { id: [cat.id] } },
        { select: ['id', 'title'] }
      )

      if (products.length > 0) {
        logger.warn(`  ⚠️  Category "${cat.name}" has ${products.length} products - skipping`)
        continue
      }

      await productModuleService.deleteProductCategories([cat.id])
      deletedCount++
      logger.info(`  🗑️  Deleted: ${cat.name}`)
    } catch (err: any) {
      errorCount++
      logger.error(`  ❌ Failed to delete "${cat.name}": ${err.message}`)
    }
  }

  logger.info(`\n=== Done ===`)
  logger.info(`✅ Deleted: ${deletedCount} categories`)
  if (errorCount > 0) logger.warn(`❌ Errors: ${errorCount}`)
  logger.info(`📋 Remaining categories: ${toKeep.length + (toDelete.length - deletedCount - errorCount)}`)
}
