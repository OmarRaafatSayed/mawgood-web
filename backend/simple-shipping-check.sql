-- Check shipping profiles
SELECT id, name, type FROM shipping_profile;

-- Check shipping options
SELECT 
    so.id,
    so.name,
    so.shipping_profile_id,
    so.service_zone_id,
    so.provider_id
FROM shipping_option so;

-- Check if product variants have inventory
SELECT 
    pv.id as variant_id,
    pv.title,
    pv.product_id,
    ii.id as inventory_item_id,
    il.stocked_quantity
FROM product_variant pv
LEFT JOIN inventory_item ii ON pv.id = ii.variant_id
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id
WHERE pv.product_id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
