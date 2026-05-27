#!/usr/bin/env node
/**
 * encode-db-password.js
 *
 * Encodes a database password so it's safe to use inside a DATABASE_URL.
 * Special characters like @ # % ! $ break URL parsers (Knex/pg) when
 * used raw in the connection string.
 *
 * Usage:
 *   node scripts/encode-db-password.js "MyP@ss#word$123"
 *
 * Output:
 *   Original : MyP@ss#word$123
 *   Encoded  : MyP%40ss%23word%24123
 *   Full URL : postgresql://USER:MyP%40ss%23word%24123@localhost:5432/DB
 */

const raw = process.argv[2]

if (!raw) {
  console.error('Usage: node scripts/encode-db-password.js "YOUR_PASSWORD"')
  process.exit(1)
}

const encoded = encodeURIComponent(raw)

console.log('')
console.log('Original :', raw)
console.log('Encoded  :', encoded)
console.log('')
console.log('Use the encoded version in DATABASE_URL:')
console.log(`  postgresql://USER:${encoded}@localhost:5432/DB_NAME`)
console.log('')

if (raw === encoded) {
  console.log('✅ No encoding needed — password has no special characters.')
} else {
  console.log('⚠  Password was changed. Use the ENCODED version in .env.production')
}
