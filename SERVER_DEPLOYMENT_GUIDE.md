# 🚀 دليل النشر على خادم Hostinger - خطوة بخطوة

**التاريخ:** 11 مايو 2026  
**الحالة:** ✅ جاهز للنشر

---

## ⚠️ مهم جداً: الملفات التي يجب رفعها على السيرفر

### 1. 📁 صور المنتجات (486 صورة)
**الموقع الحالي:** `data-products/extracted-images/`  
**يجب نسخها إلى:** `backend/static/extracted-images/`

```bash
# على السيرفر بعد git pull
cd /path/to/MawgoodWep
mkdir -p backend/static/extracted-images
cp -r data-products/extracted-images/* backend/static/extracted-images/
```

**الصور الموجودة:**
- ✅ 486 صورة منتج
- ✅ E-S-H-Factory: 128 صورة
- ✅ H-I-X: 96 صورة  
- ✅ H-S: 98 صورة
- ✅ Rehab-Lafy: 164 صورة

---

## 🔒 إعدادات الأمان المطلوبة

### 1. متغيرات البيئة (.env)

**على السيرفر، أنشئ ملف `.env` في مجلد `backend/`:**

```bash
# على السيرفر
cd /path/to/MawgoodWep/backend
nano .env
```

**المحتوى المطلوب:**

```env
# ⚠️ مهم: غيّر هذه القيم بقيم عشوائية قوية!
NODE_ENV=production
PORT=9000

# Database (استخدم بيانات قاعدة البيانات من Hostinger)
DATABASE_URL=postgresql://username:password@localhost:5432/mawgood_db

# Security Secrets (⚠️ يجب تغييرها!)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING_abc123xyz789
COOKIE_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING_def456uvw012

# CORS (استخدم النطاق الفعلي)
STORE_CORS=https://your-domain.com,https://www.your-domain.com
ADMIN_CORS=https://admin.your-domain.com
VENDOR_CORS=https://vendor.your-domain.com
AUTH_CORS=https://your-domain.com,https://admin.your-domain.com,https://vendor.your-domain.com

# Medusa
MEDUSA_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here

# Redis (إذا كان متاح)
REDIS_URL=redis://localhost:6379

# Admin User (للدخول الأول)
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=ChangeThisStrongPassword123!
```

---

### 2. توليد Secrets عشوائية قوية

**على السيرفر، استخدم هذا الأمر:**

```bash
# توليد JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# توليد COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**انسخ النتائج وضعها في ملف `.env`**

---

## 📦 خطوات النشر على Hostinger

### الخطوة 1: الاتصال بالسيرفر

```bash
ssh your-username@your-server-ip
```

### الخطوة 2: تحديث الكود من GitHub

```bash
cd /path/to/MawgoodWep
git pull origin main
```

### الخطوة 3: نسخ صور المنتجات

```bash
# إنشاء مجلد الصور
mkdir -p backend/static/extracted-images

