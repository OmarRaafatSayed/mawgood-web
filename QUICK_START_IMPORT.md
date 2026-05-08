# ⚡ Quick Start - Database Cleanup & Import

## 🚀 3 Simple Steps

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Wait for: `Server is ready on port: 9000`

---

### Step 2: Run Import
Open a **NEW terminal** and run:
```bash
cd backend
npm run db:cleanup-import
```

---

### Step 3: Fix Visibility
After import completes:
```bash
npm run fix:visibility
```

---

## ✅ Verify Results

**Admin Panel:** http://localhost:5173  
**Storefront:** http://localhost:3000/eg/products

---

## 📊 What to Expect

- ⏱️ **Time:** ~10 minutes
- 📦 **Products:** ~252 products
- 🎨 **Variants:** ~1000+ variants
- 🗑️ **Cleanup:** Deletes ALL existing products first

---

## ⚠️ Important

- ✅ Excel files must be in `data-products/` folder
- ✅ Backend must be running
- ✅ This will **DELETE ALL** existing products
- ✅ Make a backup if needed

---

## 🐛 If Something Goes Wrong

### Backend not running?
```bash
cd backend
npm run dev
```

### Files not found?
Check that these files exist:
```
data-products/H-I-X.xlsx
data-products/H&S.xlsx
data-products/Rehab Lafy.xlsx
data-products/مصنع E-S-H.xlsx
```

### Want to check readiness first?
```bash
npm run check:readiness
```

---

## 📚 More Documentation

- **English Guide:** `DATABASE_CLEANUP_IMPORT_GUIDE.md`
- **Arabic Guide:** `تعليمات-الاستيراد.md`
- **Technical Details:** `IMPORT_SUMMARY.md`

---

**That's it! 🎉**
