# 🚀 دليل النشر السريع - Hostinger

**النطاق:** mawgood.cloud  
**التاريخ:** 11 مايو 2026

---

## ✅ الملفات الجاهزة للنسخ

لقد أنشأت لك 4 ملفات `.env` جاهزة:

1. **PRODUCTION_ENV_BACKEND.env** → انسخه إلى `backend/.env`
2. **PRODUCTION_ENV_STOREFRONT.env** → انسخه إلى `storefront/.env.production`
3. **PRODUCTION_ENV_ADMIN.env** → انسخه إلى `admin-panel/.env.production`
4. **PRODUCTION_ENV_VENDOR.env** → انسخه إلى `vendor-panel/.env.production`

---

## 🔧 التحسينات المضافة

### 1. ✅ CORS محسّن
```env
# قبل
STORE_CORS=https://mawgood.cloud

# بعد (✅ أفضل)
STORE_CORS=https://mawgood.cloud,https://www.mawgood.cloud
ADMIN_CORS=https://admin.mawgood.cloud,https://mawgood.cloud
VENDOR_CORS=https://vendor.mawgood.cloud,https://mawgood.cloud
AUTH_CORS=https://mawgood.cloud,https://www.mawgood.cloud,https://admin.mawgood.cloud,https://vendor.mawgood.cloud
```

### 2. ✅ URLs محدثة
```env
# استخدام النطاق الفعلي
MEDUSA_BACKEND_URL=https://api.mawgood.cloud
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.mawgood.cloud
```

### 3. ✅ إعدادات إضافية
- `ADMIN_EMAIL` و `ADMIN_PASSWORD` للدخول الأول
- `SESSION_SECRET` لحماية الجلسات
- `RATE_LIMIT_ENABLED` للحماية من الهجمات
- `LOG_LEVEL` للتسجيل
- `DEFAULT_REGION=eg` و `DEFAULT_CURRENCY=EGP`

---

## 📋 خطوات النشر السريعة

### 1. على السيرفر - سحب الكود

```bash
ssh your-username@your-server-ip
cd /path/to/MawgoodWep
git pull origin main
```

### 2. نسخ ملفات .env

```bash
# Backend
cp PRODUCTION_ENV_BACKEND.env backend/.env

# Storefront
cp PRODUCTION_ENV_STOREFRONT.env storefront/.env.production

# Admin Panel
cp PRODUCTION_ENV_ADMIN.env admin-panel/.env.production

# Vendor Panel
cp PRODUCTION_ENV_VENDOR.env vendor-panel/.env.production
```

### 3. ⚠️ مهم جداً - نسخ الصور

```bash
mkdir -p backend/static/extracted-images
cp -r data-products/extracted-images/* backend/static/extracted-images/
ls backend/static/extracted-images/ | wc -l  # يجب أن يظهر: 486
```

### 4. بناء Backend

```bash
cd backend
npm install
npm run build
npm run db:migrate
pm2 start npm --name "mawgood-backend" -- start
```

### 5. بناء Storefront

```bash
cd ../storefront
npm install
npm run build
pm2 start npm --name "mawgood-storefront" -- start
```

### 6. بناء Admin Panel

```bash
cd ../admin-panel
npm install
npm run build
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173
```

### 7. بناء Vendor Panel

```bash
cd ../vendor-panel
npm install
npm run build
pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174
```

### 8. حفظ PM2

```bash
pm2 save
pm2 startup
```

---

## ✅ التحقق من التشغيل

```bash
# حالة PM2
pm2 status

# Backend
curl http://localhost:9000/health

# الصور
ls backend/static/extracted-images/ | wc -l  # يجب: 486

# المنتجات
curl http://localhost:9000/store/products | jq '.products | length'
```

---

## 🌐 إعداد Nginx

### ملف Backend (api.mawgood.cloud)

