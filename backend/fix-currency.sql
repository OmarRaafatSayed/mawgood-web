-- Remove all currencies except EGP
DELETE FROM store_currency WHERE currency_code != 'egp';

-- Add EGP to store if not exists
INSERT INTO store_currency (store_id, currency_code)
SELECT id, 'egp' FROM store
WHERE NOT EXISTS (
  SELECT 1 FROM store_currency 
  WHERE store_id = store.id AND currency_code = 'egp'
);

-- Add prices for xxx product variants
INSERT INTO price (id, currency_code, amount, variant_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'egp', 50000, 'variant_01KMBNR8VE1A7Q6Y6ZM04AG307', NOW(), NOW()),
  (gen_random_uuid(), 'egp', 50000, 'variant_01KMBNR8VEDHJ8YHZK8Y4FJBVM', NOW(), NOW())
ON CONFLICT DO NOTHING;
