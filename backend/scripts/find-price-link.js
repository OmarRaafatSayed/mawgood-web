const { Client } = require('pg')

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:02486@localhost:5432/mercurjs'
  })

  try {
    await client.connect()

    // Find all tables with price or variant in name
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      AND (table_name LIKE '%price%' OR table_name LIKE '%variant%')
      ORDER BY table_name
    `)
    
    console.log('Tables:')
    tables.rows.forEach(r => console.log(`  - ${r.table_name}`))
    console.log('')

    // Check product_variant_price_set link
    const linkCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'product_variant'
      AND column_name LIKE '%price%'
    `)
    
    console.log('Price-related columns in product_variant:')
    linkCheck.rows.forEach(r => console.log(`  - ${r.column_name}`))
    console.log('')

    // Sample join
    const sample = await client.query(`
      SELECT pv.id as variant_id, pv.sku, pv.product_id, p.handle, pr.amount, pr.currency_code
      FROM product_variant pv
      LEFT JOIN product p ON p.id = pv.product_id
      LEFT JOIN price_set ps ON ps.id = (
        SELECT price_set_id FROM product_variant_price_set WHERE variant_id = pv.id LIMIT 1
      )
      LEFT JOIN price pr ON pr.price_set_id = ps.id AND pr.currency_code = 'egp'
      WHERE p.handle LIKE '%hix001%'
      LIMIT 5
    `)
    
    console.log('Sample data for HIX001:')
    console.log(sample.rows)

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

main()
