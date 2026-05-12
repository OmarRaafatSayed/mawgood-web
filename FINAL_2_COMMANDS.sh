#!/bin/bash
# الحل النهائي - خطوتين فقط

echo "=== 1. تشغيل Admin Panel ==="
cd /var/www/mawgood-web/admin-panel
npm run build
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host
pm2 save

echo ""
echo "=== 2. نسخ صور المنتجات (486 صورة) ==="
mkdir -p /var/www/mawgood-web/backend/static/extracted-images
cp -r /var/www/mawgood-web/data-products/extracted-images/* /var/www/mawgood-web/backend/static/extracted-images/
echo "✅ تم نسخ $(ls -1 /var/www/mawgood-web/backend/static/extracted-images/ | wc -l) صورة"

echo ""
echo "=== 3. الحالة النهائية ==="
pm2 status

echo ""
echo "=== 4. اختبار المواقع ==="
echo "Backend API:"
curl -I http://api.mawgood.cloud/health 2>/dev/null | head -1

echo "Storefront:"
curl -I http://mawgood.cloud 2>/dev/null | head -1

echo "Admin:"
curl -I http://admin.mawgood.cloud 2>/dev/null | head -1

echo "Vendor:"
curl -I http://vendor.mawgood.cloud 2>/dev/null | head -1

echo ""
echo "✅ تم! الآن ثبت SSL:"
echo "sudo certbot --nginx -d api.mawgood.cloud"
echo "sudo certbot --nginx -d mawgood.cloud -d www.mawgood.cloud"
echo "sudo certbot --nginx -d admin.mawgood.cloud"
echo "sudo certbot --nginx -d vendor.mawgood.cloud"
