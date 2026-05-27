import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { createDefaultStoreShipping } from './fix-shipping'

import {
  createAdminUser,
  createConfigurationRules,
  createDefaultCommissionLevel,
  createInventoryItemStockLevels,
  createProductCategories,
  createProductCollections,
  createPublishableKey,
  createRegions,
  createSalesChannel,
  createSeller,
  createSellerProducts,
  createSellerShippingOption,
  createSellerStockLocation,
  createServiceZoneForFulfillmentSet,
  createStore,
} from './seed/seed-functions'

// ─── Pre-flight checks ───────────────────────────────────────────────────────

function validateSeedEnv(): void {
  const required = [
    'SEED_ADMIN_EMAIL',
    'SEED_ADMIN_PASSWORD',
    'SEED_SELLER_EMAIL',
    'SEED_SELLER_PASSWORD',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════╗')
    console.error('║  SEED ABORTED — missing required environment variables  ║')
    console.error('╚══════════════════════════════════════════════════════╝\n')
    console.error('Add these to your .env file before running the seed:\n')
    missing.forEach((key) => console.error(`  ${key}=`))
    console.error(
      '\nExample:\n' +
      '  SEED_ADMIN_EMAIL=admin@mawgood.cloud\n' +
      '  SEED_ADMIN_PASSWORD=MyStr0ng!Pass#2024\n' +
      '  SEED_SELLER_EMAIL=seller@mawgood.cloud\n' +
      '  SEED_SELLER_PASSWORD=AnotherStr0ng!Pass#2024\n'
    )
    process.exit(1)
  }

  // Reject placeholder / weak passwords
  const weakValues = ['supersecret', 'secret', 'password', '12345678', 'changeme']
  const weak = [
    { key: 'SEED_ADMIN_PASSWORD',  val: process.env.SEED_ADMIN_PASSWORD! },
    { key: 'SEED_SELLER_PASSWORD', val: process.env.SEED_SELLER_PASSWORD! },
  ].filter(({ val }) => weakValues.some((w) => val.toLowerCase().includes(w)))

  if (weak.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('\n[seed] ABORTED — weak password detected in production:')
    weak.forEach(({ key }) => console.error(`  ${key} contains a common/weak value`))
    process.exit(1)
  }
}

// ─── Migration check ─────────────────────────────────────────────────────────

async function checkMigrations(container: any, logger: any): Promise<void> {
  try {
    // Resolve the raw pg client via Medusa's DB connection
    const pgConnection = container.resolve('__pg_connection__')

    if (!pgConnection) {
      logger.warn('[seed] Could not resolve pg connection — skipping migration check')
      return
    }

    // Check if the core migrations table exists
    const result = await pgConnection.raw(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'mikro_orm_migrations'
    `)

    const count = parseInt(result.rows?.[0]?.count ?? '0', 10)

    if (count === 0) {
      logger.error(
        '[seed] ABORTED — migrations table not found.\n' +
        'Run migrations first:\n' +
        '  yarn db:migrate   (or: medusa db:migrate)'
      )
      process.exit(1)
    }

    logger.info(`[seed] Migration check passed (${count} migration entries found)`)
  } catch (err: any) {
    // If the resolver doesn't exist in this Medusa version, skip gracefully
    logger.warn(`[seed] Migration check skipped: ${err.message}`)
  }
}

// ─── Main seed ───────────────────────────────────────────────────────────────

export default async function seedMarketplaceData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // 1. Validate env vars before touching the database
  validateSeedEnv()

  // 2. Confirm migrations are applied
  await checkMigrations(container, logger)

  logger.info('=== Configurations ===')

  logger.info('Creating admin user...')
  await createAdminUser(container)

  logger.info('Creating default sales channel...')
  const salesChannel = await createSalesChannel(container)

  logger.info('Creating default regions...')
  const region = await createRegions(container)

  logger.info('Creating publishable api key...')
  const apiKey = await createPublishableKey(container, salesChannel.id)

  logger.info('Creating store data...')
  await createStore(container, salesChannel.id, region.id)

  logger.info('Creating configuration rules...')
  await createConfigurationRules(container)

  logger.info('=== Example data ===')

  logger.info('Creating product categories...')
  await createProductCategories(container)

  logger.info('Creating product collections...')
  await createProductCollections(container)

  logger.info('Creating seller...')
  const seller = await createSeller(container)

  logger.info('Creating seller stock location...')
  const stockLocation = await createSellerStockLocation(
    container,
    seller.id,
    salesChannel.id
  )

  logger.info('Creating service zone...')
  const serviceZone = await createServiceZoneForFulfillmentSet(
    container,
    seller.id,
    stockLocation.fulfillment_sets[0].id
  )

  logger.info('Creating seller shipping option...')
  await createSellerShippingOption(
    container,
    seller.id,
    seller.name,
    region.id,
    serviceZone.id
  )

  logger.info('Creating seller products...')
  await createSellerProducts(container, seller.id, salesChannel.id)

  logger.info('Creating inventory levels...')
  await createInventoryItemStockLevels(container, stockLocation.id)

  logger.info('Creating default commission...')
  await createDefaultCommissionLevel(container)

  logger.info('Creating default store shipping...')
  await createDefaultStoreShipping(container)

  // ── Summary — credentials printed once, passwords NEVER logged ────────────
  logger.info('=== Seed complete ===')
  logger.info(`Publishable API key : ${apiKey.token}`)
  logger.info(`Admin email         : ${process.env.SEED_ADMIN_EMAIL}`)
  logger.info(`Admin password      : [set via SEED_ADMIN_PASSWORD env var]`)
  logger.info(`Vendor email        : ${process.env.SEED_SELLER_EMAIL}`)
  logger.info(`Vendor password     : [set via SEED_SELLER_PASSWORD env var]`)
}
