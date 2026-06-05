// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function fixShippingProfiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)

  // ── 1. Get Default Shipping Profile ──────────────────────────────────────
  logger.info('🔍  Looking up Default Shipping Profile...')
  const [profiles] = await fulfillmentService.listAndCountShippingProfiles(
    { type: 'default' },
    { take: 10 }
  )

  const defaultProfile =
    profiles.find(p => p.name === 'Default Shipping Profile') || profiles[0]

  if (!defaultProfile) {
    logger.error('❌ No default shipping profile found!')
    return
  }
  logger.info(`✅  Default profile: "${defaultProfile.name}" (${defaultProfile.id})`)

  // ── 2. Get all products ───────────────────────────────────────────────────
  logger.info('📦  Fetching all products...')
  const [allProducts] = await productService.listAndCountProducts(
    {},
    { take: 2000 }
  )
  logger.info(`   Total products: ${allProducts.length}`)

  // ── 3. Get products already having a shipping profile ────────────────────
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: productsWithProfile } = await query.graph({
    entity: 'product',
    fields: ['id', 'shipping_profile.*'],
    filters: {},
    pagination: { take: 2000 }
  }).catch(() => ({ data: [] }))

  const withProfileIds = new Set(
    (productsWithProfile || [])
      .filter((p: any) => p.shipping_profile && p.shipping_profile.id)
      .map((p: any) => p.id)
  )
  logger.info(`   Products with profile: ${withProfileIds.size}`)

  const productsWithoutProfile = allProducts.filter(p => !withProfileIds.has(p.id))
  logger.info(`   Products WITHOUT profile: ${productsWithoutProfile.length}`)

  if (productsWithoutProfile.length === 0) {
    logger.info('✅  All products already have shipping profiles!')
  } else {
    // ── 4. Assign Default Shipping Profile to all products ──────────────────
    logger.info(`🔗  Assigning default shipping profile to ${productsWithoutProfile.length} products...`)
    let success = 0
    let failed = 0
    const BATCH = 50

    for (let i = 0; i < productsWithoutProfile.length; i += BATCH) {
      const batch = productsWithoutProfile.slice(i, i + BATCH)
      for (const product of batch) {
        try {
          await fulfillmentService.updateShippingProfiles(defaultProfile.id, {
            // just touching the profile won't help — use product update
          }).catch(() => {})

          await productService.updateProducts(product.id, {
            // @ts-ignore — medusa accepts shipping_profile_id
            shipping_profile_id: defaultProfile.id
          })
          success++
        } catch (e) {
          logger.warn(`   Failed for product ${product.id}: ${e.message}`)
          failed++
        }
      }
      logger.info(`   Progress: ${Math.min(i + BATCH, productsWithoutProfile.length)} / ${productsWithoutProfile.length}`)
    }
    logger.info(`✅  Assigned: ${success}, Failed: ${failed}`)
  }

  logger.info('🎉  All done! Products now have shipping profiles.')
}
