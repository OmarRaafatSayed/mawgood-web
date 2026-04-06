const { Client } = require('pg');

async function addCODPaymentProvider() {
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

    // Get the Arab Countries region
    const regionResult = await client.query(
      `SELECT id FROM region WHERE name = 'Arab Countries' LIMIT 1`
    );
    
    if (regionResult.rows.length === 0) {
      throw new Error('Arab Countries region not found');
    }
    
    const regionId = regionResult.rows[0].id;
    console.log('Region ID:', regionId);

    // Check if payment provider exists
    const providerCheck = await client.query(
      `SELECT id FROM payment_provider WHERE id = 'pp_cash-on-delivery_cash-on-delivery'`
    );

    if (providerCheck.rows.length === 0) {
      // Create payment provider
      await client.query(
        `INSERT INTO payment_provider (id, is_enabled)
         VALUES ('pp_cash-on-delivery_cash-on-delivery', true)
         ON CONFLICT (id) DO NOTHING`
      );
      console.log('Created payment provider');
    }

    // Link payment provider to region
    await client.query(
      `INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
       VALUES (
         'regpp_' || substr(md5(random()::text), 1, 24),
         $1,
         'pp_cash-on-delivery_cash-on-delivery',
         NOW(),
         NOW()
       )
       ON CONFLICT DO NOTHING`,
      [regionId]
    );
    
    console.log('\n✅ SUCCESS! Cash on Delivery payment provider added to region');
    console.log('Restart the backend and refresh checkout page');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

addCODPaymentProvider();
