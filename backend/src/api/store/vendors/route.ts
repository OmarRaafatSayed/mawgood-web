import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * GET /store/vendors
 * List all active stores/vendors for the Flutter app and storefront
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve('query')
    
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
        'created_at',
        'updated_at',
        '+address.address_line',
        '+address.city',
        '+address.country_code',
        '+address.postal_code',
        'products_count'
      ],
      filters: {
        store_status: 'ACTIVE'
      },
      pagination: {
        skip: parseInt(req.query.offset as string) || 0,
        take: parseInt(req.query.limit as string) || 20,
        order: { created_at: 'DESC' }
      }
    })

    return res.json({
      sellers,
      count: metadata?.count || 0,
      offset: metadata?.skip || 0,
      limit: metadata?.take || 20
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return res.status(500).json({
      error: 'Failed to fetch vendors',
      message: error.message
    })
  }
}
