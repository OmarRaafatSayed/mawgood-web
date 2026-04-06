-- Link product to seller
INSERT INTO seller_seller_product_product (id, seller_id, product_id)
VALUES (
    'link_' || substr(md5(random()::text), 1, 26),
    (SELECT id FROM seller LIMIT 1),
    'prod_01KMBNR8QTZRD02HVWD50EVWBQ'
)
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
    s.name as seller_name,
    p.title as product_title,
    'Product is now linked to seller' as status
FROM seller_seller_product_product spp
JOIN seller s ON spp.seller_id = s.id
JOIN product p ON spp.product_id = p.id
WHERE p.id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';
