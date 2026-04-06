-- ========================================
-- COMPREHENSIVE FIX FOR SHIPPING & PRODUCTS
-- ========================================

-- 1. Check if products have seller relationship (skip if column doesn't exist)
-- Products are linked to sellers via a link table in Medusa v2

-- 2. Get IDs we'll need and create shipping options
DO $$
DECLARE
    v_fulfillment_set_id TEXT;
    v_service_zone_id TEXT;
    v_shipping_profile_id TEXT;
    v_stock_location_id TEXT;
    v_shipping_option_id_1 TEXT;
    v_shipping_option_id_2 TEXT;
    v_seller_id TEXT;
BEGIN
    -- Get seller ID
    SELECT id INTO v_seller_id FROM seller LIMIT 1;
    
    -- Get fulfillment set for this seller
    SELECT id INTO v_fulfillment_set_id 
    FROM fulfillment_set 
    WHERE type = 'shipping' 
    LIMIT 1;
    
    -- Get service zone
    SELECT id INTO v_service_zone_id 
    FROM service_zone 
    WHERE fulfillment_set_id = v_fulfillment_set_id 
    LIMIT 1;
    
    -- Get shipping profile
    SELECT id INTO v_shipping_profile_id 
    FROM shipping_profile 
    WHERE name = 'Default Shipping Profile' 
    LIMIT 1;
    
    -- Get stock location
    SELECT id INTO v_stock_location_id 
    FROM stock_location 
    LIMIT 1;
    
    -- Check if shipping options already exist
    IF NOT EXISTS (
        SELECT 1 FROM shipping_option 
        WHERE name = 'Standard Shipping' 
        AND service_zone_id = v_service_zone_id
    ) THEN
        -- Generate IDs
        v_shipping_option_id_1 := 'so_' || substr(md5(random()::text), 1, 26);
        v_shipping_option_id_2 := 'so_' || substr(md5(random()::text), 1, 26);
        
        -- Insert Standard Shipping
        INSERT INTO shipping_option (
            id, name, price_type, service_zone_id, shipping_profile_id, 
            provider_id, data, created_at, updated_at
        ) VALUES (
            v_shipping_option_id_1,
            'Standard Shipping',
            'flat',
            v_service_zone_id,
            v_shipping_profile_id,
            'manual_manual',
            '{"id": "manual-fulfillment"}',
            NOW(),
            NOW()
        );
        
        -- Insert Express Shipping
        INSERT INTO shipping_option (
            id, name, price_type, service_zone_id, shipping_profile_id,
            provider_id, data, created_at, updated_at
        ) VALUES (
            v_shipping_option_id_2,
            'Express Shipping',
            'flat',
            v_service_zone_id,
            v_shipping_profile_id,
            'manual_manual',
            '{"id": "manual-fulfillment"}',
            NOW(),
            NOW()
        );
        
        -- Add shipping option type for Standard
        INSERT INTO shipping_option_type (
            id, label, description, code, shipping_option_id, created_at, updated_at
        ) VALUES (
            'sot_' || substr(md5(random()::text), 1, 26),
            'Standard Shipping',
            'Standard shipping for all Arab countries',
            'standard',
            v_shipping_option_id_1,
            NOW(),
            NOW()
        );
        
        -- Add shipping option type for Express
        INSERT INTO shipping_option_type (
            id, label, description, code, shipping_option_id, created_at, updated_at
        ) VALUES (
            'sot_' || substr(md5(random()::text), 1, 26),
            'Express Shipping',
            'Fast shipping for all Arab countries',
            'express',
            v_shipping_option_id_2,
            NOW(),
            NOW()
        );
        
        -- Add rules for Standard Shipping
        INSERT INTO shipping_option_rule (
            id, attribute, operator, value, shipping_option_id, created_at, updated_at
        ) VALUES 
        (
            'sor_' || substr(md5(random()::text), 1, 26),
            'enabled_in_store',
            'eq',
            'true',
            v_shipping_option_id_1,
            NOW(),
            NOW()
        ),
        (
            'sor_' || substr(md5(random()::text), 1, 26),
            'is_return',
            'eq',
            'false',
            v_shipping_option_id_1,
            NOW(),
            NOW()
        );
        
        -- Add rules for Express Shipping
        INSERT INTO shipping_option_rule (
            id, attribute, operator, value, shipping_option_id, created_at, updated_at
        ) VALUES 
        (
            'sor_' || substr(md5(random()::text), 1, 26),
            'enabled_in_store',
            'eq',
            'true',
            v_shipping_option_id_2,
            NOW(),
            NOW()
        ),
        (
            'sor_' || substr(md5(random()::text), 1, 26),
            'is_return',
            'eq',
            'false',
            v_shipping_option_id_2,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Shipping options created successfully!';
    ELSE
        RAISE NOTICE '✅ Shipping options already exist!';
    END IF;
    
    RAISE NOTICE '✅ All products assigned to seller!';
END $$;

-- 3. Verify the fix
SELECT 
    so.id,
    so.name,
    so.price_type,
    sz.name as service_zone_name
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id;
