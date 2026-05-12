# 🚀 WhatsApp Bot - Quick Start (5 دقائق)

## ✅ الخطوات السريعة

### 1️⃣ سجل في Twilio (دقيقتين)

```
1. روح: https://www.twilio.com/try-twilio
2. سجل بإيميلك
3. Verify رقمك: 01103490837
4. خش Dashboard
```

### 2️⃣ فعّل WhatsApp Sandbox (دقيقة)

```
1. من Dashboard → Messaging → Try WhatsApp
2. هيظهرلك رقم: +1 415 523 8886
3. وكود مثل: join abc-def
```

**من موبايلك:**
```
1. افتح WhatsApp
2. ابعت لـ: +1 415 523 8886
3. اكتب: join abc-def
4. هيرد: "You are all set!"
```

### 3️⃣ انسخ الـ Credentials (30 ثانية)

```
من Dashboard → Account Info:
- Account SID: ACxxxxxxxxxxxx
- Auth Token: xxxxxxxxxxxx
```

### 4️⃣ ظبط السيرفر (دقيقة)

**على السيرفر:**

```bash
ssh root@72.62.177.210

cd /var/www/mawgood-web/backend

# أضف الـ credentials
nano .env
```

**أضف في آخر الملف:**
```env
# Twilio WhatsApp Bot
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**احفظ:** `Ctrl+X` → `Y` → `Enter`

### 5️⃣ Install & Restart (30 ثانية)

```bash
# Install axios
npm install axios

# Restart
pm2 restart mawgood-backend

# تأكد إنه شغال
curl https://api.mawgood.cloud/whatsapp
```

يجب يرجع: `WhatsApp Bot is running`

### 6️⃣ ظبط Webhook (30 ثانية)

```
1. Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
2. في "When a message comes in":
   URL: https://api.mawgood.cloud/whatsapp
   Method: POST
3. Save
```

---

## 🎉 جرب البوت!

**من موبايلك (WhatsApp):**

```
ابعت لـ: +1 415 523 8886

اكتب: منتج جديد
```

**البوت هيرد:**
```
🎉 أهلاً! هضيف منتج جديد

ابعت المعلومات دي...
```

**ابعت:**
```
30999
تيشرت تجربة
150
اسود●ابيض
M●L●XL
تيشرتات
```

**ابعت صورة** (أي صورة)

**البوت هيرد:**
```
✅ تم إضافة المنتج بنجاح!
📦 تيشرت تجربة
💰 150 جنيه
...
```

---

## 🔧 لو حصلت مشكلة

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

---

## 📞 محتاج مساعدة؟

WhatsApp: 01103490837

---

## ✅ Done!

دلوقتي تقدر ترفع منتجات من WhatsApp مباشرة! 🚀
