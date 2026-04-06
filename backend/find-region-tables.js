const { Client } = require('pg');

async function findRegionTables() {
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
    WHERE table_name LIKE '%region%'
  `);
  
  console.log('Region tables:', result.rows.map(r => r.table_name));
  
  await client.end();
}

findRegionTables();
