#!/bin/bash

echo "=========================================="
echo "تشغيل Admin Panel بسرعة"
echo "=========================================="

cd /var/www/mawgood-web

# 1. تحديث الكود
echo "1️⃣ تحديث الكود..."
git pull origin main

# 2. التحقق من البناء
echo "2️⃣ التحقق من البناء..."
if [ ! -d "admin-panel/dist" ] || [ ! -f "admin-panel/dist/index.html" ]; then
    echo "⚠️  البناء مش موجود - جاري البناء..."
    cd admin-panel
    cp ../PRODUCTION_ENV_ADMIN.env .env
    yarn install --frozen-lockfile
    yarn build:preview
    cd ..
    echo "✅ تم البناء"
else
    echo "✅ البناء موجود"
fi

# 3. إيقاف العملية القديمة
echo "3️⃣ إيقاف العملية القديمة..."
pm2 delete mawgood-admin 2>/dev/null || true

# 4. تشغيل العملية الجديدة
echo "4️⃣ تشغيل Admin Panel..."
pm2 start ecosystem.config.js --only mawgood-admin

# 5. حفظ الإعدادات
pm2 save

# 6. التحقق من الحالة
echo ""
echo "=========================================="
echo "✅ تم التشغيل!"
echo "=========================================="
echo ""
pm2 list | grep admin
echo ""
echo "🔍 اختبار البورت:"
curl -I http://localhost:5173 2>/dev/null | head -n 1
echo ""
echo "📝 لمشاهدة اللوجات:"
echo "   pm2 logs mawgood-admin"
echo ""
