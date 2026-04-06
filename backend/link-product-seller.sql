-- Link product to seller in Medusa v2
DO $$
DECLARE
    v_seller_id TEXT;
    v_product_id TEXT := 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
BEGIN
    -- Get seller ID
    SELECT id INTO v_seller_id FROM seller LIMIT 1;
    
    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION 'No seller found';
    END IF;
    
    -- Check if link table exists and link product to seller
    -- In Medusa v2, products are linked to sellers via link tables
    
    -- First, check the actual link table name
    SELECT table_name FROM information_schema.tables 
    WHERE table_name LIKE '%product%seller%' OR table_name LIKE '%seller%product%';
    
    RAISE NOTICE 'Seller ID: %', v_seller_id;
    RAISE NOTICE 'Product ID: %', v_product_id;
END $$;

-- Check existing link tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%link%' OR table_name LIKE '%product%' OR table_name LIKE '%seller%')
ORDER BY table_name;
