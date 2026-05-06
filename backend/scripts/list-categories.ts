import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export default async function listCategoriesScript({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  
  const categories = await productModule.listProductCategories({}, { 
    select: ['id', 'name', 'handle', 'parent_category_id'] 
  })
  
  logger.info('=== Categories in Database ===')
  console.log(JSON.stringify(categories, null, 2))
}
