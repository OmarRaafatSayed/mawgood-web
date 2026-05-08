# 📦 دليل نظام المنتجات الاحترافي
## Professional Product Management System

---

## 🎯 نظرة عامة

تم إنشاء نظام احترافي متكامل لإدارة المنتجات يشمل:

✅ **استيراد من Excel** مع دعم كامل للصور والأوصاف  
✅ **نظام صور احترافي** مع دعم الصور المحلية والروابط الخارجية  
✅ **أوصاف تفصيلية** تظهر في صفحة المنتج  
✅ **عناوين واضحة** تظهر في قوائم المنتجات  
✅ **إدارة متقدمة** للألوان والمقاسات والفئات  

---

## 📂 هيكل المشروع

```
MawgoodWep/
├── backend/
│   ├── scripts/
│   │   ├── import-products-professional.ts    ✨ النظام الجديد
│   │   ├── import-products-simple.ts          📦 النظام القديم
│   │   ├── update-products-info.ts            🔄 تحديث المنتجات
│   │   ├── clean-and-reimport.ts              🗑️ حذف وإعادة استيراد
│   │   ├── link-products-to-sales-channel.ts  🔗 ربط بقناة المبيعات
│   │   ├── check-products.ts                  ✅ فحص المنتجات
│   │   └── check-regions.ts                   🌍 فحص المناطق
│   └── package.json
│
└── data-products/
    ├── images/                                 🖼️ مجلد الصور
    │   ├── HIX001.jpg
    │   ├── HIX002.jpg
    │   └── README.md
    ├── H-I-X.xlsx                             📊 ملفات Excel
    ├── H&S.xlsx
    ├── Rehab Lafy.xlsx
    ├── مصنع E-S-H.xlsx
    ├── README-IMPORT-GUIDE.md                 📖 دليل الاستيراد
    └── EXCEL-TEMPLATE.md                      📋 قالب Excel
```

---

## 🚀 الأوامر المتاحة

### استيراد المنتجات

```bash
cd backend

# استيراد احترافي (موصى به) ✨
npm run import:professional

# استيراد بسيط (النظام القديم)
npm run import:simple
```

### إدارة المنتجات

```bash
# تحديث المنتجات الموجودة بالصور والأوصاف
npm run update:products

# حذف جميع المنتجات
npm run clean:products

# ربط المنتجات بقناة المبيعات
npm run link:sales-channel
```

### فحص وتشخيص

```bash
# فحص المنتجات والأسعار
npm run check:products

# فحص المناطق والدول
npm run check:regions
```

---

## 📊 هيكل ملف Excel

| العمود | الاسم | مثال | إلزامي |
|--------|-------|------|--------|
| **A** | كود المنتج | `HIX001` | ✅ |
| **G** | المقاسات | `S, M, L, XL` | ✅ |
| **H** | العنوان | `بوليفار قطن تلبيس` | ✅ |
| **I** | الألوان | `اسود، ابيض، ازرق` | ✅ |
| **J** | السعر | `250` | ✅ |
| **K** | الفئة | `بوليفار` | ✅ |
| **L** | الصورة | `HIX001.jpg` | ⚠️ اختياري |
| **M** | الوصف | `بوليفار قطن عالي الجودة` | ⚠️ اختياري |

📖 **للتفاصيل الكاملة:** راجع `data-products/EXCEL-TEMPLATE.md`

---

## 🖼️ نظام الصور

### الطريقة 1: صور محلية (موصى بها)

1. **ضع الصور في:**
   ```
   data-products/images/HIX001.jpg
   ```

2. **التسمية:**
   - استخدم كود المنتج: `HIX001.jpg`
   - أو مع المورد: `H-I-X-HIX001.jpg`

3. **الصيغ المدعومة:**
   - `.jpg` / `.jpeg`
   - `.png`
   - `.webp`

### الطريقة 2: روابط خارجية

في العمود L من Excel:
```
https://example.com/images/product1.jpg
```

📖 **للتفاصيل الكاملة:** راجع `data-products/images/README.md`

---

## 🔄 سيناريوهات الاستخدام

### السيناريو 1: استيراد منتجات جديدة

```bash
# 1. حضّر ملف Excel
# 2. أضف الصور في data-products/images/
# 3. شغل الاستيراد
cd backend
npm run import:professional

# 4. ربط بقناة المبيعات
npm run link:sales-channel

# 5. تحقق من النتائج
npm run check:products
```

### السيناريو 2: تحديث منتجات موجودة

```bash
# 1. أضف الصور الجديدة في data-products/images/
# 2. شغل التحديث
cd backend
npm run update:products
```

### السيناريو 3: إعادة استيراد كاملة

```bash
# 1. حذف المنتجات القديمة
cd backend
npm run clean:products

# 2. استيراد من جديد
npm run import:professional

# 3. ربط بقناة المبيعات
npm run link:sales-channel
```

---

## ✨ الفرق بين النظام القديم والجديد

| الميزة | القديم | الجديد ✨ |
|--------|--------|----------|
| **الصور** | ❌ لا يدعم | ✅ دعم كامل |
| **الوصف** | ❌ يستخدم كعنوان | ✅ وصف منفصل |
| **العنوان** | ⚠️ من الوصف | ✅ عنوان واضح |
| **الصور المحلية** | ❌ | ✅ |
| **الروابط الخارجية** | ❌ | ✅ |
| **وصف تلقائي** | ❌ | ✅ |
| **تقارير مفصلة** | ⚠️ بسيطة | ✅ احترافية |

