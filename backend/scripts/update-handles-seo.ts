/**
 * Update Product Handles to be SEO-Friendly
 * تحديث handles المنتجات لتكون صديقة لمحركات البحث
 * Format: product-name-code (e.g., قميص-بابل-محجر-esh027)
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

function createSeoHandle(title: string, code: string): string {
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
  
  const slugifiedTitle = title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .split('')
    .map(char => {
      // Keep English letters, numbers, and dashes
      if (/[a-z0-9-]/.test(char)) return char
      // Transliterate Arabic
      return arabicToLatin[char] || ''
    })
    .join('')
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
  
  return slugifiedTitle 
    ? `${slugifiedTitle}-${code.toLowerCase()}`
    : code.toLowerCase()
}

export default async function updateHandlesSeo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve('product')

  logger.info('=== 🚀 Updating Product Handles for SEO ===')
  logger.info('')

  // Get all products
  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle'],
    filters: {},
  })

  logger.info(`📊 Total products: ${products.length}`)
  logger.info('')

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      // Extract code from current handle
      const currentHandle = product.handle
      const code = currentHandle.split('-').pop() || currentHandle
      
      // Create new SEO-friendly handle
      const newHandle = createSeoHandle(product.title, code)

      // Skip if already in correct format
      if (currentHandle === newHandle) {
        logger.info(`   ⏭️  Skipped: ${product.title}`)
        logger.info(`      (already SEO-friendly: ${currentHandle})`)
        continue
      }

      // Update handle
      await productModuleService.updateProducts(product.id, {
        handle: newHandle,
      })

      successCount++
      logger.info(`   ✅ Updated: ${product.title}`)
      logger.info(`      Old: ${currentHandle}`)
      logger.info(`      New: ${newHandle}`)
    } catch (error) {
      errorCount++
      const errorMsg = `${product.title} - ${error.message}`
      errors.push(errorMsg)
      logger.error(`   ❌ ${errorMsg}`)
    }
  }

  logger.info('')
  logger.info('═══════════════════════════════════════')
  logger.info('📊 Update Summary')
  logger.info('═══════════════════════════════════════')
  logger.info(`✅ Successfully updated: ${successCount} products`)
  if (errorCount > 0) {
    logger.warn(`❌ Failed: ${errorCount} products`)
    logger.info('')
    logger.info('Failed products:')
    errors.forEach(err => logger.error(`   - ${err}`))
  }
  logger.info('')
  logger.info('🎉 Product handles updated for SEO!')
  logger.info('')
  logger.info('Example URLs:')
  logger.info('   /ar/products/قميص-بابل-محجر-esh027')
  logger.info('   /ar/products/بوليفار-قطن-تلبيس-أوفر-سايز-hix001')
  logger.info('═══════════════════════════════════════')
}
