// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function resetCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)

  logger.info("🗑️  Fetching all existing categories...")

  // Get all categories
  const [categories] = await productService.listAndCountProductCategories(
    {},
    { take: 1000 }
  )
  logger.info(`   Found ${categories.length} categories`)

  // Get all products
  const [products] = await productService.listAndCountProducts(
    {},
    { relations: ['categories'], take: 2000 }
  )
  logger.info(`   Found ${products.length} products`)

  // Remove all category assignments from products first
  logger.info("🔗  Removing all category assignments from products...")
  for (const product of products) {
    if (product.categories && product.categories.length > 0) {
      await productService.updateProducts(product.id, {
        categories: []
      })
    }
  }
  logger.info("   Done removing assignments")

  // Delete all existing categories (children first, then parents)
  logger.info("🗑️  Deleting all existing categories...")
  // Delete children first (those with parent_category_id)
  const children = categories.filter(c => c.parent_category_id)
  const parents = categories.filter(c => !c.parent_category_id)

  for (const cat of children) {
    try {
      await productService.deleteProductCategories(cat.id)
    } catch (e) {
      logger.warn(`   Could not delete child category ${cat.id}: ${e.message}`)
    }
  }
  for (const cat of parents) {
    try {
      await productService.deleteProductCategories(cat.id)
    } catch (e) {
      logger.warn(`   Could not delete parent category ${cat.id}: ${e.message}`)
    }
  }
  logger.info("   Done deleting categories")

  // Create single "الملابس" category
  logger.info("✨  Creating new category: الملابس...")
  const newCategory = await productService.createProductCategories({
    name: "الملابس",
    handle: "al-malabes",
    is_active: true,
    is_internal: false,
    description: "جميع أنواع الملابس"
  })
  logger.info(`   Created: ${newCategory.name} (${newCategory.id})`)

  // Assign all products to new category
  logger.info(`🔗  Assigning all ${products.length} products to الملابس...`)
  let success = 0
  let failed = 0
  for (const product of products) {
    try {
      await productService.updateProducts(product.id, {
        categories: [{ id: newCategory.id }]
      })
      success++
    } catch (e) {
      logger.warn(`   Could not assign product ${product.id}: ${e.message}`)
      failed++
    }
  }

  logger.info(`✅  Done!`)
  logger.info(`   Category: الملابس (handle: al-malabes)`)
  logger.info(`   Products assigned: ${success}`)
  if (failed > 0) logger.warn(`   Failed: ${failed}`)
}
