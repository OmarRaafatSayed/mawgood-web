// @ts-nocheck
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { isVendor } from '../../middlewares/vendor-auth'

/**
 * GET /vendor/products
 * Get all products for the authenticated vendor
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Apply vendor middleware
    await isVendor(req, res, async () => {
      const seller = req.seller
      const productService = req.scope.resolve(Modules.PRODUCT)

      const offset = parseInt(req.query.offset as string) || 0
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string

      const filters: any = {
        seller_id: seller.id
      }

      if (status) {
        filters.status = status
      }

      const [products, count] = await Promise.all([
        productService.listProducts(
          filters,
          {
            relations: ['variants', 'variants.prices', 'images', 'categories'],
            skip: offset,
            take: limit,
            order: { created_at: 'DESC' }
          }
        ),
        productService.count(filters)
      ])

      return res.json({
        products,
        count,
        offset,
        limit,
        vendor: {
          id: seller.id,
          name: seller.name,
          handle: seller.handle
        }
      })
    })
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    return res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    })
  }
}
