/**
 * Fix Excel Products Visibility in Storefront
 * يضمن إن كل المنتجات المستوردة من Excel تظهر في الـ Storefront
 *
 * Run: npx medusa exec ./src/scripts/fix-excel-products-visibility.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows'

export default async function fixExcelProductsVisibility({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info('=== Fixing Excel Products Storefront Visibility ===')

  // ─── 1. Get Sales Channel ───────────────────────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: {},
  })
  const salesChannel = salesChannels[0]
  if (!salesChannel) {
    logger.error('No sales channel found! Please run the seed script first.')
    return
  }
  logger.info(`Sales Channel: ${salesChannel.name} (${salesChannel.id})`)

  // ─── 2. Get Region ──────────────────────────────────────────────────────
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
    filters: {},
  })
  logger.info(`Available regions: ${regions.map((r: any) => `${r.name}(${r.currency_code})`).join(', ')}`)

  const region =
    regions.find((r: any) => r.name?.toLowerCase().includes('egypt')) ||
    regions.find((r: any) => r.name?.toLowerCase().includes('arab')) ||
    regions[0]

  if (!region) {
    logger.error('No region found! Please run the seed script first.')
    return
  }
  logger.info(`Using Region: ${region.name} (${region.id}) - Currency: ${region.currency_code}`)

  // ─── 3. Get all Excel-imported products ─────────────────────────────────
  const { data: allProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'status', 'metadata', 'variants.id', 'variants.title'],
    filters: {},
  })

  const excelProducts = allProducts.filter(
    (p: any) => p.metadata?.imported_from === 'excel'
  )

  logger.info(`Found ${excelProducts.length} Excel-imported products (out of ${allProducts.length} total)`)

  if (excelProducts.length === 0) {
    logger.warn('No Excel products found. Run import-excel-products script first.')
    return
  }

  // ─── 4. Publish all products ─────────────────────────────────────────────
  logger.info('Publishing all Excel products...')
  let publishedCount = 0

  for (const product of excelProducts) {
    if (product.status !== ProductStatus.PUBLISHED) {
      try {
        await updateProductsWorkflow(container).run({
          input: {
            products: [{ id: product.id, status: ProductStatus.PUBLISHED }],
          },
        })
        publishedCount++
      } catch (err: any) {
        logger.warn(`Could not publish ${product.title}: ${err.message}`)
      }
    }
  }
  logger.info(`Published ${publishedCount} products (rest were already published)`)

  // ─── 5. Link products to Sales Channel ──────────────────────────────────
  logger.info('Linking products to Sales Channel...')

  const { data: productsWithChannels } = await query.graph({
    entity: 'product',
    fields: ['id', 'sales_channels.id'],
    filters: { id: excelProducts.map((p: any) => p.id) },
  })

  const linkedProductIds = new Set(
    productsWithChannels
      .filter((p: any) => p.sales_channels?.some((sc: any) => sc.id === salesChannel.id))
      .map((p: any) => p.id)
  )

  const productsToLink = excelProducts.filter((p: any) => !linkedProductIds.has(p.id))

  if (productsToLink.length > 0) {
    const links = productsToLink.map((p: any) => ({
      [Modules.PRODUCT]: { product_id: p.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }))

    try {
      await link.create(links)
      logger.info(`Linked ${links.length} products to sales channel`)
    } catch (err: any) {
      logger.warn(`Sales channel linking: ${err.message}`)
    }
  } else {
    logger.info('All products already linked to sales channel')
  }

  // ─── 6. Add region prices to variants ───────────────────────────────────
  logger.info('Adding region prices to variants...')
  let priceUpdateCount = 0
  const currencyCode = region.currency_code || 'egp'

  for (const product of excelProducts) {
    if (!product.variants?.length) continue

    try {
      // Get variant prices via separate query
      const { data: variantData } = await query.graph({
        entity: 'product_variant',
        fields: ['id', 'prices.amount', 'prices.currency_code'],
        filters: { product_id: product.id },
      })

      const variantUpdates: any[] = []

      for (const variant of variantData) {
        const egpPrice = (variant as any).prices?.find(
          (p: any) => p.currency_code === 'egp' || p.currency_code === currencyCode
        )
        const amount = egpPrice?.amount

        if (amount && amount > 0) {
          variantUpdates.push({
            id: variant.id,
            prices: [
              {
                currency_code: currencyCode,
                amount: amount,
                region_id: region.id,
              },
              {
                currency_code: 'egp',
                amount: amount,
              },
            ],
          })
        }
      }

      if (variantUpdates.length > 0) {
        await updateProductsWorkflow(container).run({
          input: {
            products: [{ id: product.id, variants: variantUpdates }],
          },
        })
        priceUpdateCount += variantUpdates.length
      }
    } catch (err: any) {
      logger.warn(`Price update for "${product.title}": ${err.message}`)
    }
  }
  logger.info(`Updated prices for ${priceUpdateCount} variants`)

  // ─── 7. Set up inventory levels ─────────────────────────────────────────
  logger.info('Setting up inventory levels...')

  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: {},
  })
  const stockLocationId = stockLocations[0]?.id

  if (stockLocationId) {
    try {
      const inventoryService = container.resolve(Modules.INVENTORY)

      const { data: existingLevels } = await query.graph({
        entity: 'inventory_level',
        fields: ['inventory_item_id'],
        filters: { location_id: stockLocationId },
      })

      const existingItemIds = new Set(existingLevels.map((l: any) => l.inventory_item_id))

      const { data: inventoryItems } = await query.graph({
        entity: 'inventory_item',
        fields: ['id'],
        filters: {},
      })

      const itemsWithoutLevels = inventoryItems.filter((i: any) => !existingItemIds.has(i.id))

      if (itemsWithoutLevels.length > 0) {
        for (const item of itemsWithoutLevels) {
          try {
            await inventoryService.createInventoryLevels([{
              inventory_item_id: item.id,
              location_id: stockLocationId,
              stocked_quantity: 300,
            }])
          } catch (e: any) {
            // Skip if already exists
          }
        }
        logger.info(`Created inventory levels for ${itemsWithoutLevels.length} items (300 units each)`)
      } else {
        logger.info('All inventory levels already set')
      }
    } catch (err: any) {
      logger.warn(`Inventory setup: ${err.message}`)
    }
  } else {
    logger.warn('No stock location found - inventory levels not set')
  }

  // ─── 8. Summary ─────────────────────────────────────────────────────────
  logger.info('')
  logger.info('=== Visibility Fix Complete ===')
  logger.info(`✅ Products processed: ${excelProducts.length}`)
  logger.info(`✅ Published: ${publishedCount} (newly published)`)
  logger.info(`✅ Linked to sales channel: ${productsToLink.length}`)
  logger.info(`✅ Price variants updated: ${priceUpdateCount}`)
  logger.info('')
  logger.info('🌐 Check your storefront at: http://localhost:3000/eg')
  logger.info('📋 Or check products at: http://localhost:3000/eg/products')
  logger.info('')
  logger.info('⚠️  If products still not showing, check:')
  logger.info('   1. Backend is running: http://localhost:9000')
  logger.info('   2. Storefront is running: http://localhost:3000')
  logger.info('   3. Admin Panel → Products → verify Status = Published')
  logger.info('   4. Admin Panel → Products → verify Price in Region: Arab Countries')
}
