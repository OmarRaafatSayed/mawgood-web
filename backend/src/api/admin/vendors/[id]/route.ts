import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * GET /admin/vendors/:id
 * Get vendor details (admin only)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const query = req.scope.resolve('query')

    const { data: sellers } = await query.graph({
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
        '+products.id',
        '+products.title',
        '+products.handle',
        '+products.status',
        '+products.created_at'
      ],
      filters: { id }
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        error: 'Vendor not found'
      })
    }

    const seller = sellers[0]

    return res.json({
      vendor: seller
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return res.status(500).json({
      error: 'Failed to fetch vendor',
      message: error.message
    })
  }
}

/**
 * PATCH /admin/vendors/:id
 * Update vendor details (admin only)
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const query = req.scope.resolve('query')
    const sellerService = req.scope.resolve(SELLER_MODULE)

    const updateData = req.body

    // Validate store_status if being updated
    if (updateData.store_status && !['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(updateData.store_status)) {
      return res.status(400).json({
        error: 'Invalid store_status. Must be ACTIVE, SUSPENDED, or INACTIVE'
      })
    }

    // Update the seller
    const updatedSeller = await sellerService.update(id, updateData)

    return res.json({
      vendor: updatedSeller
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return res.status(500).json({
      error: 'Failed to update vendor',
      message: error.message
    })
  }
}

/**
 * DELETE /admin/vendors/:id
 * Delete vendor (admin only)
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const query = req.scope.resolve('query')
    const sellerService = req.scope.resolve(SELLER_MODULE)

    // Check if vendor has products
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['products_count'],
      filters: { id }
    })

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        error: 'Vendor not found'
      })
    }

    const seller = sellers[0]

    if (seller.products_count && seller.products_count > 0) {
      return res.status(400).json({
        error: 'Cannot delete vendor with existing products',
        message: 'Please reassign or delete the products first'
      })
    }

    // Delete the seller
    await sellerService.delete(id)

    return res.json({
      success: true,
      message: 'Vendor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return res.status(500).json({
      error: 'Failed to delete vendor',
      message: error.message
    })
  }
}
