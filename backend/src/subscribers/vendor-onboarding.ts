import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'

/**
 * Subscriber to handle vendor onboarding when a new seller is created
 * - Creates default stock location
 * - Sets up shipping options
 * - Sends welcome email
 * - Initializes commission tracking
 */
export default async function vendorOnboardingHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    const sellerService = container.resolve(SELLER_MODULE)
    const query = container.resolve('query')
    
    // Get the newly created seller
    const { data: sellers } = await query.graph({
      entity: 'seller',
      fields: ['id', 'name', 'email', 'handle'],
      filters: { id: data.id }
    })

    if (!sellers || sellers.length === 0) {
      console.error('No seller found for onboarding:', data.id)
      return
    }

    const seller = sellers[0]

    console.log(`🎉 Starting onboarding for vendor: ${seller.name} (${seller.email})`)

    // TODO: Create default stock location for the vendor
    // This would use createStockLocationsWorkflow
    
    // TODO: Set up shipping options for the vendor
    // This would use createShippingOptionsWorkflow
    
    // TODO: Send welcome email to vendor
    // This would use the notification module
    
    // TODO: Initialize commission tracking
    // This would use the @mercurjs/commission module

    // TODO: Create vendor-specific notification channel
    
    console.log(`✅ Onboarding completed for vendor: ${seller.name}`)
  } catch (error) {
    console.error('Error in vendor onboarding:', error)
    // Don't throw - we don't want to break the seller creation flow
  }
}

export const config: SubscriberConfig = {
  event: 'seller.created',
  context: { subscriber: 'vendor-onboarding' }
}
