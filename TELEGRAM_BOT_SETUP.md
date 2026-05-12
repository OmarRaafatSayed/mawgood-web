# 🤖 Telegram Bot Setup - مجاني 100%

## ✅ تم إنشاء البوت!

**Bot:** @mawgood_admin_bot
**Token:** `8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c`

---

## 🚀 الخطوات (5 دقائق)

### 1️⃣ أضف Token في السيرفر

```bash
ssh root@72.62.177.210

cd /var/www/mawgood-web/backend

nano .env
```

**أضف في آخر الملف:**
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c
```

**احفظ:** `Ctrl+X` → `Y` → `Enter`

---

### 2️⃣ Install Dependencies & Restart

```bash
# Install axios (لو مش مثبت)
npm install axios

# Restart
pm2 restart mawgood-backend

# تأكد إنه شغال
curl https://api.mawgood.cloud/telegram
```

يجب يرجع: `Telegram Bot is running`

---

### 3️⃣ Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c/setWebhook?url=https://api.mawgood.cloud/telegram"
```

يجب يرجع:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

### 4️⃣ تأكد من الـ Webhook

```bash
curl "https://api.telegram.org/bot8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c/getWebhookInfo"
```

يجب يظهر:
```json
{
  "ok": true,
  "result": {
    "url": "https://api.mawgood.cloud/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 🎉 جرب البوت!

### من Telegram:

1. **افتح Telegram**
2. **ابحث عن:** `@mawgood_admin_bot`
3. **اضغط Start**
4. **ابعت:** `/new_product`

**البوت هيرد:**
```
🎉 أهلاً! هضيف منتج جديد

ابعت المعلومات دي...
```

---

### مثال كامل:

**1. ابعت:**
```
/new_product
```

**2. ابعت:**
```
30999
تيشرت تجربة
150
اسود●ابيض●احمر
S
M
L
XL
تيشرتات
```

**3. ابعت صور** (حتى 10 صور في رسالة واحدة)

**4. البوت هيرد:**
```
✅ تم إضافة المنتج بنجاح!
📦 تيشرت تجربة
💰 150 جنيه
🎨 3 ألوان × 4 مقاسات = 12 variants
📸 3 صور

🔗 https://admin.mawgood.cloud/products/prod_xxx
```

---

## 🔧 Troubleshooting

### البوت مش بيرد:

```bash
# شوف الـ logs
pm2 logs mawgood-backend --lines 50
```

### الصور مش بتتحمل:

```bash
# اعمل المجلد
mkdir -p /var/www/mawgood-web/backend/static/product-images
chmod 755 /var/www/mawgood-web/backend/static/product-images
```

### Webhook مش شغال:

```bash
# امسح الـ webhook القديم
curl -X POST "https://api.telegram.org/bot8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c/deleteWebhook"

# حط webhook جديد
curl -X POST "https://api.telegram.org/bot8691759867:AAH2qrGlkT34boQCmACVq3OC8DFIZBUU7-c/setWebhook?url=https://api.mawgood.cloud/telegram"
```

---

## 💰 التكلفة

✅ **مجاني 100%**
- مافيش اشتراكات
- مافيش حدود على الرسائل
- مافيش حدود على الصور
- unlimited products!

---

## 📱 الأوامر المتاحة

- `/start` - رسالة ترحيب
- `/new_product` - إضافة منتج جديد
- `/help` - المساعدة
- `بدون صور` - رفع منتج بدون صور

---

## ✅ Done!

دلوقتي تقدر ترفع منتجات من Telegram مباشرة! 🚀

**Bot Link:** https://t.me/mawgood_admin_bot
