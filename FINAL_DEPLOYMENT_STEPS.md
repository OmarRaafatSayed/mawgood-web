# خطوات النشر النهائية - تنفيذ مباشر

## 🎯 الهدف
إصلاح جميع المشاكل وتشغيل الموقع بالكامل

---

## ⚡ الأوامر السريعة (نفذها بالترتيب)

### 1️⃣ تنظيف PM2
```bash
pm2 delete mawgood-storefront
pm2 delete mawgood-admin
pm2 save
```

### 2️⃣ إصلاح Storefront (المشكلة الرئيسية)
```bash
cd /var/www/mawgood-web/storefront
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
pm2 start npm --name "mawgood-storefront" -- start
```

### 3️⃣ إصلاح Admin Panel
```bash
cd /var/www/mawgood-web/admin-panel
npm run build
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host
pm2 save
```

### 4️⃣ نسخ صور المنتجات (486 صورة)
```bash
mkdir -p /var/www/mawgood-web/backend/static/extracted-images
cp -r /var/www/mawgood-web/data-products/extracted-images/* /var/www/mawgood-web/backend/static/extracted-images/
ls -la /var/www/mawgood-web/backend/static/extracted-images/ | wc -l
```

### 5️⃣ إصلاح Nginx (حذف التكرار)
```bash
# حذف الملفات المكررة
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/mawgood
sudo rm -f /etc/nginx/sites-available/mawgood

# إنشاء الملفات الصحيحة
sudo tee /etc/nginx/sites-available/mawgood-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.mawgood.cloud;
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /static/ {
        alias /var/www/mawgood-web/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo tee /etc/nginx/sites-available/mawgood-storefront > /dev/null <<'EOF'
server {
    listen 80;
    server_name mawgood.cloud www.mawgood.cloud;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo tee /etc/nginx/sites-available/mawgood-admin > /dev/null <<'EOF'
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
    }
}
EOF

sudo tee /etc/nginx/sites-available/mawgood-vendor > /dev/null <<'EOF'
server {
    listen 80;
    server_name vendor.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# تفعيل الإعدادات
sudo ln -sf /etc/nginx/sites-available/mawgood-api /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/

# اختبار وإعادة تحميل
sudo nginx -t
sudo systemctl reload nginx
```

### 6️⃣ التحقق من الحالة
```bash
pm2 status
sudo systemctl status nginx --no-pager
```

### 7️⃣ اختبار المواقع
```bash
curl -I http://api.mawgood.cloud/health
curl -I http://mawgood.cloud
curl -I http://admin.mawgood.cloud
curl -I http://vendor.mawgood.cloud
```

### 8️⃣ تثبيت SSL (بعد التأكد من عمل HTTP)
```bash
sudo certbot --nginx -d api.mawgood.cloud
sudo certbot --nginx -d mawgood.cloud -d www.mawgood.cloud
sudo certbot --nginx -d admin.mawgood.cloud
sudo certbot --nginx -d vendor.mawgood.cloud
```

---

## 📊 النتيجة المتوقعة

### PM2 Status
```
┌────┬────────────────────────┬─────────┬─────────┬──────────┬────────┐
│ id │ name                   │ mode    │ pid     │ status   │ uptime │
├────┼────────────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0  │ mawgood-backend        │ fork    │ 55221   │ online   │ 30m    │
│ 1  │ mawgood-storefront     │ fork    │ XXXXX   │ online   │ 5m     │
│ 2  │ mawgood-admin          │ fork    │ XXXXX   │ online   │ 5m     │
│ 3  │ mawgood-vendor         │ fork    │ 54426   │ online   │ 35m    │
└────┴────────────────────────┴─────────┴─────────┴──────────┴────────┘
```

### المواقع
- ✅ Backend: https://api.mawgood.cloud/health
- ✅ Storefront: https://mawgood.cloud
- ✅ Admin: https://admin.mawgood.cloud
- ✅ Vendor: https://vendor.mawgood.cloud

---

## 🔑 المعلومات المهمة

### Publishable Key
```
pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53
```

### Backend URLs
```
MEDUSA_BACKEND_URL=https://api.mawgood.cloud
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.mawgood.cloud
```

### Database
```
Database: mawgood_db
User: mawgood_user
Password: Dawoodd!@#0123$%
```

---

## 🚨 ملاحظات مهمة

1. **Storefront**: يحتاج `--legacy-peer-deps` بسبب تعارض React 19 مع `@medusajs/ui@4.0.33`
2. **صور المنتجات**: 486 صورة في `backend/static/extracted-images/`
3. **Nginx**: تم حذف الملفات المكررة لحل مشكلة "conflicting server name"
4. **PM2**: تم حذف الـ entries المكررة للـ Admin
5. **SSL**: يتم تثبيته بعد التأكد من عمل HTTP بشكل صحيح

---

## 📁 الملفات المرجعية

- `COPY_PASTE_ENV_VALUES.txt` - جميع قيم البيئة
- `COMMANDS_TO_RUN.txt` - جميع الأوامر بالتفصيل
- `NGINX_CONFIGS_FINAL.md` - إعدادات Nginx الكاملة
