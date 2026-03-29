-- Check service zones and their geo coverage
SELECT 
    sz.id as service_zone_id,
    sz.name as service_zone_name,
    gz.country_code,
    gz.type as geo_type,
    fs.type as fulfillment_type
FROM service_zone sz
LEFT JOIN geo_zone gz ON gz.service_zone_id = sz.id
LEFT JOIN fulfillment_set fs ON sz.fulfillment_set_id = fs.id
ORDER BY sz.name, gz.country_code;

-- Check shipping options with their service zones
SELECT 
    so.id,
    so.name,
    so.service_zone_id,
    sz.name as service_zone_name,
    so.provider_id,
    so.price_type
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id;

-- Check if Egypt (eg) is covered
SELECT 
    gz.country_code,
    sz.name as service_zone_name,
    COUNT(so.id) as shipping_options_count
FROM geo_zone gz
LEFT JOIN service_zone sz ON gz.service_zone_id = sz.id
LEFT JOIN shipping_option so ON so.service_zone_id = sz.id
WHERE gz.country_code = 'eg'
GROUP BY gz.country_code, sz.name;
