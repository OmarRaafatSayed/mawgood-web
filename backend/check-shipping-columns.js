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
    WHERE table_name='shipping_option'
  `);
  
  console.log('shipping_option columns:', result.rows.map(r => r.column_name).join(', '));
  
  await client.end();
}

checkTables();
