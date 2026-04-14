import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * GET /store/vendors/:id/products
 * Fetch products belonging to a specific vendor
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const query = req.scope.resolve('query')
    const productService = req.scope.resolve(Modules.PRODUCT)

    // Verify seller exists and is active
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'handle', 'store_status'],
      filters: { id }
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        error: 'Vendor not found'
      })
    }

    const seller = sellers[0]

    if (seller.store_status !== 'ACTIVE') {
      return res.status(400).json({
        error: 'Vendor is not active'
      })
    }

    // Get pagination params
    const offset = parseInt(req.query.offset as string) || 0
    const limit = parseInt(req.query.limit as string) || 20
    const category = req.query.category as string
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price as string) : undefined
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined

    // Build filters
    const filters: any = {
      seller_id: id,
      status: 'published'
    }

    if (category) {
      filters.category_id = category
    }

    // Fetch products
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

    // Filter by price if needed
    let filteredProducts = products
    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredProducts = products.filter(product => {
        if (!product.variants || product.variants.length === 0) return false
        
        return product.variants.some(variant => {
          if (!variant.prices || variant.prices.length === 0) return false
          
          return variant.prices.some(price => {
            const amount = price.amount
            if (minPrice !== undefined && amount < minPrice) return false
            if (maxPrice !== undefined && amount > maxPrice) return false
            return true
          })
        })
      })
    }

    return res.json({
      vendor: {
        id: seller.id,
        name: seller.name,
        handle: seller.handle
      },
      products: filteredProducts,
      count: filteredProducts.length,
      total_count: count,
      offset,
      limit
    })
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    return res.status(500).json({
      error: 'Failed to fetch vendor products',
      message: error.message
    })
  }
}
