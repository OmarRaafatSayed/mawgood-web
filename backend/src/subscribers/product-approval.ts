import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * Subscriber to handle product approval/rejection workflow
 * - Notify vendor when product is approved
 * - Notify vendor when product needs changes
 * - Update product visibility based on approval status
 */
export default async function productApprovalHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; status?: string }>) {
  try {
    const productService = container.resolve(Modules.PRODUCT)
    const sellerService = container.resolve(SELLER_MODULE)
    const query = container.resolve('query')

    // Get the product
    const product = await productService.retrieveProduct(data.id, {
      relations: ['seller']
    })

    if (!product || !product.seller_id) {
      return
    }

    // Get the seller
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'email', 'handle'],
      filters: { id: product.seller_id }
    })

    if (!sellers || sellers.length === 0) {
      return
    }

    const seller = sellers[0]

    const status = data.status || product.status

    if (status === 'published') {
      console.log(`✅ Product "${product.title}" approved for seller ${seller.name}`)
      
      // TODO: Send approval notification to vendor
      // await notificationService.create({
      //   to: seller.email,
      //   channel: 'email',
      //   template: 'product-approved',
      //   data: {
      //     seller_name: seller.name,
      //     product_title: product.title,
      //     product_id: product.id
      //   }
      // })
    } else if (status === 'draft' || status === 'proposed') {
      console.log(`📝 Product "${product.title}" pending review for seller ${seller.name}`)
      
      // TODO: Notify admin of new product submission
    } else if (status === 'rejected') {
      console.log(`❌ Product "${product.title}" rejected for seller ${seller.name}`)
      
      // TODO: Send rejection notification to vendor with reasons
    }
  } catch (error) {
    console.error('Error in product approval handler:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['product.updated', 'product.created'],
  context: { subscriber: 'product-approval' }
}
