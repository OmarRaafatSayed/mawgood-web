const { Client } = require('pg');

async function fixShippingOptions() {
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

    // Update shipping option name to be more clear
    await client.query(
      `UPDATE shipping_option 
       SET name = 'Standard Delivery (Cash on Delivery Available)'
       WHERE name = 'Cash on Delivery'`
    );
    
    console.log('✅ Updated shipping option name');
    console.log('Refresh checkout page now!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixShippingOptions();
