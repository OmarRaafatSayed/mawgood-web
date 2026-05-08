/**
 * Import data from a JSON export file into the production Medusa database.
 * Run this on the Hostinger VPS AFTER running db:migrate and seed (for base config).
 *
 * Run on production VPS:
 *   NODE_ENV=production npx medusa exec ./scripts/import-data-from-export.ts
 *
 * The export file must be at: <project-root>/scripts/mawgood-data-export.json
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import {
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from '@medusajs/medusa/core-flows'
import * as fs from 'fs'
import * as path from 'path'

export default async function importDataFromExport({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Starting Data Import from Export File ===')

  // ─── Load export file ─────────────────────────────────────────────────────
  const exportFile = path.join(__dirname, '..', '..', 'scripts', 'mawgood-data-export.json')

  if (!fs.existsSync(exportFile)) {
    logger.error(`Export file not found: ${exportFile}`)
    logger.error('Run export-data-for-migration.ts locally first, then copy the JSON file to the VPS.')
    return
  }

  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf-8'))
  logger.info(`Loaded export from: ${exportData.exportedAt}`)
  logger.info(`Products: ${exportData.products?.length || 0}`)
  logger.info(`Categories: ${exportData.categories?.length || 0}`)
  logger.info('')

  // ─── 1. Get production Sales Channel ─────────────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannelId = salesChannels[0]?.id || null
  logger.info(`Sales Channel: ${salesChannelId || 'none'}`)

  // ─── 2. Get production Stock Location ────────────────────────────────────
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id || null
  logger.info(`Stock Location: ${stockLocationId || 'none'}`)

  // ─── 3. Get production Seller ─────────────────────────────────────────────
  let activeSeller: any = null
  try {
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'store_status'],
      filters: {},
    })
    activeSeller = sellers.find((s: any) => s.store_status === 'ACTIVE') || sellers[0]
    if (activeSeller) logger.info(`Seller: ${activeSeller.name} (${activeSeller.id})`)
  } catch {
    logger.warn('No seller found - products will be created without seller')
  }

  // ─── 4. Create/map categories ─────────────────────────────────────────────
  logger.info('')
  logger.info('Setting up categories...')
  const productService = container.resolve('product')
  const existingCats = await productService.listProductCategories({}, { select: ['id', 'name', 'handle'] })
  const categoryHandleToId = new Map<string, string>()
  const categoryNameToId = new Map<string, string>()
  existingCats.forEach((c: any) => {
    categoryHandleToId.set(c.handle, c.id)
    categoryNameToId.set(c.name, c.id)
  })

  // Create missing categories from export
  const exportedCategories: any[] = exportData.categories || []
  for (const cat of exportedCategories) {
    if (!categoryHandleToId.has(cat.handle) && !categoryNameToId.has(cat.name)) {
      try {
        const [newCat] = await productService.createProductCategories([{
          name: cat.name,
          handle: cat.handle,
          is_active: cat.is_active ?? true,
          is_internal: cat.is_internal ?? false,
        }])
        categoryHandleToId.set(newCat.handle, newCat.id)
        categoryNameToId.set(newCat.name, newCat.id)
        logger.info(`  Created category: ${cat.name}`)
      } catch (err: any) {
        logger.warn(`  Category "${cat.name}" skipped: ${err.message}`)
      }
    }
  }

  // ─── 5. Check existing products (avoid duplicates by handle) ─────────────
  logger.info('')
  logger.info('Checking existing products...')
  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle'],
    filters: {},
    pagination: { take: 10000 },
  })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))
  logger.info(`  Existing products in production: ${existingHandles.size}`)

  // ─── 6. Import products ───────────────────────────────────────────────────
  logger.info('')
  logger.info('Importing products...')

  const productsToImport = (exportData.products || []).filter(
    (p: any) => !existingHandles.has(p.handle)
  )
  const skippedCount = (exportData.products?.length || 0) - productsToImport.length

  if (skippedCount > 0) {
    logger.info(`  Skipping ${skippedCount} already-existing products (by handle)`)
  }
  logger.info(`  Importing ${productsToImport.length} new products...`)

  const BATCH_SIZE = 5
  let successCount = 0
  let errorCount = 0
  const createdProductIds: string[] = []

  for (let i = 0; i < productsToImport.length; i += BATCH_SIZE) {
    const batch = productsToImport.slice(i, i + BATCH_SIZE)

    const medusaProducts = batch.map((p: any) => {
      // Rebuild clean product input (strip server-side IDs)
      const product: any = {
        title: p.title,
        handle: p.handle,
        description: p.description || '',
        subtitle: p.subtitle || '',
        status: p.status || ProductStatus.PUBLISHED,
        thumbnail: p.thumbnail || '',
        discountable: p.discountable ?? true,
        metadata: p.metadata || {},
        images: (p.images || []).map((img: any) => ({ url: img.url })),
        options: (p.options || []).map((opt: any) => ({
          title: opt.title,
          values: (opt.values || []).map((v: any) => (typeof v === 'string' ? v : v.value)),
        })),
        variants: (p.variants || []).map((v: any) => ({
          title: v.title,
          sku: v.sku || undefined,
          allow_backorder: v.allow_backorder ?? false,
          manage_inventory: v.manage_inventory ?? true,
          prices: (v.prices || []).map((pr: any) => ({
            currency_code: pr.currency_code,
            amount: pr.amount,
          })),
          options: v.options
            ? Object.fromEntries(
                Object.entries(v.options).map(([k, val]: [string, any]) => [
                  k,
                  typeof val === 'string' ? val : val?.value || val,
                ])
              )
            : {},
        })),
      }

      // Attach categories
      const productCategoryIds: string[] = []
      for (const cat of p.categories || []) {
        const catId =
          categoryHandleToId.get(cat.handle) ||
          categoryNameToId.get(cat.name)
        if (catId) productCategoryIds.push(catId)
      }
      if (productCategoryIds.length > 0) {
        product.categories = productCategoryIds.map((id) => ({ id }))
      }

      // Attach sales channel
      if (salesChannelId) {
        product.sales_channels = [{ id: salesChannelId }]
      }

      return product
    })

    try {
      const workflowInput: any = { products: medusaProducts }
      if (activeSeller) {
        workflowInput.additional_data = { seller_id: activeSeller.id }
      }

      const { result } = await createProductsWorkflow(container).run({
        input: workflowInput,
      })

      successCount += result.length
      result.forEach((p: any) => createdProductIds.push(p.id))
      logger.info(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ✅ ${result.length} products`)
    } catch (err: any) {
      errorCount += batch.length
      logger.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ❌ ${err.message}`)
      batch.forEach((p: any) => logger.error(`    - ${p.handle}: ${p.title}`))
    }
  }

  // ─── 7. Set inventory levels ──────────────────────────────────────────────
  if (stockLocationId && createdProductIds.length > 0) {
    logger.info('')
    logger.info('Setting inventory levels (300 units per variant)...')
    try {
      const { data: inventoryItems } = await query.graph({
        entity: 'inventory_item',
        fields: ['id'],
        filters: {},
        pagination: { take: 10000 },
      })

      const levels = inventoryItems.map((item: any) => ({
        inventory_item_id: item.id,
        location_id: stockLocationId,
        stocked_quantity: 300,
      }))

      for (let i = 0; i < levels.length; i += 50) {
        try {
          await createInventoryLevelsWorkflow(container).run({
            input: { inventory_levels: levels.slice(i, i + 50) },
          })
        } catch {
          // Some may already exist
        }
      }
      logger.info(`  Set inventory for ${inventoryItems.length} items`)
    } catch (err: any) {
      logger.warn(`  Inventory setup warning: ${err.message}`)
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  logger.info('')
  logger.info('=== Import Complete ===')
  logger.info(`✅ Imported:  ${successCount} products`)
  logger.info(`⏭️  Skipped:   ${skippedCount} (already existed)`)
  if (errorCount > 0) logger.warn(`❌ Failed:    ${errorCount} products`)
  logger.info('')
  logger.info('Run visibility fix if needed:')
  logger.info('  NODE_ENV=production npx medusa exec ./scripts/fix-excel-products-visibility.ts')
  logger.info('')
  logger.info('Then restart the backend:')
  logger.info('  pm2 restart mawgood-backend')
}
