const { Pool } = require('pg');
require('dotenv').config();

async function getPublishableKey() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:02486@localhost:5432/mercurjs',
  });

  try {
    const result = await pool.query(
      "SELECT id, token, title FROM api_key WHERE type='publishable' AND revoked_at IS NULL LIMIT 1"
    );
    
    if (result.rows.length > 0) {
      console.log('Found publishable key:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('No publishable key found. Please run the seed script.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

getPublishableKey();
