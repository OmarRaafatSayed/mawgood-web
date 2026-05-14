# ✅ قائمة التحقق من نشر Admin Panel

استخدم هذه القائمة للتأكد من تطبيق كل الخطوات بشكل صحيح.

---

## 📋 قبل البدء

- [ ] لديك صلاحيات SSH للسيرفر
- [ ] لديك صلاحيات sudo
- [ ] Git مثبت على السيرفر
- [ ] PM2 مثبت ويعمل
- [ ] Nginx مثبت ويعمل
- [ ] الدومين admin.mawgood.cloud يشير للسيرفر

---

## 🔄 خطوات التطبيق

### 1. تحديث الكود

- [ ] اتصلت بالسيرفر عبر SSH
- [ ] انتقلت لمجلد المشروع: `cd /var/www/mawgood-web`
- [ ] سحبت آخر تحديثات: `git pull origin main`
- [ ] تأكدت من نجاح الـ pull بدون أخطاء

### 2. التحقق من البناء

- [ ] مجلد `admin-panel/dist` موجود
- [ ] إذا لم يكن موجود، قمت بالبناء:
  ```bash
  cd admin-panel
  cp ../PRODUCTION_ENV_ADMIN.env .env
  yarn install --frozen-lockfile
  yarn build:preview
  cd ..
  ```

### 3. تحديث PM2

- [ ] حذفت العملية القديمة: `pm2 delete mawgood-admin`
- [ ] شغلت العملية الجديدة: `pm2 start ecosystem.config.js --only mawgood-admin`
- [ ] حفظت إعدادات PM2: `pm2 save`
- [ ] تأكدت من الحالة: `pm2 list | grep admin`
- [ ] الحالة تظهر "online" ✅

### 4. تحديث Nginx

- [ ] نسخت إعدادات Nginx الجديدة (من QUICK_FIX_COMMANDS.txt)
- [ ] حفظت الملف في: `/etc/nginx/sites-available/mawgood-admin`
- [ ] أنشأت symbolic link: `sudo ln -sf /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/`
- [ ] اختبرت الإعدادات: `sudo nginx -t`
- [ ] النتيجة: "syntax is ok" و "test is successful" ✅
- [ ] أعدت تحميل Nginx: `sudo systemctl reload nginx`

---

## 🧪 الاختبارات

### اختبار محلي على السيرفر

- [ ] اختبرت البورت: `curl -I http://localhost:5173`
- [ ] النتيجة: `HTTP/1.1 200 OK` ✅
- [ ] اختبرت route معين: `curl http://localhost:5173/products`
- [ ] النتيجة: HTML content (ليس 404) ✅

### اختبار من المتصفح

- [ ] فتحت: `http://admin.mawgood.cloud`
- [ ] الصفحة الرئيسية تظهر ✅
- [ ] جربت `/products` - يعمل ✅
- [ ] جربت `/orders` - يعمل ✅
- [ ] جربت `/customers` - يعمل ✅
- [ ] تسجيل الدخول يعمل ✅
- [ ] لا توجد أخطاء في Console (F12) ✅

### اختبار الوظائف

- [ ] يمكنني تسجيل الدخول
- [ ] يمكنني رؤية المنتجات
- [ ] يمكنني رؤية الطلبات
- [ ] يمكنني رؤية العملاء
- [ ] الصور تظهر بشكل صحيح
- [ ] الـ API calls تعمل (شوف Network tab)

---

## 🔍 فحص اللوجات

- [ ] فحصت لوجات PM2: `pm2 logs mawgood-admin --lines 50`
- [ ] لا توجد أخطاء حرجة (errors) ✅
- [ ] فحصت لوجات Nginx: `sudo tail -f /var/log/nginx/error.log`
- [ ] لا توجد أخطاء 404 أو 502 ✅

---

## 🔒 SSL (الخطوة الأخيرة)

