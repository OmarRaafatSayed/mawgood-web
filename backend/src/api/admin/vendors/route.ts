// @ts-nocheck
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * GET /admin/vendors
 * List all vendors (admin only)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve('query')
    
    const status = req.query.status as string
    const offset = parseInt(req.query.offset as string) || 0
    const limit = parseInt(req.query.limit as string) || 50

    const filters: any = {}
    if (status) {
      filters.store_status = status
    }

    const { data: sellers, metadata } = await query.graph({
      entity: 'seller',
      fields: [
        'id',
        'name',
        'handle',
        'description',
        'photo',
        'email',
        'store_status',
        'tax_id',
        'created_at',
        'updated_at',
        '+address.*',
        'products_count',
        'orders_count'
      ],
      filters,
      pagination: {
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' }
      }
    })

    return res.json({
      vendors: sellers,
      count: metadata?.count || 0,
      offset,
      limit
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return res.status(500).json({
      error: 'Failed to fetch vendors',
      message: error.message
    })
  }
}
