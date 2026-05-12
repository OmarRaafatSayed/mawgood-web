# 🤖 WhatsApp Bot Setup Guide

## 📋 المتطلبات

### 1️⃣ إنشاء حساب Twilio

1. **سجل حساب جديد:**
   - روح: https://www.twilio.com/try-twilio
   - املأ البيانات
   - Verify رقمك: `01103490837`

2. **احصل على Credentials:**
   - من Dashboard → Account Info
   - انسخ:
     - `Account SID`
     - `Auth Token`

---

### 2️⃣ تفعيل WhatsApp Sandbox (للتجربة)

1. **من Twilio Console:**
   - روح: Messaging → Try it out → Send a WhatsApp message
   - هيديك رقم: `+1 415 523 8886`
   - وكود مثل: `join abc-def`

2. **من موبايلك:**
   - افتح WhatsApp
   - ابعت رسالة للرقم: `+1 415 523 8886`
   - اكتب: `join abc-def` (الكود اللي ظهرلك)
   - هيرد عليك: "You are all set!"

3. **جرب البوت:**
   - ابعت: `منتج جديد`
   - البوت هيرد عليك!

---

### 3️⃣ إعداد Webhook

1. **من Twilio Console:**
   - روح: Messaging → Settings → WhatsApp Sandbox Settings
   - في "When a message comes in":
     - حط: `https://api.mawgood.cloud/whatsapp`
     - Method: `POST`
   - Save

---

### 4️⃣ Environment Variables

أضف في `.env`:

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 🚀 الاستخدام

### إضافة منتج:

1. **ابعت:** `منتج جديد`

2. **ابعت معلومات المنتج:**
```
30175
طقم شورت أولادي
220
اسود●بيج●بني
12
14
16
ملابس أطفال
```

3. **ابعت الصور** (حتى 10 صور)

4. **تم!** البوت هيرد بتأكيد ورابط المنتج

---

### الأوامر المتاحة:

- `منتج جديد` - إضافة منتج جديد
- `مساعدة` - عرض المساعدة
- أي رسالة تانية - رسالة ترحيب

---

## 📦 التثبيت على السيرفر

### 1. Install Dependencies:

```bash
cd /var/www/mawgood-web/backend
npm install axios
```

### 2. Add Environment Variables:

```bash
nano .env
```

أضف:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Restart Backend:

```bash
pm2 restart mawgood-backend
```

### 4. Test Webhook:

```bash
curl https://api.mawgood.cloud/whatsapp
```

يجب يرجع: `WhatsApp Bot is running`

---

## 🔧 Troubleshooting

### البوت مش بيرد:

1. **تأكد من Webhook:**
   - Twilio Console → Messaging → WhatsApp Sandbox Settings
   - تأكد الـ URL صح: `https://api.mawgood.cloud/whatsapp`

2. **تأكد من Environment Variables:**
   ```bash
   cd /var/www/mawgood-web/backend
   cat .env | grep TWILIO
   ```

3. **شوف الـ Logs:**
   ```bash
   pm2 logs mawgood-backend
   ```

### الصور مش بتتحمل:

1. **تأكد من المجلد موجود:**
   ```bash
   mkdir -p /var/www/mawgood-web/backend/static/product-images
   chmod 755 /var/www/mawgood-web/backend/static/product-images
   ```

2. **تأكد من Nginx بيخدم الصور:**
   ```bash
   curl https://api.mawgood.cloud/static/product-images/test.jpg
   ```

---

## 💰 التكلفة

### Sandbox (تجربة):
- ✅ مجاني تماماً
- ⚠️ بس محدود (لازم كل user يعمل join)

### Production:
- رسائل: $0.005/رسالة
- رقم WhatsApp Business: $15/شهر
- مثال: 1000 رسالة/شهر = $5 + $15 = $20/شهر

---

## 📞 الدعم

لو محتاج مساعدة:
- WhatsApp: 01103490837
- Email: support@mawgood.cloud

---

## 🎯 Next Steps

### للـ Production:

1. **اطلب رقم WhatsApp Business:**
   - Twilio Console → Phone Numbers → Buy a Number
   - اختار رقم مصري (لو متاح)
   - فعّل WhatsApp عليه

2. **Verify مع Meta:**
   - هيطلبوا معلومات الشركة
   - بياخد 2-3 أيام

3. **Update Webhook:**
   - غيّر من Sandbox للرقم الجديد

---

## ✅ Checklist

- [ ] حساب Twilio متعمل
- [ ] WhatsApp Sandbox مفعّل
- [ ] Webhook متظبط
- [ ] Environment variables متضافة
- [ ] Backend متعمل restart
- [ ] جربت البوت من موبايلك
- [ ] البوت بيرد على "منتج جديد"
- [ ] جربت رفع منتج كامل بالصور

---

**🎉 لما تخلص كل ده، البوت يكون شغال 100%!**
