const { Client } = require('pg');

async function findPriceTables() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mercurjs',
    user: 'postgres',
    password: '02486',
  });

  await client.connect();
  
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%price%' OR table_name LIKE '%shipping%'
  `);
  
  console.log('Tables:', result.rows.map(r => r.table_name));
  
  await client.end();
}

findPriceTables();
