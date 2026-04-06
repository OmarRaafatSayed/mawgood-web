-- Link all inventory items to the stock location
INSERT INTO inventory_level (
    id,
    inventory_item_id,
    location_id,
    stocked_quantity,
    reserved_quantity,
    incoming_quantity,
    created_at,
    updated_at
)
SELECT 
    'invlvl_' || substr(md5(random()::text || ii.id), 1, 24),
    ii.id,
    (SELECT id FROM stock_location LIMIT 1),
    100,
    0,
    0,
    NOW(),
    NOW()
FROM inventory_item ii
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_level il 
    WHERE il.inventory_item_id = ii.id
);

-- Verify
SELECT 
    il.id,
    il.inventory_item_id,
    il.location_id,
    il.stocked_quantity,
    sl.name as location_name
FROM inventory_level il
LEFT JOIN stock_location sl ON il.location_id = sl.id
LIMIT 10;
