import { MedusaContainer } from "@medusajs/framework/types"

export default async function seedShippingOptions(container: MedusaContainer) {
  const query = container.resolve("query")
  
  try {
    // Get first stock location
    const locations = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })
    
    if (!locations?.data?.length) {
      console.error("No stock location found")
      return
    }
    
    const locationId = locations.data[0].id
    console.log("Using location:", locationId)
    
    // Get or create fulfillment set
    let fulfillmentSets = await query.graph({
      entity: "fulfillment_set",
      fields: ["id", "name", "type"],
      filters: {
        location_id: locationId,
        type: "shipping",
      },
    })
    
    let fulfillmentSetId
    if (!fulfillmentSets?.data?.length) {
      const result = await container.resolve("fulfillmentModuleService").createFulfillmentSets({
        name: "Shipping Fulfillment",
        type: "shipping",
        location_id: locationId,
      })
      fulfillmentSetId = result.id
      console.log("Created fulfillment set:", fulfillmentSetId)
    } else {
      fulfillmentSetId = fulfillmentSets.data[0].id
    }
    
    // Get or create service zone
    let serviceZones = await query.graph({
      entity: "service_zone",
      fields: ["id", "name"],
      filters: {
        fulfillment_set_id: fulfillmentSetId,
      },
    })
    
    let serviceZoneId
    if (!serviceZones?.data?.length) {
      const result = await container.resolve("fulfillmentModuleService").createServiceZones({
        name: "Egypt & MENA",
        fulfillment_set_id: fulfillmentSetId,
        geo_zones: [
          { type: "country", country_code: "eg" },
          { type: "country", country_code: "sa" },
          { type: "country", country_code: "ae" },
          { type: "country", country_code: "kw" },
          { type: "country", country_code: "qa" },
          { type: "country", country_code: "bh" },
          { type: "country", country_code: "om" },
          { type: "country", country_code: "jo" },
        ],
      })
      serviceZoneId = result.id
      console.log("Created service zone:", serviceZoneId)
    } else {
      serviceZoneId = serviceZones.data[0].id
    }
    
    // Get default shipping profile
    const profiles = await query.graph({
      entity: "shipping_profile",
      fields: ["id", "name"],
    })
    
    if (!profiles?.data?.length) {
      console.error("No shipping profile found")
      return
    }
    
    const shippingProfileId = profiles.data[0].id
    console.log("Using shipping profile:", shippingProfileId)
    
    // Create Cash on Delivery shipping option
    const shippingOption = await container.resolve("fulfillmentModuleService").createShippingOptions({
      name: "Cash on Delivery",
      price_type: "flat",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfileId,
      provider_id: "manual",
      type: "shipping",
      data: { id: "manual-fulfillment" },
      rules: [
        {
          attribute: "enabled_in_store",
          operator: "eq",
          value: "true",
        },
      ],
      prices: [
        {
          currency_code: "egp",
          amount: 5000, // 50 EGP
        },
      ],
    })
    
    console.log("SUCCESS: Created Cash on Delivery shipping option:", shippingOption.id)
  } catch (error) {
    console.error("Error creating shipping option:", error)
  }
}
