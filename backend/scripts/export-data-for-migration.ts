/**
 * Export all local data (products, categories, regions, store, sellers)
 * to a JSON file that can be imported on the production server.
 *
 * Run locally:
 *   npx medusa exec ./scripts/export-data-for-migration.ts
 *
 * Output: <project-root>/scripts/mawgood-data-export.json
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import * as fs from 'fs'
import * as path from 'path'

export default async function exportDataForMigration({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Starting Data Export ===')

  const exportData: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }

  // ─── 1. Products (with variants, options, images, categories) ────────────
  logger.info('Exporting products...')
  try {
    const { data: products } = await query.graph({
      entity: 'product',
      fields: [
        'id', 'title', 'handle', 'description', 'subtitle',
        'status', 'thumbnail', 'discountable', 'metadata',
        'images.*',
        'options.*', 'options.values.*',
        'variants.*', 'variants.prices.*', 'variants.options.*',
        'categories.*',
        'collection.*',
      ],
      filters: {},
      pagination: { take: 10000 },
    })
    exportData.products = products
    logger.info(`  → Exported ${products.length} products`)
  } catch (err: any) {
    logger.error(`  Products export failed: ${err.message}`)
    exportData.products = []
  }

  // ─── 2. Product Categories ────────────────────────────────────────────────
  logger.info('Exporting categories...')
  try {
    const productService = container.resolve('product')
    const categories = await productService.listProductCategories(
      {},
      { select: ['id', 'name', 'handle', 'is_active', 'is_internal', 'rank', 'parent_category_id'] }
    )
    exportData.categories = categories
    logger.info(`  → Exported ${categories.length} categories`)
  } catch (err: any) {
    logger.error(`  Categories export failed: ${err.message}`)
    exportData.categories = []
  }

  // ─── 3. Regions ───────────────────────────────────────────────────────────
  logger.info('Exporting regions...')
  try {
    const { data: regions } = await query.graph({
      entity: 'region',
      fields: ['id', 'name', 'currency_code', 'countries.*'],
      filters: {},
    })
    exportData.regions = regions
    logger.info(`  → Exported ${regions.length} regions`)
  } catch (err: any) {
    logger.error(`  Regions export failed: ${err.message}`)
    exportData.regions = []
  }

  // ─── 4. Sales Channels ────────────────────────────────────────────────────
  logger.info('Exporting sales channels...')
  try {
    const { data: salesChannels } = await query.graph({
      entity: 'sales_channel',
      fields: ['id', 'name', 'description', 'is_disabled'],
      filters: {},
    })
    exportData.salesChannels = salesChannels
    logger.info(`  → Exported ${salesChannels.length} sales channels`)
  } catch (err: any) {
    logger.error(`  Sales channels export failed: ${err.message}`)
    exportData.salesChannels = []
  }

  // ─── 5. Sellers ───────────────────────────────────────────────────────────
  logger.info('Exporting sellers...')
  try {
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'description', 'store_status', 'metadata'],
      filters: {},
    })
    exportData.sellers = sellers
    logger.info(`  → Exported ${sellers.length} sellers`)
  } catch (err: any) {
    logger.warn(`  Sellers export skipped: ${err.message}`)
    exportData.sellers = []
  }

  // ─── 6. Stock Locations ───────────────────────────────────────────────────
  logger.info('Exporting stock locations...')
  try {
    const { data: stockLocations } = await query.graph({
      entity: 'stock_location',
      fields: ['id', 'name', 'address.*'],
      filters: {},
    })
    exportData.stockLocations = stockLocations
    logger.info(`  → Exported ${stockLocations.length} stock locations`)
  } catch (err: any) {
    logger.warn(`  Stock locations export skipped: ${err.message}`)
    exportData.stockLocations = []
  }

  // ─── 7. Inventory Items & Levels ─────────────────────────────────────────
  logger.info('Exporting inventory...')
  try {
    const { data: inventoryItems } = await query.graph({
      entity: 'inventory_item',
      fields: ['id', 'sku', 'title', 'description', 'requires_shipping', 'metadata'],
      filters: {},
      pagination: { take: 10000 },
    })
    exportData.inventoryItems = inventoryItems
    logger.info(`  → Exported ${inventoryItems.length} inventory items`)
  } catch (err: any) {
    logger.warn(`  Inventory export skipped: ${err.message}`)
    exportData.inventoryItems = []
  }

  // ─── 8. Store Config ──────────────────────────────────────────────────────
  logger.info('Exporting store config...')
  try {
    const { data: stores } = await query.graph({
      entity: 'store',
      fields: ['id', 'name', 'default_currency_code', 'supported_currencies.*', 'default_region_id'],
      filters: {},
    })
    exportData.store = stores[0] || null
    logger.info(`  → Exported store: ${stores[0]?.name || 'none'}`)
  } catch (err: any) {
    logger.warn(`  Store export skipped: ${err.message}`)
    exportData.store = null
  }

  // ─── 9. Publishable API Keys ──────────────────────────────────────────────
  logger.info('Exporting API keys...')
  try {
    const { data: apiKeys } = await query.graph({
      entity: 'api_key',
      fields: ['id', 'title', 'type', 'token'],
      filters: { type: 'publishable' },
    })
    exportData.apiKeys = apiKeys
    logger.info(`  → Exported ${apiKeys.length} publishable API keys`)
  } catch (err: any) {
    logger.warn(`  API keys export skipped: ${err.message}`)
    exportData.apiKeys = []
  }

  // ─── Write to file ────────────────────────────────────────────────────────
  const outputDir = path.join(__dirname, '..', '..', 'scripts')
  const outputFile = path.join(outputDir, 'mawgood-data-export.json')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2), 'utf-8')

  const fileSizeKB = Math.round(fs.statSync(outputFile).size / 1024)

  logger.info('')
  logger.info('=== Export Complete ===')
  logger.info(`📁 Output file: ${outputFile}`)
  logger.info(`📦 File size: ${fileSizeKB} KB`)
  logger.info('')
  logger.info('Summary:')
  logger.info(`  Products:        ${exportData.products?.length || 0}`)
  logger.info(`  Categories:      ${exportData.categories?.length || 0}`)
  logger.info(`  Regions:         ${exportData.regions?.length || 0}`)
  logger.info(`  Sales Channels:  ${exportData.salesChannels?.length || 0}`)
  logger.info(`  Sellers:         ${exportData.sellers?.length || 0}`)
  logger.info(`  Stock Locations: ${exportData.stockLocations?.length || 0}`)
  logger.info(`  Inventory Items: ${exportData.inventoryItems?.length || 0}`)
  logger.info('')
  logger.info('Next steps:')
  logger.info('  1. Copy scripts/mawgood-data-export.json to your VPS')
  logger.info('  2. On VPS: npx medusa exec ./scripts/import-data-from-export.ts')
}
