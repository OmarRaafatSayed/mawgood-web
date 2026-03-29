const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mercurjs',
    user: 'postgres',
    password: '02486',
  });

  await client.connect();
  
  const result = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='fulfillment_set'
  `);
  
  console.log('fulfillment_set columns:', result.rows);
  
  await client.end();
}

checkTables();
