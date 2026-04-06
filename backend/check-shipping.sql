-- Check shipping options and service zones
SELECT 
  so.id as shipping_option_id,
  so.name as shipping_option_name,
  so.service_zone_id,
  sz.name as service_zone_name,
  sz.fulfillment_set_id,
  fs.type as fulfillment_type
FROM shipping_option so
LEFT JOIN service_zone sz ON so.service_zone_id = sz.id
LEFT JOIN fulfillment_set fs ON sz.fulfillment_set_id = fs.id;

-- Check geo zones (countries covered)
SELECT 
  gz.id,
  gz.type,
  gz.country_code,
  gz.service_zone_id,
  sz.name as service_zone_name
FROM geo_zone gz
LEFT JOIN service_zone sz ON gz.service_zone_id = sz.id
WHERE gz.country_code IN ('eg', 'sa', 'ae', 'kw', 'qa', 'bh', 'om', 'jo');
