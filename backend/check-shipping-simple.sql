-- Simple fix: Just verify shipping options exist
SELECT 
    so.id,
    so.name,
    so.price_type,
    sz.name as service_zone_name,
    fs.type as fulfillment_type
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id
LEFT JOIN fulfillment_set fs ON sz.fulfillment_set_id = fs.id;

-- Check if we have any shipping options
SELECT COUNT(*) as shipping_options_count FROM shipping_option;
