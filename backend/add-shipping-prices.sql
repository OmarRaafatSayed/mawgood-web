-- Add prices to shipping options
DO $$
DECLARE
    v_standard_shipping_id TEXT;
    v_express_shipping_id TEXT;
    v_region_id TEXT;
BEGIN
    -- Get shipping option IDs
    SELECT id INTO v_standard_shipping_id FROM shipping_option WHERE name = 'Standard Shipping' LIMIT 1;
    SELECT id INTO v_express_shipping_id FROM shipping_option WHERE name = 'Express Shipping' LIMIT 1;
    
    -- Get Arab Countries region ID
    SELECT id INTO v_region_id FROM region WHERE name = 'Arab Countries' LIMIT 1;
    
    -- Delete existing prices
    DELETE FROM price WHERE price_list_id IS NULL AND (
        currency_code = 'egp' OR region_id = v_region_id
    );
    
    -- Add prices for Standard Shipping
    INSERT INTO price (id, currency_code, amount, min_quantity, max_quantity, price_list_id, region_id, created_at, updated_at)
    VALUES 
    (
        'price_' || substr(md5(random()::text), 1, 26),
        'egp',
        50,
        NULL,
        NULL,
        NULL,
        v_region_id,
        NOW(),
        NOW()
    );
    
    -- Add prices for Express Shipping
    INSERT INTO price (id, currency_code, amount, min_quantity, max_quantity, price_list_id, region_id, created_at, updated_at)
    VALUES 
    (
        'price_' || substr(md5(random()::text), 1, 26),
        'egp',
        100,
        NULL,
        NULL,
        NULL,
        v_region_id,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Shipping prices added!';
    RAISE NOTICE 'Standard Shipping: % - 50 EGP', v_standard_shipping_id;
    RAISE NOTICE 'Express Shipping: % - 100 EGP', v_express_shipping_id;
END $$;

-- Verify prices
SELECT 
    p.id,
    p.currency_code,
    p.amount,
    p.region_id,
    r.name as region_name
FROM price p
LEFT JOIN region r ON p.region_id = r.id
WHERE p.currency_code = 'egp'
LIMIT 10;
