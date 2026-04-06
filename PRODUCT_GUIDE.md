# دليل إضافة المنتجات - Product Addition Guide

## 🔗 الربط بين Admin Dashboard و Storefront

نعم، الـ Admin Dashboard مربوط بالـ Storefront عن طريق:

### Backend (Port 9000)
```
DATABASE: postgres://localhost:5432/mercurjs
API: http://localhost:9000
```

### Admin Panel (Port 5173)
```
BACKEND: http://localhost:9000
STOREFRONT: http://localhost:3000
```

### Storefront (Port 3000)
```
BACKEND: http://localhost:9000
PUBLISHABLE_KEY: pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53
DEFAULT_REGION: eg (مصر)
```

---

## ⚠️ أسباب عدم ظهور المنتجات في Storefront

### 1. **المنتج غير منشور (Not Published)**
- ✅ تأكد أن حالة المنتج: `Published` وليس `Draft`
- في Admin Panel → Products → اختر المنتج → Status: Published

### 2. **المنتج غير مرتبط بـ Region (مصر)**
- ✅ المنتج يجب أن يكون متاح في Region: `Egypt (EG)`
- في Admin Panel → Products → اختر المنتج → Availability → اختر Region: Egypt

### 3. **المنتج ليس له Variant بسعر**
- ✅ كل منتج يحتاج على الأقل Variant واحد بسعر محدد
- في Admin Panel → Products → Variants → أضف سعر للـ Variant

### 4. **المنتج ليس له Seller**
- ✅ في هذا النظام، كل منتج يجب أن يكون له Seller
- الكود يفلتر المنتجات التي ليس لها Seller:
```typescript
const products = productsRaw.filter(product => product.seller?.store_status !== 'SUSPENDED');
```

### 5. **الـ Seller معلق (Suspended)**
- ✅ تأكد أن حالة الـ Seller: `ACTIVE` وليس `SUSPENDED`
- في Admin Panel → Sellers → تحقق من Store Status

### 6. **المنتج ليس له Inventory (مخزون)**
- ✅ تأكد من وجود كمية متاحة في المخزون
- في Admin Panel → Products → Variants → Inventory Quantity > 0

### 7. **الـ Cache لم يتم تحديثه**
- ✅ الـ Storefront يستخدم Cache لمدة 60 ثانية
- انتظر دقيقة أو أعد تشغيل الـ Storefront

---

## 📋 خطوات إضافة منتج بشكل صحيح

### الخطوة 1: إنشاء Seller (إذا لم يكن موجود)
1. اذهب إلى Admin Panel
2. Sellers → Create New Seller
3. املأ البيانات المطلوبة
4. Store Status: **ACTIVE**
5. احفظ

### الخطوة 2: إنشاء المنتج
1. Products → Create Product
2. املأ البيانات:
   - **Title**: اسم المنتج (عربي/إنجليزي)
   - **Description**: وصف المنتج
   - **Handle**: رابط المنتج (تلقائي)
   - **Status**: **Published** ⚠️ مهم جداً
   - **Images**: أضف صور المنتج

### الخطوة 3: إضافة Variant
1. في نفس صفحة المنتج → Variants
2. أضف Variant جديد:
   - **Title**: مثل "Default" أو "Medium"
   - **SKU**: كود المنتج
   - **Inventory Quantity**: الكمية المتاحة (مثل 10)
   - **Manage Inventory**: فعّل إذا أردت تتبع المخزون

### الخطوة 4: إضافة السعر
1. في الـ Variant → Prices
2. أضف سعر للـ Region: **Egypt (EG)**
3. Currency: **EGP** (الجنيه المصري)
4. Amount: السعر (مثل 100.00)

### الخطوة 5: ربط المنتج بـ Region
1. في صفحة المنتج → Availability
2. اختر Region: **Egypt (EG)** ⚠️ مهم جداً
3. احفظ

