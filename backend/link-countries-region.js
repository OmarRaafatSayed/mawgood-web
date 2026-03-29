const { Client } = require('pg');

async function linkCountriesToRegion() {
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

    // Update countries to link them to the region
    const countries = ['eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo'];
    
    for (const country of countries) {
      await client.query(
        `UPDATE region_country SET region_id = $1 WHERE iso_2 = $2`,
        [regionId, country]
      );
      console.log(`Linked ${country} to region`);
    }
    
    console.log('\n✅ SUCCESS! All Arab countries linked to region');
    console.log('Now refresh your checkout page and shipping should work!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

linkCountriesToRegion();