- [ ] تأكدت أن HTTP يعمل 100%
- [ ] شغلت Certbot: `sudo certbot --nginx -d admin.mawgood.cloud`
- [ ] Certbot نجح بدون أخطاء ✅
- [ ] فتحت: `https://admin.mawgood.cloud`
- [ ] HTTPS يعمل ✅
- [ ] الشهادة صالحة (قفل أخضر في المتصفح) ✅
- [ ] Auto-redirect من HTTP إلى HTTPS يعمل ✅

---

## 📊 التحقق النهائي

### حالة الخدمات

- [ ] PM2 status: `pm2 list`
  - mawgood-backend: online ✅
  - mawgood-storefront: online ✅
  - mawgood-admin: online ✅
  - mawgood-vendor: online ✅

- [ ] Nginx status: `sudo systemctl status nginx`
  - active (running) ✅

- [ ] البورتات مفتوحة:
  ```bash
  netstat -tlnp | grep -E '(9000|3000|5173|5174)'
  ```
  - 9000 (backend) ✅
  - 3000 (storefront) ✅
  - 5173 (admin) ✅
  - 5174 (vendor) ✅

### الدومينات

- [ ] https://api.mawgood.cloud - يعمل ✅
- [ ] https://mawgood.cloud - يعمل ✅
- [ ] https://admin.mawgood.cloud - يعمل ✅
- [ ] https://vendor.mawgood.cloud - يعمل ✅

---

## 🎯 المشاكل الشائعة وحلولها

### ❌ PM2 يظهر "errored" أو "stopped"

```bash
# الحل
pm2 logs mawgood-admin --lines 100
# اقرأ الخطأ وحله
pm2 restart mawgood-admin
```

### ❌ 502 Bad Gateway

```bash
# السبب: PM2 مش شغال أو البورت مش مفتوح
pm2 list
pm2 restart mawgood-admin
netstat -tlnp | grep 5173
```

### ❌ 404 Not Found على routes

```bash
# السبب: الـ -n flag مش موجود
# تأكد من ecosystem.config.js فيه -n
pm2 restart mawgood-admin
```

### ❌ صفحة بيضاء فاضية

```bash
# افتح Developer Console (F12)
# شوف الأخطاء في Console
# غالباً مشكلة في:
# 1. VITE_MEDUSA_BACKEND_URL
# 2. CORS من الـ backend
# 3. ملفات الـ build ناقصة
```

### ❌ Cannot connect to backend

```bash
# تأكد من:
# 1. Backend شغال
pm2 list | grep backend

# 2. VITE_MEDUSA_BACKEND_URL صحيح
cat admin-panel/.env

# 3. CORS مضبوط في الـ backend
```

---

## 📝 ملاحظات مهمة

- ✅ **لا تنسى `pm2 save`** بعد أي تغيير في PM2
- ✅ **اختبر `sudo nginx -t`** قبل reload
- ✅ **تأكد من HTTP قبل SSL** - لا تثبت SSL إلا بعد ما HTTP يشتغل 100%
- ✅ **احتفظ بنسخة احتياطية** من إعدادات Nginx القديمة
- ✅ **راقب اللوجات** بعد أي تغيير: `pm2 logs mawgood-admin`

---

## 🎉 النجاح!

إذا كل النقاط أعلاه ✅، تهانينا! 

**Admin Panel يعمل بشكل كامل على Production!** 🚀

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. راجع **[الحل_النهائي_للادمن_بانل.md](./الحل_النهائي_للادمن_بانل.md)**
2. راجع **[ADMIN_PANEL_SOLUTION.md](./ADMIN_PANEL_SOLUTION.md)**
3. شغل `pm2 logs mawgood-admin --lines 100`
4. شوف `/var/log/nginx/error.log`

---

## 📅 الصيانة الدورية

- [ ] راقب اللوجات يومياً: `pm2 logs`
- [ ] تأكد من تجديد SSL تلقائياً: `sudo certbot renew --dry-run`
- [ ] احتفظ بنسخ احتياطية من الإعدادات
- [ ] حدّث المكتبات بانتظام: `yarn upgrade`

---

**تاريخ آخر تحديث**: {{ التاريخ الحالي }}
**الإصدار**: 1.0.0
**الحالة**: ✅ جاهز للإنتاج
