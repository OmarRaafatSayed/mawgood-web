-- Link product to seller
DO $$
DECLARE
    v_seller_id TEXT;
    v_product_id TEXT := 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
BEGIN
    -- Get seller ID
    SELECT id INTO v_seller_id FROM seller LIMIT 1;
    
    -- Delete existing link if any
    DELETE FROM seller_seller_product_product WHERE product_id = v_product_id;
    
    -- Create new link
    INSERT INTO seller_seller_product_product (id, seller_id, product_id)
    VALUES ('link_' || substr(md5(random()::text), 1, 26), v_seller_id, v_product_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Product linked to seller: %', v_seller_id;
END $$;

-- Verify the link
SELECT 
    s.id as seller_id,
    s.name as seller_name,
    p.id as product_id,
    p.title as product_title
FROM seller_seller_product_product spp
LEFT JOIN seller s ON spp.seller_id = s.id
LEFT JOIN product p ON spp.product_id = p.id
WHERE p.id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
