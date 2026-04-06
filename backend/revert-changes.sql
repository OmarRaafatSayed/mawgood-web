-- Unlink product from seller
DELETE FROM seller_seller_product_product 
WHERE product_id = 'prod_01KMBNR8QTZRD02HVWD50EVWBQ';

SELECT 'Product unlinked from seller' as status;
