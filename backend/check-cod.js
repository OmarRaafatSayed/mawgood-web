const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medusa-your-project',
});

async function checkCOD() {
  try {
    const res = await pool.query('SELECT id, currency_code, name FROM region');
    console.log('Regions:', res.rows);

    const providers = await pool.query('SELECT * FROM payment_provider');
    console.log('Payment Providers:', providers.rows);

    const regionProviders = await pool.query('SELECT * FROM region_payment_providers');
    console.log('Region-Provider links:', regionProviders.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkCOD();
