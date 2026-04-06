-- 1. Get the default stock location
DO $$
DECLARE
    v_location_id TEXT;
    v_fulfillment_set_id TEXT;
    v_service_zone_id TEXT;
    v_shipping_profile_id TEXT;
    v_shipping_option_id TEXT;
BEGIN
    -- Get first stock location
    SELECT id INTO v_location_id FROM stock_location LIMIT 1;
    
    IF v_location_id IS NULL THEN
        RAISE EXCEPTION 'No stock location found';
    END IF;
    
    RAISE NOTICE 'Using location: %', v_location_id;
    
    -- Get or create fulfillment set for shipping
    SELECT id INTO v_fulfillment_set_id 
    FROM fulfillment_set 
    WHERE location_id = v_location_id AND type = 'shipping'
    LIMIT 1;
    
    IF v_fulfillment_set_id IS NULL THEN
        INSERT INTO fulfillment_set (id, name, type, location_id, created_at, updated_at)
        VALUES (
            'fset_' || substr(md5(random()::text), 1, 26),
            'Shipping Fulfillment',
            'shipping',
            v_location_id,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_fulfillment_set_id;
        
        RAISE NOTICE 'Created fulfillment set: %', v_fulfillment_set_id;
    END IF;
    
    -- Get or create service zone for Egypt
    SELECT id INTO v_service_zone_id 
    FROM service_zone 
    WHERE fulfillment_set_id = v_fulfillment_set_id
    LIMIT 1;
    
    IF v_service_zone_id IS NULL THEN
        INSERT INTO service_zone (id, name, fulfillment_set_id, created_at, updated_at)
        VALUES (
            'serzo_' || substr(md5(random()::text), 1, 24),
            'Egypt & MENA',
            v_fulfillment_set_id,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_service_zone_id;
        
        RAISE NOTICE 'Created service zone: %', v_service_zone_id;
        
        -- Add Egypt and other MENA countries to geo_zone
        INSERT INTO geo_zone (id, type, country_code, service_zone_id, created_at, updated_at)
        VALUES 
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'eg', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'sa', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'ae', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'kw', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'qa', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'bh', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'om', v_service_zone_id, NOW(), NOW()),
            ('gz_' || substr(md5(random()::text), 1, 27), 'country', 'jo', v_service_zone_id, NOW(), NOW());
            
        RAISE NOTICE 'Added countries to geo zone';
    END IF;
    
    -- Get default shipping profile
    SELECT id INTO v_shipping_profile_id FROM shipping_profile WHERE name = 'Default' LIMIT 1;
    
    IF v_shipping_profile_id IS NULL THEN
        SELECT id INTO v_shipping_profile_id FROM shipping_profile LIMIT 1;
    END IF;
    
    IF v_shipping_profile_id IS NULL THEN
        RAISE EXCEPTION 'No shipping profile found';
    END IF;
    
    RAISE NOTICE 'Using shipping profile: %', v_shipping_profile_id;
    
    -- Delete existing shipping options for this service zone
    DELETE FROM shipping_option WHERE service_zone_id = v_service_zone_id;
    
    -- Create Cash on Delivery shipping option
    INSERT INTO shipping_option (
        id,
        name,
        price_type,
        service_zone_id,
        shipping_profile_id,
        provider_id,
        data,
        type,
        created_at,
        updated_at
    )
    VALUES (
        'so_' || substr(md5(random()::text), 1, 27),
        'Cash on Delivery',
        'flat',
        v_service_zone_id,
        v_shipping_profile_id,
        'manual',
        '{"id": "manual-fulfillment"}',
        'shipping',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_shipping_option_id;
    
    RAISE NOTICE 'Created shipping option: %', v_shipping_option_id;
    
    -- Add price for the shipping option (50 EGP)
    INSERT INTO shipping_option_rule (
        id,
        attribute,
        operator,
        value,
        shipping_option_id,
        created_at,
        updated_at
    )
    VALUES (
        'sor_' || substr(md5(random()::text), 1, 26),
        'enabled_in_store',
        'eq',
        'true',
        v_shipping_option_id,
        NOW(),
        NOW()
    );
    
    -- Add flat rate price
    INSERT INTO shipping_option_price (
        id,
        currency_code,
        amount,
        shipping_option_id,
        created_at,
        updated_at
    )
    VALUES (
        'soprice_' || substr(md5(random()::text), 1, 22),
        'egp',
        5000,
        v_shipping_option_id,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Added price 50 EGP for shipping option';
    
    RAISE NOTICE 'SUCCESS: Cash on Delivery shipping option created!';
END $$;

-- Verify the setup
SELECT 
    so.id,
    so.name,
    so.price_type,
    so.type,
    sz.name as service_zone,
    sp.name as shipping_profile,
    sop.currency_code,
    sop.amount / 100.0 as price
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id
LEFT JOIN shipping_profile sp ON so.shipping_profile_id = sp.id
LEFT JOIN shipping_option_price sop ON sop.shipping_option_id = so.id
WHERE so.name = 'Cash on Delivery';
