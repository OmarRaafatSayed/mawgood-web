import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve("query")
  
  try {
    // Get first stock location
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })
    
    if (!locations?.length) {
      res.status(400).json({ error: "No stock location found" })
      return
    }
    
    const locationId = locations[0].id
    
    // Get or create fulfillment set
    const { data: fulfillmentSets } = await query.graph({
      entity: "fulfillment_set",
      fields: ["id", "name", "type", "location_id"],
      filters: {
        location_id: locationId,
        type: "shipping",
      },
    })
    
    let fulfillmentSetId
    if (!fulfillmentSets?.length) {
      // Create via raw query
      const result = await req.scope.resolve("query").execute(`
        INSERT INTO fulfillment_set (id, name, type, location_id, created_at, updated_at)
        VALUES (
          'fset_' || substr(md5(random()::text), 1, 26),
          'Shipping Fulfillment',
          'shipping',
          '${locationId}',
          NOW(),
          NOW()
        )
        RETURNING id
      `)
      fulfillmentSetId = result[0].id
    } else {
      fulfillmentSetId = fulfillmentSets[0].id
    }
    
    // Get or create service zone
    const { data: serviceZones } = await query.graph({
      entity: "service_zone",
      fields: ["id", "name", "fulfillment_set_id"],
      filters: {
        fulfillment_set_id: fulfillmentSetId,
      },
    })
    
    let serviceZoneId
    if (!serviceZones?.length) {
      const result = await req.scope.resolve("query").execute(`
        INSERT INTO service_zone (id, name, fulfillment_set_id, created_at, updated_at)
        VALUES (
          'serzo_' || substr(md5(random()::text), 1, 24),
          'Egypt & MENA',
          '${fulfillmentSetId}',
          NOW(),
          NOW()
        )
        RETURNING id
      `)
      serviceZoneId = result[0].id
      
      // Add countries
      const countries = ['eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo']
      for (const country of countries) {
        await req.scope.resolve("query").execute(`
          INSERT INTO geo_zone (id, type, country_code, service_zone_id, created_at, updated_at)
          VALUES (
            'gz_' || substr(md5(random()::text), 1, 27),
            'country',
            '${country}',
            '${serviceZoneId}',
            NOW(),
            NOW()
          )
        `)
      }
    } else {
      serviceZoneId = serviceZones[0].id
    }
    
    // Get shipping profile
    const { data: profiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id", "name"],
    })
    
    if (!profiles?.length) {
      res.status(400).json({ error: "No shipping profile found" })
      return
    }
    
    const shippingProfileId = profiles[0].id
    
    // Delete existing shipping options
    await req.scope.resolve("query").execute(`
      DELETE FROM shipping_option WHERE service_zone_id = '${serviceZoneId}'
    `)
    
    // Create shipping option
    const soResult = await req.scope.resolve("query").execute(`
      INSERT INTO shipping_option (
        id, name, price_type, service_zone_id, shipping_profile_id,
        provider_id, data, type, created_at, updated_at
      )
      VALUES (
        'so_' || substr(md5(random()::text), 1, 27),
        'Cash on Delivery',
        'flat',
        '${serviceZoneId}',
        '${shippingProfileId}',
        'manual',
        '{"id": "manual-fulfillment"}',
        'shipping',
        NOW(),
        NOW()
      )
      RETURNING id
    `)
    
    const shippingOptionId = soResult[0].id
    
    // Add rule
    await req.scope.resolve("query").execute(`
      INSERT INTO shipping_option_rule (
        id, attribute, operator, value, shipping_option_id, created_at, updated_at
      )
      VALUES (
        'sor_' || substr(md5(random()::text), 1, 26),
        'enabled_in_store',
        'eq',
        'true',
        '${shippingOptionId}',
        NOW(),
        NOW()
      )
    `)
    
    // Add price
    await req.scope.resolve("query").execute(`
      INSERT INTO shipping_option_price (
        id, currency_code, amount, shipping_option_id, created_at, updated_at
      )
      VALUES (
        'soprice_' || substr(md5(random()::text), 1, 22),
        'egp',
        5000,
        '${shippingOptionId}',
        NOW(),
        NOW()
      )
    `)
    
    res.json({
      success: true,
      message: "Cash on Delivery shipping option created successfully",
      shipping_option_id: shippingOptionId,
    })
  } catch (error) {
    console.error("Error creating shipping option:", error)
    res.status(500).json({ error: error.message })
  }
}
