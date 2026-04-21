// @ts-nocheck
import { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * Middleware to verify user is a vendor and restrict access to their own resources
 */
export async function isVendor(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    // Check if user is authenticated
    const authContext = req.auth_context
    if (!authContext || !authContext.actor_id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    const query = req.scope.resolve('query')
    const userId = authContext.actor_id

    // Get the user and check if they are a vendor
    const { data: users } = await query.graph({
      entity: 'user',
      fields: ['id', 'email', 'actor_type'],
      filters: { id: userId }
    })

    if (!users || users.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      })
    }

    const user = users[0]

    // Check if user is a vendor
    if (user.actor_type !== 'vendor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Vendor access required.'
      })
    }

    // Get the seller (vendor) associated with this user
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'handle', 'store_status'],
      filters: { user_id: userId }
    })

    if (!sellers || sellers.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No vendor account associated with this user'
      })
    }

    const seller = sellers[0]

    // Check if vendor is active
    if (seller.store_status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your vendor account is not active'
      })
    }

    // Attach seller info to request for use in route handlers
    req.seller = seller

    next()
  } catch (error) {
    console.error('Vendor middleware error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

/**
 * Middleware to verify user is an admin
 */
export async function isAdmin(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const authContext = req.auth_context
    if (!authContext || !authContext.actor_id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    const query = req.scope.resolve('query')
    const userId = authContext.actor_id

    const { data: users } = await query.graph({
      entity: 'user',
      fields: ['id', 'email', 'actor_type'],
      filters: { id: userId }
    })

    if (!users || users.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      })
    }

    const user = users[0]

    if (user.actor_type !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Admin access required.'
      })
    }

    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

/**
 * Middleware to ensure vendor can only access their own resources
 */
export async function vendorOwnsResource(
  resourceType: 'product' | 'order' | 'shipping'
) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      const seller = req.seller
      if (!seller) {
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Seller context not set'
        })
      }

      const resourceId = req.params.id || req.params.productId || req.params.orderId

      if (!resourceId) {
        return next()
      }

      const query = req.scope.resolve('query')

      let resourceSellerId: string | undefined

      if (resourceType === 'product') {
        const productService = req.scope.resolve(Modules.PRODUCT)
        const product = await productService.retrieveProduct(resourceId)
        resourceSellerId = product?.seller_id
      }
      // Add other resource types as needed

      if (resourceSellerId !== seller.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You do not have access to this ${resourceType}`
        })
      }

      next()
    } catch (error) {
      console.error(`Vendor ownership middleware error:`, error)
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
