// @ts-nocheck
import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function debugVariantInventoryLinks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)

  logger.info('=== Debugging Variant-Inventory Links ===')

  const variants = await productService.listProductVariants({}, {
    relations: ['inventory_items'],
    select: ['id', 'title', 'sku', 'manage_inventory', 'allow_backorder']
  })

  logger.info(`Found ${variants.length} variants`)

  for (const variant of variants) {
    logger.info(`\nVariant: ${variant.title} (${variant.id})`)
    logger.info(`  Manage Inventory: ${variant.manage_inventory}`)
    logger.info(`  Allow Backorder: ${variant.allow_backorder}`)
    logger.info(`  Inventory Items: ${variant.inventory_items?.length || 0}`)
    
    if (variant.inventory_items && variant.inventory_items.length > 0) {
      for (const invItem of variant.inventory_items) {
        logger.info(`    - ${invItem.id} (required: ${invItem.required_quantity})`)
      }
    }
  }

  logger.info('\n=== Finished ===')
}