---

## 🎨 الألوان المدعومة

```
اسود (Black)          ابيض (White)         احمر (Red)
ازرق (Blue)           اخضر (Green)         اصفر (Yellow)
برتقالي (Orange)      بني (Brown)          رمادي (Gray)
بيج (Beige)           كحلي (Navy)          زهري (Pink)
بنفسجي (Purple)       كاميل (Camel)        كريمي (Cream)
سماوي (Sky Blue)      فيروزي (Turquoise)   موف (Mauve)
خمري (Maroon)         زيتي (Olive)         ذهبي (Gold)
فضي (Silver)          اوف وايت (Off White) روز (Rose)
```

**إضافة ألوان جديدة:** عدّل `COLOR_MAP` في `import-products-professional.ts`

---

## 📁 الفئات المدعومة

```
تيشرت (T-Shirts)      قميص (Shirts)        بنطلون (Pants)
جاكيت (Jackets)       بوليفار (Pullovers)  بولو (Polo Shirts)
هودي (Hoodies)        سويتر (Sweaters)     فستان (Dresses)
جينز (Jeans)          كارديجان (Cardigans) سالوبيت (Overalls)
```

**إضافة فئات جديدة:** عدّل `CATEGORY_MAP` في `import-products-professional.ts`

---

## 🐛 حل المشاكل

### المنتجات لا تظهر في الموقع

```bash
# 1. تأكد من ربط المنتجات
npm run link:sales-channel

# 2. فحص المنتجات
npm run check:products

# 3. أعد تشغيل الباكند
npm run dev
```

### الصور لا تظهر

1. ✅ تأكد من وجود مجلد `data-products/images/`
2. ✅ تأكد من تسمية الصور بكود المنتج
3. ✅ تأكد من الصيغة: `.jpg`, `.png`, `.webp`
4. ✅ أعد تشغيل `npm run update:products`

### الوصف لا يظهر

1. ✅ تأكد من ملء العمود M في Excel
2. ✅ أو شغل `npm run update:products` لإضافة وصف تلقائي

---

## 📊 إحصائيات النظام الحالي

```bash
npm run check:products
```

**النتائج المتوقعة:**
- ✅ عدد المنتجات
- ✅ عدد الأسعار
- ✅ قنوات المبيعات
- ✅ المناطق والدول
- ✅ عينة من المنتجات

---

## 🔐 الإعدادات الافتراضية

| الإعداد | القيمة | الموقع |
|---------|--------|--------|
| **المخزون** | 300 قطعة | السطر 285 |
| **حجم الدفعة** | 5 منتجات | السطر 244 |
| **العملة** | EGP | السطر 220 |
| **الحالة** | Published | السطر 213 |

**للتعديل:** افتح `backend/scripts/import-products-professional.ts`

---

## 📞 الدعم والمساعدة

### الملفات المرجعية

1. 📖 **دليل الاستيراد:** `data-products/README-IMPORT-GUIDE.md`
2. 📋 **قالب Excel:** `data-products/EXCEL-TEMPLATE.md`
3. 🖼️ **دليل الصور:** `data-products/images/README.md`
4. 📦 **هذا الملف:** `PRODUCT-SYSTEM-GUIDE.md`

### خطوات التشخيص

```bash
# 1. فحص المنتجات
npm run check:products

# 2. فحص المناطق
npm run check:regions

# 3. فحص سجلات الأخطاء في Terminal
```

---

## ✅ قائمة التحقق السريعة

قبل الاستيراد:

- [ ] ملف Excel جاهز بالهيكل الصحيح
- [ ] البيانات الإلزامية موجودة (A, G, H, I, J, K)
- [ ] الصور موجودة في `data-products/images/`
- [ ] أسماء الصور تطابق أكواد المنتجات
- [ ] الباكند يعمل (`npm run dev`)

بعد الاستيراد:

- [ ] تشغيل `npm run link:sales-channel`
- [ ] تشغيل `npm run check:products`
- [ ] فتح الموقع والتحقق من النتائج
- [ ] مسح كاش المتصفح

---

## 🎯 أفضل الممارسات

### للصور:
- ✅ استخدم صور عالية الجودة (800-1200px)
- ✅ خلفية بيضاء أو محايدة
- ✅ حجم أقل من 500KB
- ✅ نسبة مربعة (1:1)

### للبيانات:
- ✅ ابدأ بـ 5-10 منتجات كتجربة
- ✅ تأكد من صحة الأكواد (فريدة)
- ✅ استخدم أسماء ألوان من القائمة المدعومة
- ✅ راجع البيانات قبل الاستيراد

### للأداء:
- ✅ استورد على دفعات (5-10 منتجات)
- ✅ لا تستورد نفس المنتجات مرتين
- ✅ استخدم `update:products` للتحديث
- ✅ استخدم `clean:products` للبداية من جديد

---

## 📈 الخطوات التالية

1. **راجع ملفات Excel** وتأكد من الهيكل الصحيح
2. **أضف الصور** في `data-products/images/`
3. **شغل الاستيراد** باستخدام `npm run import:professional`
4. **ربط المنتجات** باستخدام `npm run link:sales-channel`
5. **تحقق من النتائج** في الموقع

---

**آخر تحديث:** 2026-05-07  
**الإصدار:** 2.0 Professional System  
**الحالة:** ✅ جاهز للاستخدام
