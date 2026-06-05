// @ts-nocheck
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'

/**
 * Subscriber to handle product approval/rejection workflow
 */
export default async function productApprovalHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; status?: string }>) {
  try {
    const productService = container.resolve(Modules.PRODUCT)
    const query = container.resolve('query')

    const product = await productService.retrieveProduct(data.id)

    if (!product) return

    const status = data.status || product.status

    // Try to get seller info if available
    let sellerName = 'unknown'
    try {
      if (product.seller_id) {
        const { data: sellers } = await query.graph({
          entity: 'seller',
          fields: ['id', 'name', 'email', 'handle'],
          filters: { id: product.seller_id }
        })
        if (sellers && sellers.length > 0) {
          sellerName = sellers[0].name
        }
      }
    } catch {
      // seller info not critical
    }

    if (status === 'published') {
      console.log(`✅ Product "${product.title}" approved for seller ${sellerName}`)
    } else if (status === 'draft' || status === 'proposed') {
      console.log(`📝 Product "${product.title}" pending review for seller ${sellerName}`)
    } else if (status === 'rejected') {
      console.log(`❌ Product "${product.title}" rejected for seller ${sellerName}`)
    }
  } catch (error) {
    console.error('Error in product approval handler:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['product.updated', 'product.created'],
  context: { subscriber: 'product-approval' }
}
