-- ========================================
-- COMPLETE DATABASE FIX FOR SHIPPING
-- ========================================

-- Step 1: Drop and recreate database (run this separately if needed)
-- DROP DATABASE IF EXISTS mercurjs;
-- CREATE DATABASE mercurjs;

-- Step 2: Clear all shipping-related data (in correct order)
DELETE FROM shipping_option_rule;
DELETE FROM shipping_option;
DELETE FROM shipping_option_type;
DELETE FROM geo_zone;
DELETE FROM service_zone;
DELETE FROM fulfillment_set WHERE type = 'shipping' AND name != 'Default Fulfillment Set';
DELETE FROM inventory_level WHERE location_id NOT IN (SELECT id FROM stock_location);

-- Step 3: Recreate fulfillment set
INSERT INTO fulfillment_set (id, name, type, created_at, updated_at)
VALUES (
    'fset_' || substr(md5(random()::text), 1, 26),
    'Default Fulfillment Set',
    'shipping',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Step 4: Create service zone
INSERT INTO service_zone (id, name, fulfillment_set_id, created_at, updated_at)
SELECT 
    'serzo_' || substr(md5(random()::text), 1, 26),
    'All Arab Countries',
    id,
    NOW(),
    NOW()
FROM fulfillment_set
WHERE type = 'shipping'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 5: Add geo zones for Arab countries
INSERT INTO geo_zone (id, type, country_code, service_zone_id, created_at, updated_at)
SELECT 
    'gz_' || substr(md5(random()::text || country), 1, 26),
    'country',
    country,
    (SELECT id FROM service_zone WHERE name = 'All Arab Countries' LIMIT 1),
    NOW(),
    NOW()
FROM (VALUES ('eg'), ('sa'), ('ae'), ('kw'), ('qa'), ('bh'), ('om'), ('jo')) AS countries(country)
ON CONFLICT DO NOTHING;

-- Step 6: Create shipping options with proper structure
DO $$
DECLARE
    v_service_zone_id TEXT;
    v_shipping_profile_id TEXT;
    v_shipping_option_id_1 TEXT;
    v_shipping_option_id_2 TEXT;
    v_shipping_option_type_id_1 TEXT;
    v_shipping_option_type_id_2 TEXT;
BEGIN
    -- Get IDs
    SELECT id INTO v_service_zone_id FROM service_zone WHERE name = 'All Arab Countries' LIMIT 1;
    SELECT id INTO v_shipping_profile_id FROM shipping_profile WHERE name = 'Default Shipping Profile' LIMIT 1;
    
    -- Generate new IDs
    v_shipping_option_id_1 := 'so_' || substr(md5(random()::text), 1, 26);
    v_shipping_option_id_2 := 'so_' || substr(md5(random()::text), 1, 26);
    v_shipping_option_type_id_1 := 'sotype_' || substr(md5(random()::text), 1, 26);
    v_shipping_option_type_id_2 := 'sotype_' || substr(md5(random()::text), 1, 26);
    
    -- Create shipping option types first
    INSERT INTO shipping_option_type (id, label, description, code, created_at, updated_at)
    VALUES 
    (v_shipping_option_type_id_1, 'Standard Shipping', 'Standard delivery', 'standard', NOW(), NOW()),
    (v_shipping_option_type_id_2, 'Express Shipping', 'Fast delivery', 'express', NOW(), NOW());
    
    -- Create shipping options
    INSERT INTO shipping_option (
        id, name, price_type, service_zone_id, shipping_profile_id,
        shipping_option_type_id, provider_id, data, created_at, updated_at
    ) VALUES 
    (
        v_shipping_option_id_1,
        'Standard Shipping',
        'flat',
        v_service_zone_id,
        v_shipping_profile_id,
        v_shipping_option_type_id_1,
        'manual_manual',
        '{"id": "manual-fulfillment"}',
        NOW(),
        NOW()
    ),
    (
        v_shipping_option_id_2,
        'Express Shipping',
        'flat',
        v_service_zone_id,
        v_shipping_profile_id,
        v_shipping_option_type_id_2,
        'manual_manual',
        '{"id": "manual-fulfillment"}',
        NOW(),
        NOW()
    );
    
    -- Add rules
    INSERT INTO shipping_option_rule (id, attribute, operator, value, shipping_option_id, created_at, updated_at)
    VALUES 
    ('sor_' || substr(md5(random()::text), 1, 26), 'enabled_in_store', 'eq', 'true', v_shipping_option_id_1, NOW(), NOW()),
    ('sor_' || substr(md5(random()::text), 1, 26), 'is_return', 'eq', 'false', v_shipping_option_id_1, NOW(), NOW()),
    ('sor_' || substr(md5(random()::text), 1, 26), 'enabled_in_store', 'eq', 'true', v_shipping_option_id_2, NOW(), NOW()),
    ('sor_' || substr(md5(random()::text), 1, 26), 'is_return', 'eq', 'false', v_shipping_option_id_2, NOW(), NOW());
    
    RAISE NOTICE '✅ Shipping options created successfully!';
END $$;

-- Step 7: Link inventory items to stock location
INSERT INTO inventory_level (
    id, inventory_item_id, location_id, stocked_quantity, 
    reserved_quantity, incoming_quantity, created_at, updated_at
)
SELECT 
    'invlvl_' || substr(md5(random()::text || ii.id), 1, 24),
    ii.id,
    (SELECT id FROM stock_location LIMIT 1),
    100, 0, 0, NOW(), NOW()
FROM inventory_item ii
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_level il WHERE il.inventory_item_id = ii.id
)
ON CONFLICT DO NOTHING;

-- Step 8: Verify everything
SELECT '=== SHIPPING OPTIONS ===' as info;
SELECT so.id, so.name, so.price_type, sz.name as service_zone
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id;

SELECT '=== GEO ZONES ===' as info;
SELECT gz.country_code, sz.name as service_zone
FROM geo_zone gz
LEFT JOIN service_zone sz ON gz.service_zone_id = sz.id
WHERE gz.country_code IN ('eg', 'sa', 'ae');

SELECT '=== INVENTORY LEVELS ===' as info;
SELECT COUNT(*) as total_inventory_items_with_stock
FROM inventory_level;
