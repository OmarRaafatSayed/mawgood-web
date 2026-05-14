#!/bin/bash

echo "=========================================="
echo "إصلاح مشكلة Admin Panel"
echo "=========================================="
echo ""

# الخطوة 1: التأكد من وجود مجلد dist
echo "1️⃣ التحقق من بناء Admin Panel..."
cd admin-panel

if [ ! -d "dist" ]; then
    echo "⚠️  مجلد dist غير موجود. جاري البناء..."
    
    # نسخ متغيرات البيئة للإنتاج
    cp ../PRODUCTION_ENV_ADMIN.env .env
    
    # تثبيت المكتبات
    echo "📦 تثبيت المكتبات..."
    yarn install --frozen-lockfile
    
    # بناء المشروع
    echo "🔨 بناء المشروع..."
    yarn build:preview
    
    if [ $? -ne 0 ]; then
        echo "❌ فشل البناء!"
        exit 1
    fi
    
    echo "✅ تم البناء بنجاح"
else
    echo "✅ مجلد dist موجود"
fi

cd ..

# الخطوة 2: إعادة تشغيل PM2
echo ""
echo "2️⃣ إعادة تشغيل Admin Panel في PM2..."
pm2 delete mawgood-admin 2>/dev/null || true
pm2 start ecosystem.config.js --only mawgood-admin

if [ $? -ne 0 ]; then
    echo "❌ فشل تشغيل PM2!"
    exit 1
fi

echo "✅ تم تشغيل Admin Panel"

# الخطوة 3: تحديث إعدادات Nginx
echo ""
echo "3️⃣ تحديث إعدادات Nginx..."

# إنشاء ملف nginx مؤقت
cat > /tmp/mawgood-admin-nginx.conf << 'EOF'
server {
    listen 80;
    server_name admin.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SPA fallback - handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:5173;
    }
}
EOF

# نسخ الملف إلى nginx
sudo cp /tmp/mawgood-admin-nginx.conf /etc/nginx/sites-available/mawgood-admin

# تفعيل الإعدادات
sudo ln -sf /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/

# اختبار nginx
echo "🔍 اختبار إعدادات Nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ خطأ في إعدادات Nginx!"
    exit 1
fi

# إعادة تحميل nginx
echo "🔄 إعادة تحميل Nginx..."
sudo systemctl reload nginx

echo "✅ تم تحديث Nginx"

# الخطوة 4: التحقق من الحالة
echo ""
echo "4️⃣ التحقق من الحالة..."
echo ""

# التحقق من PM2
echo "📊 حالة PM2:"
pm2 list | grep mawgood-admin

# التحقق من البورت
echo ""
echo "🔌 التحقق من البورت 5173:"
netstat -tlnp 2>/dev/null | grep 5173 || ss -tlnp | grep 5173

# اختبار الاتصال المحلي
echo ""
echo "🌐 اختبار الاتصال المحلي:"
curl -I http://localhost:5173 2>/dev/null | head -n 1

echo ""
echo "=========================================="
echo "✅ تم الإصلاح بنجاح!"
echo "=========================================="
echo ""
echo "📝 الخطوات التالية:"
echo "1. افتح المتصفح وادخل على: http://admin.mawgood.cloud"
echo "2. إذا كان يعمل، قم بتثبيت SSL:"
echo "   sudo certbot --nginx -d admin.mawgood.cloud"
echo ""
echo "🔍 للتحقق من اللوجات:"
echo "   pm2 logs mawgood-admin"
echo ""
