#!/bin/bash
# حل سريع لكل مشاكل السيرفر

echo "=== 1. تنظيف PM2 ==="
pm2 delete mawgood-storefront
pm2 delete mawgood-admin
pm2 save

echo "=== 2. إصلاح Storefront ==="
cd /var/www/mawgood-web/storefront
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build

echo "=== 3. إصلاح Admin ==="
cd /var/www/mawgood-web/admin-panel
npm run build

echo "=== 4. نسخ صور المنتجات ==="
mkdir -p /var/www/mawgood-web/backend/static/extracted-images
cp -r /var/www/mawgood-web/data-products/extracted-images/* /var/www/mawgood-web/backend/static/extracted-images/

echo "=== 5. تشغيل الخدمات ==="
cd /var/www/mawgood-web/storefront
pm2 start npm --name "mawgood-storefront" -- start

cd /var/www/mawgood-web/admin-panel
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host

pm2 save

echo "=== 6. إصلاح Nginx ==="
# حذف الملفات المكررة
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/mawgood
rm -f /etc/nginx/sites-available/mawgood

# التأكد من الروابط الصحيحة فقط
ln -sf /etc/nginx/sites-available/mawgood-api /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx

echo "=== 7. الحالة النهائية ==="
pm2 status
systemctl status nginx --no-pager

echo ""
echo "✅ تم الإصلاح! اختبر المواقع:"
echo "   Backend: https://api.mawgood.cloud/health"
echo "   Storefront: https://mawgood.cloud"
echo "   Admin: https://admin.mawgood.cloud"
echo "   Vendor: https://vendor.mawgood.cloud"
