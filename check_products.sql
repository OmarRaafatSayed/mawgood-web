-- سكريبت للتحقق من المنتجات في Database
-- Product Verification Script

-- 1. عرض جميع المنتجات مع حالتها
SELECT 
    id,
    title,
    status,
    created_at
FROM product
ORDER BY created_at DESC;

-- 2. عرض المنتجات مع الـ Variants والأسعار
SELECT 
    p.id as product_id,
    p.title as product_name,
    p.status,
    v.id as variant_id,
    v.title as variant_name,
    v.inventory_quantity,
    v.sku,
    ma.amount as price,
    ma.currency_code
FROM product p
LEFT JOIN product_variant v ON p.id = v.product_id
LEFT JOIN price_set ps ON v.price_set_id = ps.id
LEFT JOIN money_amount ma ON ps.id = ma.price_set_id
ORDER BY p.created_at DESC;

-- 3. عرض المنتجات مع الـ Sellers
SELECT 
    p.id as product_id,
    p.title as product_name,
    p.status,
    s.id as seller_id,
    s.store_name,
    s.store_status
FROM product p
LEFT JOIN seller s ON p.seller_id = s.id
ORDER BY p.created_at DESC;

-- 4. عرض المنتجات المتاحة في Regions
SELECT 
    p.id as product_id,
    p.title as product_name,
    r.id as region_id,
    r.name as region_name,
    r.currency_code
FROM product p
JOIN product_sales_channel psc ON p.id = psc.product_id
JOIN sales_channel sc ON psc.sales_channel_id = sc.id
JOIN region r ON sc.id IN (
    SELECT sales_channel_id FROM region WHERE id = r.id
)
ORDER BY p.created_at DESC;

-- 5. عرض المنتجات التي يجب أن تظهر في Storefront
-- (Published + Has Seller + Has Price + Has Inventory)
SELECT 
    p.id,
    p.title,
    p.status,
    s.store_name as seller,
    s.store_status,
    v.inventory_quantity,
    ma.amount as price,
    ma.currency_code
FROM product p
JOIN seller s ON p.seller_id = s.id
JOIN product_variant v ON p.id = v.product_id
JOIN price_set ps ON v.price_set_id = ps.id
JOIN money_amount ma ON ps.id = ma.price_set_id
WHERE 
    p.status = 'published'
    AND s.store_status = 'ACTIVE'
    AND v.inventory_quantity > 0
    AND ma.amount IS NOT NULL
ORDER BY p.created_at DESC;

-- 6. عرض المنتجات التي لا تظهر مع السبب
SELECT 
    p.id,
    p.title,
    CASE 
        WHEN p.status != 'published' THEN 'Not Published'
        WHEN s.id IS NULL THEN 'No Seller'
        WHEN s.store_status != 'ACTIVE' THEN 'Seller Suspended'
        WHEN v.id IS NULL THEN 'No Variant'
        WHEN ma.amount IS NULL THEN 'No Price'
        WHEN v.inventory_quantity <= 0 THEN 'No Inventory'
        ELSE 'Unknown Issue'
    END as reason
FROM product p
LEFT JOIN seller s ON p.seller_id = s.id
LEFT JOIN product_variant v ON p.id = v.product_id
LEFT JOIN price_set ps ON v.price_set_id = ps.id
LEFT JOIN money_amount ma ON ps.id = ma.price_set_id
WHERE 
    p.status != 'published'
    OR s.id IS NULL
    OR s.store_status != 'ACTIVE'
    OR v.id IS NULL
    OR ma.amount IS NULL
    OR v.inventory_quantity <= 0
ORDER BY p.created_at DESC;

-- 7. إحصائيات المنتجات
SELECT 
    COUNT(*) as total_products,
    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_products,
    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_products,
    SUM(CASE WHEN seller_id IS NOT NULL THEN 1 ELSE 0 END) as products_with_seller
FROM product;

-- 8. عرض الـ Regions المتاحة
SELECT 
    id,
    name,
    currency_code,
    created_at
FROM region
ORDER BY created_at DESC;

-- 9. عرض الـ Sellers النشطين
SELECT 
    id,
    store_name,
    store_status,
    created_at,
    (SELECT COUNT(*) FROM product WHERE seller_id = s.id) as product_count
FROM seller s
ORDER BY created_at DESC;

-- 10. تحديث جميع المنتجات لتكون Published (استخدم بحذر!)
-- UPDATE product SET status = 'published' WHERE status = 'draft';

-- 11. تحديث جميع الـ Sellers لتكون Active (استخدم بحذر!)
-- UPDATE seller SET store_status = 'ACTIVE' WHERE store_status = 'SUSPENDED';
