# 🚀 البداية السريعة - Quick Start

---

## ⚡ استيراد المنتجات في 3 خطوات

### الخطوة 1: تحضير البيانات

```bash
# تأكد من وجود ملفات Excel في:
data-products/H-I-X.xlsx
data-products/H&S.xlsx
data-products/Rehab Lafy.xlsx
data-products/مصنع E-S-H.xlsx
```

### الخطوة 2: إضافة الصور (اختياري)

```bash
# أضف الصور في:
data-products/images/HIX001.jpg
data-products/images/HIX002.jpg
# ... إلخ
```

### الخطوة 3: تشغيل الاستيراد

```bash
cd backend

# استيراد احترافي مع الصور والأوصاف ✨
npm run import:professional

# ربط بقناة المبيعات
npm run link:sales-channel

# تحقق من النتائج
npm run check:products
```

---

## 🎯 الأوامر الأساسية

```bash
# استيراد منتجات جديدة
npm run import:professional

# تحديث منتجات موجودة
npm run update:products

# حذف كل المنتجات
npm run clean:products

# ربط بقناة المبيعات
npm run link:sales-channel

# فحص المنتجات
npm run check:products
```

---

## 📊 هيكل Excel المطلوب

| A | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|
| **كود** | **مقاسات** | **عنوان** | **ألوان** | **سعر** | **فئة** | **صورة** | **وصف** |
| HIX001 | S,M,L,XL | بوليفار قطن | اسود،ابيض | 250 | بوليفار | HIX001.jpg | وصف تفصيلي |

---

## 🖼️ نظام الصور

### تسمية الصور:
```
HIX001.jpg  ← كود المنتج + .jpg
HS001.png   ← كود المنتج + .png
```

### مكان الصور:
```
data-products/images/HIX001.jpg
```

---

## ✅ التحقق من النتائج

### 1. في Terminal:
```bash
npm run check:products
```

### 2. في المتصفح:
```
http://localhost:3000/ar/categories
```

---

## 🐛 حل سريع للمشاكل

### المنتجات لا تظهر؟
```bash
npm run link:sales-channel
```

### الصور لا تظهر؟
```bash
# تأكد من:
# 1. وجود مجلد images/
# 2. تسمية الصور بكود المنتج
# 3. ثم شغل:
npm run update:products
```

### بداية جديدة؟
```bash
npm run clean:products
npm run import:professional
npm run link:sales-channel
```

---

## 📖 للمزيد من التفاصيل

- 📦 **الدليل الشامل:** `PRODUCT-SYSTEM-GUIDE.md`
- 📋 **قالب Excel:** `data-products/EXCEL-TEMPLATE.md`
- 🖼️ **دليل الصور:** `data-products/images/README.md`
- 📖 **دليل الاستيراد:** `data-products/README-IMPORT-GUIDE.md`

---

**نصيحة:** ابدأ بـ 5 منتجات كتجربة، ثم استورد الباقي! 🎯
