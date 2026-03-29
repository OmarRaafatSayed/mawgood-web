-- Check if products are linked to shipping profiles
SELECT 
    p.id as product_id,
    p.title,
    pv.id as variant_id,
    sp.id as shipping_profile_id,
    sp.name as shipping_profile_name
FROM product p
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN product_shipping_profile psp ON p.id = psp.product_id
LEFT JOIN shipping_profile sp ON psp.profile_id = sp.id
WHERE p.id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ'
LIMIT 5;

-- Check shipping profiles
SELECT id, name, type FROM shipping_profile;

-- Check if shipping option has the right profile
SELECT 
    so.id,
    so.name,
    so.shipping_profile_id,
    sp.name as profile_name
FROM shipping_option so
LEFT JOIN shipping_profile sp ON so.shipping_profile_id = sp.id;
