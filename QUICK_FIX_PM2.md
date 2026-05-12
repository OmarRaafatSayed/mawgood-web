# 🔧 إصلاح سريع لأخطاء PM2

## 🔴 المشاكل الحالية:

من الصورة، الأخطاء هي:
- ❌ `mawgood-admin` - **errored**
- ❌ `mawgood-storefront` - **errored** 
- ❌ `mawgood-vendor` - **errored**
- ✅ `mawgood-backend` - online (يعمل)

---

## ⚡ الحل السريع (نسخ ولصق):

### الطريقة 1: أوامر سريعة

```bash
# إيقاف وحذف جميع العمليات
pm2 stop all
pm2 delete all
pm2 flush

# إعادة تشغيل Backend
cd /var/www/Mawgood/backend
pm2 start npm --name "mawgood-backend" -- start

# إعادة تشغيل Storefront
cd /var/www/Mawgood/storefront
pm2 start npm --name "mawgood-storefront" -- start

# إعادة تشغيل Admin Panel
cd /var/www/Mawgood/admin-panel
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host 0.0.0.0

# إعادة تشغيل Vendor Panel
cd /var/www/Mawgood/vendor-panel
pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174 --host 0.0.0.0

# حفظ الإعدادات
pm2 save

# عرض الحالة
pm2 status
```

---

### الطريقة 2: استخدام Script جاهز

```bash
# نسخ الملف إلى السيرفر
cd /var/www/Mawgood
nano fix-pm2.sh
```

**الصق هذا المحتوى:**

```bash
#!/bin/bash

echo "🔧 Fixing PM2 errors..."

# Stop and delete all
pm2 stop all
pm2 delete all
pm2 flush

# Start Backend
echo "▶️  Starting Backend..."
cd /var/www/Mawgood/backend
pm2 start npm --name "mawgood-backend" -- start

# Start Storefront
echo "▶️  Starting Storefront..."
cd /var/www/Mawgood/storefront
pm2 start npm --name "mawgood-storefront" -- start

# Start Admin
echo "▶️  Starting Admin Panel..."
cd /var/www/Mawgood/admin-panel
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host 0.0.0.0

# Start Vendor
echo "▶️  Starting Vendor Panel..."
cd /var/www/Mawgood/vendor-panel
pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174 --host 0.0.0.0

# Save
pm2 save

echo "✅ Done!"
pm2 status
```

**ثم شغّله:**

```bash
chmod +x fix-pm2.sh
./fix-pm2.sh
```

---

## 🔍 فحص الأخطاء:

إذا لم تعمل، شوف الـ logs:

```bash
# Admin Panel logs
pm2 logs mawgood-admin --lines 50

# Storefront logs
pm2 logs mawgood-storefront --lines 50

# Vendor Panel logs
pm2 logs mawgood-vendor --lines 50
```

---

## 🐛 الأخطاء الشائعة والحلول:

### 1. Port already in use

```bash
# تحقق من البورتات المستخدمة
sudo lsof -i :3000  # Storefront
sudo lsof -i :5173  # Admin
sudo lsof -i :5174  # Vendor
sudo lsof -i :9000  # Backend

# إيقاف العملية
sudo kill -9 <PID>
```

### 2. Module not found

```bash
# أعد تثبيت الحزم
cd /var/www/Mawgood/storefront
rm -rf node_modules package-lock.json
npm install

cd /var/www/Mawgood/admin-panel
rm -rf node_modules package-lock.json
npm install

cd /var/www/Mawgood/vendor-panel
rm -rf node_modules package-lock.json
npm install
```

### 3. Build failed

```bash
# أعد البناء
cd /var/www/Mawgood/storefront
npm run build

cd /var/www/Mawgood/admin-panel
npm run build

cd /var/www/Mawgood/vendor-panel
npm run build
```

### 4. Permission denied

```bash
# إصلاح الصلاحيات
sudo chown -R $USER:$USER /var/www/Mawgood
chmod -R 755 /var/www/Mawgood
```

---

## ✅ التحقق من النجاح:

بعد التشغيل، يجب أن ترى:

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

**جميعها يجب أن تكون `online` وليس `errored`!**

---

## 🔄 إعادة التشغيل التلقائي:

```bash
# تفعيل إعادة التشغيل عند إعادة تشغيل السيرفر
pm2 startup
pm2 save
```

---

## 📊 مراقبة مستمرة:

```bash
# عرض الحالة المباشرة
pm2 monit

# عرض جميع الـ logs
pm2 logs

# إعادة تشغيل تطبيق معين
pm2 restart mawgood-admin
```

---

## 🎯 الخلاصة:

**أسرع حل:**

```bash
pm2 stop all && pm2 delete all && pm2 flush
cd /var/www/Mawgood/backend && pm2 start npm --name "mawgood-backend" -- start
cd /var/www/Mawgood/storefront && pm2 start npm --name "mawgood-storefront" -- start
cd /var/www/Mawgood/admin-panel && pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host 0.0.0.0
cd /var/www/Mawgood/vendor-panel && pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174 --host 0.0.0.0
pm2 save
```

**انسخ والصق في Terminal! 🚀**