# نسخ الصور
cp -r data-products/extracted-images/* backend/static/extracted-images/

# التحقق من عدد الصور
ls backend/static/extracted-images/ | wc -l
# يجب أن يظهر: 486
```

### الخطوة 4: إعداد Backend

```bash
cd backend

# تثبيت الحزم
npm install

# إنشاء ملف .env (إذا لم يكن موجود)
nano .env
# الصق المحتوى من الأعلى وغيّر القيم

# بناء Backend
npm run build

# تشغيل Migrations
npm run db:migrate

# (اختياري) إضافة بيانات تجريبية
npm run seed
```

### الخطوة 5: إعداد Storefront

```bash
cd ../storefront

# تثبيت الحزم
npm install

# إنشاء ملف .env.production
nano .env.production
```

**محتوى `.env.production` للـ Storefront:**

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
NEXT_PUBLIC_DEFAULT_REGION=eg
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

```bash
# بناء Storefront
npm run build
```

### الخطوة 6: إعداد Admin Panel

```bash
cd ../admin-panel

# تثبيت الحزم
npm install

# إنشاء ملف .env.production
nano .env.production
```

**محتوى `.env.production` للـ Admin Panel:**

```env
VITE_MEDUSA_BACKEND_URL=https://api.your-domain.com
VITE_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
```

```bash
# بناء Admin Panel
npm run build
```

### الخطوة 7: إعداد Vendor Panel

```bash
cd ../vendor-panel

# تثبيت الحزم
npm install

# إنشاء ملف .env.production
nano .env.production
```

**محتوى `.env.production` للـ Vendor Panel:**

```env
VITE_MEDUSA_BACKEND_URL=https://api.your-domain.com
VITE_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
```

```bash
# بناء Vendor Panel
npm run build
```

---

## 🔄 تشغيل التطبيقات بـ PM2

### تثبيت PM2 (إذا لم يكن مثبت)

```bash
npm install -g pm2
```

### تشغيل Backend

```bash
cd /path/to/MawgoodWep/backend
pm2 start npm --name "mawgood-backend" -- start
```

### تشغيل Storefront

```bash
cd /path/to/MawgoodWep/storefront
pm2 start npm --name "mawgood-storefront" -- start
```

### تشغيل Admin Panel

```bash
cd /path/to/MawgoodWep/admin-panel
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173
```

### تشغيل Vendor Panel

```bash
cd /path/to/MawgoodWep/vendor-panel
pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174
```

### حفظ إعدادات PM2

```bash
pm2 save
pm2 startup
```

---

## ✅ التحقق من التشغيل

### 1. التحقق من حالة PM2

```bash
pm2 status
```

**يجب أن ترى:**
```
┌─────┬────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ status  │ restart │ uptime   │
├─────┼────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ mawgood-backend    │ online  │ 0       │ 5m       │
│ 1   │ mawgood-storefront │ online  │ 0       │ 4m       │
│ 2   │ mawgood-admin      │ online  │ 0       │ 3m       │
│ 3   │ mawgood-vendor     │ online  │ 0       │ 2m       │
└─────┴────────────────────┴─────────┴─────────┴──────────┘
```

### 2. التحقق من Backend

```bash
curl http://localhost:9000/health
```

**يجب أن يرجع:**
```json
{"status":"ok"}
```

### 3. التحقق من الصور

```bash
ls backend/static/extracted-images/ | wc -l
```

**يجب أن يظهر:** `486`

### 4. التحقق من المنتجات

```bash
curl http://localhost:9000/store/products | jq '.products | length'
```

**يجب أن يظهر عدد المنتجات (308+)**

---

## 🌐 إعداد Nginx (Reverse Proxy)

### ملف Nginx للـ Backend

```nginx
# /etc/nginx/sites-available/mawgood-api
server {
    listen 80;
    server_name api.your-domain.com;

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
    }

    # Static files (images)
    location /static/ {
        alias /path/to/MawgoodWep/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### ملف Nginx للـ Storefront

```nginx
# /etc/nginx/sites-available/mawgood-storefront
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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
sudo ln -s /etc/nginx/sites-available/mawgood-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### تثبيت SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com
```

---

## 🔒 فحص الأمان النهائي

### 1. التحقق من Secrets

```bash
cd /path/to/MawgoodWep/backend
grep -E "JWT_SECRET|COOKIE_SECRET" .env
```

**يجب ألا ترى:**
- `supersecret`
- `CHANGE_THIS`
- أي قيمة افتراضية

### 2. التحقق من CORS

```bash
grep -E "STORE_CORS|ADMIN_CORS" .env
```

**يجب أن ترى النطاقات الفعلية فقط، بدون `localhost`**

### 3. التحقق من Database

```bash
grep "DATABASE_URL" .env
```

**يجب أن يكون:**
- اتصال PostgreSQL صحيح
- كلمة مرور قوية
- ليس `localhost` إذا كانت قاعدة البيانات على سيرفر آخر

---

## 📊 مراقبة الأداء

### عرض Logs

```bash
# Backend logs
pm2 logs mawgood-backend

# Storefront logs
pm2 logs mawgood-storefront

# جميع Logs
pm2 logs
```

### مراقبة الموارد

```bash
pm2 monit
```

---

## 🔄 تحديثات مستقبلية

عند رفع تحديثات جديدة:

```bash
# 1. سحب التحديثات
cd /path/to/MawgoodWep
git pull origin main

# 2. تحديث Backend
cd backend
npm install
npm run build
pm2 restart mawgood-backend

# 3. تحديث Storefront
cd ../storefront
npm install
npm run build
pm2 restart mawgood-storefront

# 4. تحديث Admin Panel
cd ../admin-panel
npm install
npm run build
pm2 restart mawgood-admin

# 5. تحديث Vendor Panel
cd ../vendor-panel
npm install
npm run build
pm2 restart mawgood-vendor
```

---

## ⚠️ استكشاف الأخطاء

### المنتجات لا تظهر؟

```bash
# تحقق من قاعدة البيانات
cd backend
npm run db:migrate
npm run seed
```

### الصور لا تظهر؟

```bash
# تحقق من وجود الصور
ls backend/static/extracted-images/ | wc -l

# إذا كانت فارغة، انسخها مرة أخرى
cp -r data-products/extracted-images/* backend/static/extracted-images/

# تحقق من صلاحيات الملفات
chmod -R 755 backend/static/
```

### Backend لا يعمل؟

```bash
# تحقق من Logs
pm2 logs mawgood-backend

# أعد التشغيل
pm2 restart mawgood-backend

# تحقق من .env
cat backend/.env
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع `pm2 logs`
2. تحقق من ملفات `.env`
3. تأكد من نسخ الصور
4. تحقق من Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**تم الإعداد بواسطة:** مهندس ضمان الجودة الأول  
**التاريخ:** 11 مايو 2026  
**الحالة:** ✅ جاهز للنشر