```nginx
server {
    listen 80;
    server_name api.mawgood.cloud;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        add_header 'Access-Control-Allow-Origin' 'https://mawgood.cloud' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, x-publishable-api-key' always;
    }

    # Static files (images)
    location /static/ {
        alias /path/to/MawgoodWep/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' '*' always;
    }
}
```

### ملف Storefront (mawgood.cloud)

```nginx
server {
    listen 80;
    server_name mawgood.cloud www.mawgood.cloud;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### ملف Admin Panel (admin.mawgood.cloud)

```nginx
server {
    listen 80;
    server_name admin.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### ملف Vendor Panel (vendor.mawgood.cloud)

```nginx
server {
    listen 80;
    server_name vendor.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### تفعيل المواقع

```bash
# إنشاء الملفات
sudo nano /etc/nginx/sites-available/mawgood-api
sudo nano /etc/nginx/sites-available/mawgood-storefront
sudo nano /etc/nginx/sites-available/mawgood-admin
sudo nano /etc/nginx/sites-available/mawgood-vendor

# تفعيلها
sudo ln -s /etc/nginx/sites-available/mawgood-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/

# اختبار وإعادة تحميل
sudo nginx -t
sudo systemctl reload nginx
```

### تثبيت SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mawgood.cloud -d www.mawgood.cloud
sudo certbot --nginx -d api.mawgood.cloud
sudo certbot --nginx -d admin.mawgood.cloud
sudo certbot --nginx -d vendor.mawgood.cloud
```

---

## 🔒 فحص الأمان

```bash
# تحقق من Secrets
cd backend
grep -E "JWT_SECRET|COOKIE_SECRET" .env
# يجب أن ترى: Daw2@3#4$ood_Nada

# تحقق من CORS
grep "STORE_CORS" .env
# يجب أن ترى: https://mawgood.cloud

# تحقق من NODE_ENV
grep "NODE_ENV" .env
# يجب أن ترى: production
```

---

## 📊 مراقبة

```bash
# Logs
pm2 logs

# Monitoring
pm2 monit

# Restart if needed
pm2 restart all
```

---

## ⚠️ ملاحظات مهمة

### 1. قاعدة البيانات
تأكد من أن قاعدة البيانات موجودة:
```bash
psql -U mawgood_user -d mawgood_db -h localhost
```

إذا لم تكن موجودة، أنشئها:
```bash
sudo -u postgres psql
CREATE DATABASE mawgood_db;
CREATE USER mawgood_user WITH PASSWORD 'Dawoodd!@#0123$%';
GRANT ALL PRIVILEGES ON DATABASE mawgood_db TO mawgood_user;
\q
```

### 2. Redis
تأكد من تشغيل Redis:
```bash
sudo systemctl status redis
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. الصور (486 صورة)
**مهم جداً:** يجب نسخ الصور من `data-products/extracted-images/` إلى `backend/static/extracted-images/`

### 4. DNS Settings
تأكد من إعداد DNS في Hostinger:
- `mawgood.cloud` → IP السيرفر
- `www.mawgood.cloud` → IP السيرفر
- `api.mawgood.cloud` → IP السيرفر
- `admin.mawgood.cloud` → IP السيرفر
- `vendor.mawgood.cloud` → IP السيرفر

---

## 🎯 الخلاصة

### ملفات .env الجاهزة:
- ✅ `PRODUCTION_ENV_BACKEND.env`
- ✅ `PRODUCTION_ENV_STOREFRONT.env`
- ✅ `PRODUCTION_ENV_ADMIN.env`
- ✅ `PRODUCTION_ENV_VENDOR.env`

### القيم المهمة:
- ✅ النطاق: `mawgood.cloud`
- ✅ Publishable Key: `pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53`
- ✅ JWT Secret: `Daw2@3#4$ood_Nada`
- ✅ Database: `mawgood_db`
- ✅ الصور: 486 صورة

**كل شيء جاهز للنشر! 🚀**

---

**تم الإعداد بواسطة:** مهندس ضمان الجودة الأول  
**التاريخ:** 11 مايو 2026
