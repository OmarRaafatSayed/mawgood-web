import { MedusaContainer } from '@medusajs/framework'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow
} from '@medusajs/medusa/core-flows'

export async function createDefaultStoreShipping(container: MedusaContainer) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  
  const {
    result: [stockLocation]
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: 'Default Store Location',
          address: {
            address_1: 'Cairo',
            city: 'Cairo',
            country_code: 'eg'
          }
        }
      ]
    }
  })

  await link.create([
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: 'manual_manual'
      }
    }
  ])

  const [fulfillmentSet] = await fulfillmentService.createFulfillmentSets([
    {
      name: 'Default Store Fulfillment',
      type: 'shipping',
      location_id: stockLocation.id
    }
  ])

  const allCountries = ['eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo']
  
  await createServiceZonesWorkflow.run({
    container,
    input: {
      data: [
        {
          fulfillment_set_id: fulfillmentSet.id,
          name: 'Arab Countries Shipping',
          geo_zones: allCountries.map((c) => ({
            type: 'country',
            country_code: c
          }))
        }
      ]
    }
  })

  const [serviceZone] = await fulfillmentService.listServiceZones({
    fulfillment_set: {
      id: fulfillmentSet.id
    }
  })

  const [shippingProfile] = await fulfillmentService.listShippingProfiles({
    name: 'Default Shipping Profile'
  })

  await createShippingOptionsWorkflow.run({
    container,
    input: [
      {
        name: 'Standard Shipping',
        shipping_profile_id: shippingProfile.id,
        service_zone_id: serviceZone.id,
        provider_id: 'manual_manual',
        type: {
          label: 'Standard Shipping',
          code: 'standard',
          description: 'Standard shipping for all Arab countries'
        },
        rules: [
          { value: 'true', attribute: 'enabled_in_store', operator: 'eq' },
          { attribute: 'is_return', value: 'false', operator: 'eq' }
        ],
        prices: [
          { currency_code: 'egp', amount: 50 }
        ],
        price_type: 'flat',
        data: { id: 'manual-fulfillment' }
      },
      {
        name: 'Express Shipping',
        shipping_profile_id: shippingProfile.id,
        service_zone_id: serviceZone.id,
        provider_id: 'manual_manual',
        type: {
          label: 'Express Shipping',
          code: 'express',
          description: 'Fast shipping for all Arab countries'
        },
        rules: [
          { value: 'true', attribute: 'enabled_in_store', operator: 'eq' },
          { attribute: 'is_return', value: 'false', operator: 'eq' }
        ],
        prices: [
          { currency_code: 'egp', amount: 100 }
        ],
        price_type: 'flat',
        data: { id: 'manual-fulfillment' }
      }
    ]
  })

  console.log('✅ Default store shipping options created successfully')
}
