const { Client } = require('pg');

async function linkShippingToRegion() {
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

    // Get the service zone
    const serviceZoneResult = await client.query(
      `SELECT id FROM service_zone WHERE name = 'All Arab Countries' LIMIT 1`
    );
    
    if (serviceZoneResult.rows.length === 0) {
      throw new Error('Service zone not found');
    }
    
    const serviceZoneId = serviceZoneResult.rows[0].id;
    console.log('Service Zone ID:', serviceZoneId);

    // Link region to service zone via region_geo_zone
    await client.query(
      `INSERT INTO region_geo_zone (region_id, geo_zone_id)
       SELECT $1, gz.id
       FROM geo_zone gz
       WHERE gz.service_zone_id = $2
       ON CONFLICT DO NOTHING`,
      [regionId, serviceZoneId]
    );
    
    console.log('✅ SUCCESS! Linked shipping options to region');
    console.log('Now refresh your checkout page');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

linkShippingToRegion();
