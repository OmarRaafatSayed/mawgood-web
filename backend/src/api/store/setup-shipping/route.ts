// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const manager = req.scope.resolve(ContainerRegistrationKeys.MANAGER)
  
  try {
    await manager.transaction(async (transactionManager) => {
      // Get first stock location
      const locationResult = await transactionManager.query(
        `SELECT id FROM stock_location LIMIT 1`
      )
      
      if (!locationResult.length) {
        throw new Error("No stock location found")
      }
      
      const locationId = locationResult[0].id
      
      // Get or create fulfillment set
      let fulfillmentSetResult = await transactionManager.query(
        `SELECT id FROM fulfillment_set WHERE location_id = $1 AND type = 'shipping' LIMIT 1`,
        [locationId]
      )
      
      let fulfillmentSetId
      if (!fulfillmentSetResult.length) {
        fulfillmentSetResult = await transactionManager.query(
          `INSERT INTO fulfillment_set (id, name, type, location_id, created_at, updated_at)
           VALUES (
             'fset_' || substr(md5(random()::text), 1, 26),
             'Shipping Fulfillment',
             'shipping',
             $1,
             NOW(),
             NOW()
           )
           RETURNING id`,
          [locationId]
        )
        fulfillmentSetId = fulfillmentSetResult[0].id
      } else {
        fulfillmentSetId = fulfillmentSetResult[0].id
      }
      
      // Get or create service zone
      let serviceZoneResult = await transactionManager.query(
        `SELECT id FROM service_zone WHERE fulfillment_set_id = $1 LIMIT 1`,
        [fulfillmentSetId]
      )
      
      let serviceZoneId
      if (!serviceZoneResult.length) {
        serviceZoneResult = await transactionManager.query(
          `INSERT INTO service_zone (id, name, fulfillment_set_id, created_at, updated_at)
           VALUES (
             'serzo_' || substr(md5(random()::text), 1, 24),
             'Egypt & MENA',
             $1,
             NOW(),
             NOW()
           )
           RETURNING id`,
          [fulfillmentSetId]
        )
        serviceZoneId = serviceZoneResult[0].id
        
        // Add countries
        const countries = ['eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo']
        for (const country of countries) {
          await transactionManager.query(
            `INSERT INTO geo_zone (id, type, country_code, service_zone_id, created_at, updated_at)
             VALUES (
               'gz_' || substr(md5(random()::text), 1, 27),
               'country',
               $1,
               $2,
               NOW(),
               NOW()
             )`,
            [country, serviceZoneId]
          )
        }
      } else {
        serviceZoneId = serviceZoneResult[0].id
      }
      
      // Get shipping profile
      const profileResult = await transactionManager.query(
        `SELECT id FROM shipping_profile LIMIT 1`
      )
      
      if (!profileResult.length) {
        throw new Error("No shipping profile found")
      }
      
      const shippingProfileId = profileResult[0].id
      
      // Delete existing shipping options for this service zone
      await transactionManager.query(
        `DELETE FROM shipping_option WHERE service_zone_id = $1`,
        [serviceZoneId]
      )
      
      // Create shipping option
      const soResult = await transactionManager.query(
        `INSERT INTO shipping_option (
          id, name, price_type, service_zone_id, shipping_profile_id,
          provider_id, data, type, created_at, updated_at
        )
        VALUES (
          'so_' || substr(md5(random()::text), 1, 27),
          'Cash on Delivery',
          'flat',
          $1,
          $2,
          'manual',
          '{"id": "manual-fulfillment"}',
          'shipping',
          NOW(),
          NOW()
        )
        RETURNING id`,
        [serviceZoneId, shippingProfileId]
      )
      
      const shippingOptionId = soResult[0].id
      
      // Add rule
      await transactionManager.query(
        `INSERT INTO shipping_option_rule (
          id, attribute, operator, value, shipping_option_id, created_at, updated_at
        )
        VALUES (
          'sor_' || substr(md5(random()::text), 1, 26),
          'enabled_in_store',
          'eq',
          'true',
          $1,
          NOW(),
          NOW()
        )`,
        [shippingOptionId]
      )
      
      // Add price
      await transactionManager.query(
        `INSERT INTO shipping_option_price (
          id, currency_code, amount, shipping_option_id, created_at, updated_at
        )
        VALUES (
          'soprice_' || substr(md5(random()::text), 1, 22),
          'egp',
          5000,
          $1,
          NOW(),
          NOW()
        )`,
        [shippingOptionId]
      )
      
      res.json({
        success: true,
        message: "Cash on Delivery shipping option created successfully",
        shipping_option_id: shippingOptionId,
      })
    })
  } catch (error) {
    console.error("Error creating shipping option:", error)
    res.status(500).json({ error: error.message })
  }
}
