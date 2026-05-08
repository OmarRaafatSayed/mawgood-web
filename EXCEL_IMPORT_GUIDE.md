# دليل استيراد المنتجات من Excel - Excel Products Import Guide

## 📁 ملفات Excel المتاحة

| الملف | الـ Vendor | عدد المنتجات |
|-------|-----------|-------------|
| `H-I-X.xlsx` | H-I-X | ~44 منتج |
| `H&S.xlsx` | H&S | ~92 منتج |
| `Rehab Lafy.xlsx` | Rehab Lafy | ~71 منتج |
| `مصنع E-S-H.xlsx` | E-S-H Factory | ~47 منتج |

**المجموع: ~254 منتج**

---

## 🗂️ هيكل بيانات Excel

كل ملف Excel بيحتوي على الأعمدة دي:

| العمود | الوصف |
|--------|-------|
| Code | كود المنتج (SKU) |
| صوره المنتج 1-5 | صور المنتج (فاضية حالياً) |
| المقاس | المقاسات (M, L, XL, XXL...) |
| وصف المنتج | وصف المنتج بالعربي |
| اللون | الألوان المتاحة |
| السعر بالجنيه | السعر بالجنيه المصري |
| الصنف | الفئة (تيشرت، قميص، دريس...) |

---

## 🚀 خطوات الاستيراد

### الخطوة 1: تأكد إن الـ Backend شغال
```bash
cd backend
npm run dev
```

### الخطوة 2: تأكد إن الـ Seed اتعمل (مرة واحدة بس)
```bash
cd backend
npm run seed
```
> هذا يخلق: Admin User, Sales Channel, Region (Arab Countries), Seller

### الخطوة 3: استورد المنتجات من Excel
```bash
cd backend
npm run import:excel
```
أو مباشرة:
```bash
npx medusa exec ./src/scripts/import-excel-products.ts
```

### الخطوة 4: اعمل Fix للـ Visibility
```bash
cd backend
npm run fix:visibility
```
أو مباشرة:
```bash
npx medusa exec ./src/scripts/fix-excel-products-visibility.ts
```

---

## ✅ ما بيعمله السكريبت تلقائياً

### `import-excel-products.ts`
- ✅ يقرأ الـ 4 ملفات Excel
- ✅ يترجم الألوان من عربي لإنجليزي
- ✅ يترجم الفئات من عربي لإنجليزي
- ✅ ينشئ الفئات الجديدة تلقائياً
- ✅ يبني Variants لكل تركيبة لون × مقاس
- ✅ يضيف SKU لكل Variant
- ✅ يربط المنتجات بالـ Seller الموجود
- ✅ يربط المنتجات بالـ Sales Channel
- ✅ يضيف صور placeholder من Unsplash
- ✅ يضيف وصف احترافي
- ✅ يضبط الـ Status = Published
- ✅ يضبط المخزون = 300 وحدة لكل Variant

### `fix-excel-products-visibility.ts`
- ✅ يتأكد إن كل المنتجات Published
- ✅ يربطهم بالـ Sales Channel
- ✅ يضيف سعر في الـ Region (Arab Countries / Egypt)
- ✅ يضبط Inventory Levels

---

## 🌐 التحقق من ظهور المنتجات في Storefront

بعد تشغيل السكريبتين، افتح:
- **Storefront**: http://localhost:3000/eg
- **Products Page**: http://localhost:3000/eg/products
- **Admin Panel**: http://localhost:5173

---

## ⚠️ شروط ظهور المنتج في Storefront

المنتج لازم يكون:
1. ✅ **Status = Published**
2. ✅ **عنده سعر في Region: Arab Countries (EGP)**
3. ✅ **مربوط بـ Sales Channel**
4. ✅ **الـ Seller مش Suspended** (أو مفيش Seller)
5. ✅ **عنده Inventory > 0**

---

## 🔧 حل المشاكل الشائعة

### المنتجات مش بتظهر في Storefront
```bash
# شغل سكريبت الـ Fix
npm run fix:visibility
```

### خطأ "No seller found"
```bash
# شغل الـ Seed الأول
npm run seed
```

### خطأ في قراءة Excel
- تأكد إن الملفات موجودة في مجلد `data-products/`
- تأكد من أسماء الملفات بالضبط

---

## 📊 مثال على منتج بعد الاستيراد

```
Title: تيشرت بلياقه
Handle: esht-blyaqh-esh001
Description: تيشرت بلياقه - E-S-H Factory
Status: Published
Price: 240 EGP
Category: T-Shirts
Variants:
  - Camel / M (SKU: ESH001-CAM-M)
  - Camel / L (SKU: ESH001-CAM-L)
  - Camel / XL (SKU: ESH001-CAM-XL)
  - Black / M (SKU: ESH001-BLA-M)
  - Black / L (SKU: ESH001-BLA-L)
  ... إلخ
```

---

## 📝 ملاحظات مهمة

1. **الصور**: الملفات مش فيها URLs للصور، السكريبت بيستخدم صور placeholder من Unsplash حسب الفئة. لما تضيف صور حقيقية، حدّث الـ `CATEGORY_IMAGE_MAP` في السكريبت.

2. **الـ Seller**: كل المنتجات بتتربط بأول Seller Active موجود في الـ database. لو عندك Sellers متعددين، عدّل السكريبت.

3. **التكرار**: لو شغّلت السكريبت أكتر من مرة، هيضيف المنتجات مرة تانية. تأكد إنك بتشغله مرة واحدة بس.

4. **الـ SKU**: لو في SKU مكرر، الـ variant هيفشل. السكريبت بيعمل SKU فريد من الكود + اللون + المقاس.
