const { Client } = require('pg');

async function setupShipping() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mercurjs',
    user: 'postgres',
    password: '02486',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get first stock location
    const locationResult = await client.query('SELECT id FROM stock_location LIMIT 1');
    if (locationResult.rows.length === 0) {
      throw new Error('No stock location found');
    }
    const locationId = locationResult.rows[0].id;
    console.log('Location ID:', locationId);

    // Get or create fulfillment set
    let fulfillmentSetResult = await client.query(
      `SELECT id FROM fulfillment_set WHERE type = 'shipping' LIMIT 1`
    );
    
    let fulfillmentSetId;
    if (fulfillmentSetResult.rows.length === 0) {
      fulfillmentSetResult = await client.query(
        `INSERT INTO fulfillment_set (id, name, type, created_at, updated_at)
         VALUES (
           'fset_' || substr(md5(random()::text), 1, 26),
           'Shipping Fulfillment',
           'shipping',
           NOW(),
           NOW()
         )
         RETURNING id`
      );
      fulfillmentSetId = fulfillmentSetResult.rows[0].id;
      console.log('Created fulfillment set:', fulfillmentSetId);
      
      // Link to location
      await client.query(
        `INSERT INTO stock_location_fulfillment_set (stock_location_id, fulfillment_set_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [locationId, fulfillmentSetId]
      );
    } else {
      fulfillmentSetId = fulfillmentSetResult.rows[0].id;
      console.log('Using existing fulfillment set:', fulfillmentSetId);
    }

    // Get or create service zone
    let serviceZoneResult = await client.query(
      `SELECT id FROM service_zone WHERE fulfillment_set_id = $1 LIMIT 1`,
      [fulfillmentSetId]
    );
    
    let serviceZoneId;
    if (serviceZoneResult.rows.length === 0) {
      serviceZoneResult = await client.query(
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
      );
      serviceZoneId = serviceZoneResult.rows[0].id;
      console.log('Created service zone:', serviceZoneId);
      
      // Add countries
      const countries = ['eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo'];
      for (const country of countries) {
        await client.query(
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
        );
      }
      console.log('Added countries to geo zone');
    } else {
      serviceZoneId = serviceZoneResult.rows[0].id;
      console.log('Using existing service zone:', serviceZoneId);
    }

    // Get shipping profile
    const profileResult = await client.query('SELECT id FROM shipping_profile LIMIT 1');
    if (profileResult.rows.length === 0) {
      throw new Error('No shipping profile found');
    }
    const shippingProfileId = profileResult.rows[0].id;
    console.log('Shipping profile ID:', shippingProfileId);

    // Get shipping option type
    const typeResult = await client.query('SELECT id FROM shipping_option_type LIMIT 1');
    if (typeResult.rows.length === 0) {
      throw new Error('No shipping option type found');
    }
    const shippingOptionTypeId = typeResult.rows[0].id;
    console.log('Shipping option type ID:', shippingOptionTypeId);

    // Delete existing shipping options for this service zone
    await client.query('DELETE FROM shipping_option WHERE service_zone_id = $1', [serviceZoneId]);
    console.log('Deleted old shipping options');

    // Create shipping option
    const soResult = await client.query(
      `INSERT INTO shipping_option (
        id, name, price_type, service_zone_id, shipping_profile_id,
        provider_id, shipping_option_type_id, data, created_at, updated_at
      )
      VALUES (
        'so_' || substr(md5(random()::text), 1, 27),
        'Cash on Delivery',
        'flat',
        $1,
        $2,
        'manual_manual',
        $3,
        '{"id": "manual-fulfillment"}',
        NOW(),
        NOW()
      )
      RETURNING id`,
      [serviceZoneId, shippingProfileId, shippingOptionTypeId]
    );
    
    const shippingOptionId = soResult.rows[0].id;
    console.log('Created shipping option:', shippingOptionId);

    // Add rule
    await client.query(
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
    );
    console.log('Added shipping option rule');

    // Add price (50 EGP) via price_set
    const priceSetResult = await client.query(
      `INSERT INTO price_set (id, created_at, updated_at)
       VALUES (
         'pset_' || substr(md5(random()::text), 1, 25),
         NOW(),
         NOW()
       )
       RETURNING id`
    );
    const priceSetId = priceSetResult.rows[0].id;
    
    await client.query(
      `INSERT INTO shipping_option_price_set (id, shipping_option_id, price_set_id, created_at, updated_at)
       VALUES (
         'sops_' || substr(md5(random()::text), 1, 25),
         $1,
         $2,
         NOW(),
         NOW()
       )`,
      [shippingOptionId, priceSetId]
    );
    
    await client.query(
      `INSERT INTO price (id, currency_code, amount, raw_amount, price_set_id, created_at, updated_at)
       VALUES (
         'price_' || substr(md5(random()::text), 1, 24),
         'egp',
         5000,
         '{"value": "5000"}',
         $1,
         NOW(),
         NOW()
       )`,
      [priceSetId]
    );
    console.log('Added price: 50 EGP');

    console.log('\n✅ SUCCESS! Cash on Delivery shipping option created!');
    console.log('Now refresh your checkout page and you should see the shipping option.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

setupShipping();
