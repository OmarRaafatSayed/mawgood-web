import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with -and-
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}

export default async function fixCategoryHandles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  
  const categories = await productModule.listProductCategories({}, { 
    select: ['id', 'name', 'handle'] 
  })
  
  logger.info(`Found ${categories.length} categories to fix.`)
  
  for (const cat of categories) {
    const newHandle = slugify(cat.handle || cat.name)
    if (cat.handle !== newHandle) {
      logger.info(`Updating: "${cat.handle}" -> "${newHandle}"`)
      await productModule.updateProductCategories(cat.id, { handle: newHandle })
    }
  }
  
  logger.info('=== All handles fixed! ===')
}