### الخطوة 6: ربط المنتج بـ Seller
1. في صفحة المنتج → Seller
2. اختر الـ Seller المطلوب
3. احفظ

### الخطوة 7: إضافة Category (اختياري)
1. في صفحة المنتج → Categories
2. اختر الفئة المناسبة
3. احفظ

---

## 🔍 كيفية التحقق من ظهور المنتج

### 1. تحقق من API مباشرة
افتح المتصفح واذهب إلى:
```
http://localhost:9000/store/products?region_id=reg_XXXXX&fields=*variants.calculated_price,*seller
```
(استبدل reg_XXXXX بـ ID الخاص بـ Region مصر)

### 2. تحقق من Storefront
1. اذهب إلى: `http://localhost:3000/eg`
2. يجب أن تظهر المنتجات في الصفحة الرئيسية
3. أو اذهب إلى: `http://localhost:3000/eg/products`

### 3. تحقق من Database
افتح PostgreSQL وشغل:
```sql
-- تحقق من المنتجات
SELECT id, title, status FROM product;

-- تحقق من الـ Variants والأسعار
SELECT p.title, v.title as variant, v.inventory_quantity, mp.amount, mp.currency_code
FROM product p
JOIN product_variant v ON p.id = v.product_id
LEFT JOIN money_amount mp ON v.id = mp.variant_id;

-- تحقق من ربط المنتجات بالـ Regions
SELECT p.title, r.name as region
FROM product p
JOIN product_sales_channel psc ON p.id = psc.product_id
JOIN sales_channel sc ON psc.sales_channel_id = sc.id
JOIN region r ON sc.id = r.id;
```

---

## 🚀 حل سريع للمشاكل الشائعة

### المنتج موجود في Admin لكن لا يظهر في Storefront

**الحل:**
1. تأكد من Status = Published
2. تأكد من وجود Seller وأنه Active
3. تأكد من وجود Price في Region: Egypt
4. تأكد من وجود Inventory > 0
5. أعد تشغيل Storefront:
```bash
cd storefront
npm run dev
```

### المنتج يظهر لكن بدون صورة

**الحل:**
1. تأكد من رفع الصور في Admin Panel
2. تحقق من مسار الصور في Backend
3. تأكد من أن Backend يعمل على Port 9000

### المنتج يظهر لكن بدون سعر

**الحل:**
1. أضف Price في Variant
2. تأكد من اختيار Currency: EGP
3. تأكد من اختيار Region: Egypt

---

## 📊 معلومات إضافية

### الـ Storefront يعرض فقط:
- المنتجات المنشورة (Published)
- المنتجات التي لها Seller نشط
- المنتجات المتاحة في Region الحالي (Egypt)
- المنتجات التي لها سعر محدد
- أحدث 4 منتجات في الصفحة الرئيسية

### الـ Cache:
- الصفحة الرئيسية: Cache لمدة 60 ثانية
- صفحات المنتجات: No Cache
- لإعادة التحميل: Ctrl+Shift+R في المتصفح

---

## 💡 نصائح مهمة

1. **دائماً تأكد من Region**: المنتج يجب أن يكون متاح في مصر (EG)
2. **السعر مطلوب**: لا يمكن عرض منتج بدون سعر
3. **Seller مطلوب**: هذا نظام Marketplace، كل منتج يحتاج Seller
4. **الصور مهمة**: أضف صور واضحة للمنتجات
5. **الوصف مهم**: اكتب وصف جيد بالعربية والإنجليزية

---

## 🔧 إذا استمرت المشكلة

1. تحقق من Logs:
```bash
# Backend logs
cd backend
npm run dev

# Storefront logs
cd storefront
npm run dev
```

2. تحقق من Database Connection
3. تحقق من Environment Variables
4. أعد تشغيل جميع الخدمات

---

**ملاحظة**: إذا كنت تضيف منتجات كثيرة ولا تظهر، غالباً السبب هو عدم ربطها بـ Region (مصر) أو عدم وجود Seller نشط.
