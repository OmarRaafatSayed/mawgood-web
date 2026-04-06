import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function addShippingPrices({ container }: ExecArgs) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const regionService = container.resolve(Modules.REGION)
  
  // Get Arab Countries region
  const [region] = await regionService.listRegions({
    name: 'Arab Countries'
  })
  
  if (!region) {
    console.error('❌ Arab Countries region not found')
    return
  }
  
  // Get shipping options
  const shippingOptions = await fulfillmentService.listShippingOptions({
    service_zone: {
      name: 'All Arab Countries'
    }
  })
  
  console.log(`Found ${shippingOptions.length} shipping options`)
  
  // Update each shipping option with prices
  for (const option of shippingOptions) {
    const price = option.name === 'Standard Shipping' ? 50 : 100
    
    await fulfillmentService.updateShippingOptions([{
      id: option.id,
      prices: [{
        currency_code: 'egp',
        amount: price
      }]
    }])
    
    console.log(`✅ ${option.name}: ${price} EGP`)
  }
  
  console.log('✅ All shipping prices updated!')
}
