-- Check all product columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'product'
ORDER BY ordinal_position;

-- Check if there's metadata or additional_data
SELECT id, title, metadata
FROM product
WHERE id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
