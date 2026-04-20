const { Client } = require('pg');

async function revert() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mercurjs',
    user: 'postgres',
    password: '02486',
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Find our shipping option
    const res = await client.query(`SELECT id FROM shipping_option WHERE name = 'Cash on Delivery'`);
    if (res.rows.length === 0) {
      console.log('No such shipping option found.');
      return;
    }

    const soId = res.rows[0].id;
    console.log('Deleting shipping option:', soId);

    // Delete rule
    await client.query('DELETE FROM shipping_option_rule WHERE shipping_option_id = $1', [soId]);
    
    // Delete link to price set
    const sops = await client.query('DELETE FROM shipping_option_price_set WHERE shipping_option_id = $1 RETURNING price_set_id', [soId]);
    
    // Delete price
    for (const row of sops.rows) {
      await client.query('DELETE FROM price WHERE price_set_id = $1', [row.price_set_id]);
      await client.query('DELETE FROM price_set WHERE id = $1', [row.price_set_id]);
    }

    // Delete shipping option itself
    await client.query('DELETE FROM shipping_option WHERE id = $1', [soId]);

    console.log('Revert complete! The admin panel should work now.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

revert();
