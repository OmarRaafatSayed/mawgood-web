-- Find all tables related to product and seller
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%product%seller%'
ORDER BY table_name;

-- Find all link tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'link_%'
ORDER BY table_name;

-- Check product table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product' 
AND column_name LIKE '%seller%';
