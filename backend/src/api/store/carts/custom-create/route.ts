import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartService = req.scope.resolve(Modules.CART)
    const regionService = req.scope.resolve(Modules.REGION)
    
    const { region_id } = req.body as { region_id?: string }
    
    if (!region_id) {
      return res.status(400).json({
        error: 'Region ID is required'
      })
    }
    
    const region = await regionService.retrieveRegion(region_id, {
      select: ['id', 'currency_code']
    })
    
    if (!region) {
      return res.status(400).json({
        error: 'Region not found'
      })
    }
    
    const currency_code = region.currency_code || 'egp'
    
    const cart = await cartService.createCarts({
      region_id,
      currency_code
    })
    
    return res.status(201).json({ cart })
  } catch (error: any) {
    console.error('Error creating cart:', error)
    return res.status(500).json({
      error: 'Failed to create cart',
      message: error.message
    })
  }
}
