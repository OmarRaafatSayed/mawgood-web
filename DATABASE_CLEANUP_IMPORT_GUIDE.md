# 🗑️ Full Database Cleanup & High-Fidelity Import Guide

## 📋 Overview

This guide explains how to perform a **complete database cleanup** and **high-fidelity data import** from 4 Excel files into your MedusaJS backend.

---

## 📊 Data Files Summary

| File | Vendor | Rows | Sheet Name | Price Column |
|------|--------|------|------------|--------------|
| `H-I-X.xlsx` | H-I-X | 44 | Sheet2 | السعر بالجنيه |
| `H&S.xlsx` | H&S | 92 | Sheet2 | السعر بالجنيه |
| `Rehab Lafy.xlsx` | Rehab Lafy | 71 | Sheet1 | السعر بالجنيه |
| `مصنع E-S-H.xlsx` | E-S-H Factory | 47 | Sheet1 | السعر بالجنيه |
| **TOTAL** | | **~254 products** | | |

---

## 🔧 What the Script Does

### ✅ Step 1: Database Cleanup
- **Deletes ALL existing products** from the database
- Removes products in batches of 50 to avoid memory issues
- Provides progress updates during deletion

### ✅ Step 2: Pre-Import Analysis
- Reads all 4 Excel files from `data-products/` folder
- Maps columns to Medusa Product Schema:
  - `CODE` → Product SKU
  - `وصف المنتج` → Product Title & Description
  - `السعر بالجنيه` → Price (in EGP)
  - `اللون` → Colors (translated from Arabic to English)
  - `المقاس` → Sizes (M, L, XL, XXL, etc.)
  - `الصنف` → Category (translated from Arabic to English)
  - `صوره المنتج 1-5` → Product Images (currently empty, uses placeholders)

### ✅ Step 3: Data Validation
- **Required Fields Check:**
  - SKU (Code) must exist
  - Price must be > 0
  - Title/Description (uses SKU if missing)
  
- **Data Integrity:**
  - Removes duplicate SKUs (keeps first occurrence)
  - Validates price format (handles both numeric and string values)
  - Translates Arabic colors to English
  - Translates Arabic categories to English
  
- **Missing Data Handling:**
  - If colors missing → uses "Default"
  - If sizes missing → uses "One Size"
  - If category missing → uses "General"
  - If description missing → generates from SKU + Vendor

### ✅ Step 4: Product Creation
- Creates products with all variants (Color × Size combinations)
- Generates unique SKUs for each variant: `{CODE}-{COLOR}-{SIZE}`
- Sets status to `PUBLISHED`
- Links to Sales Channel automatically
- Creates product categories if they don't exist
- Adds metadata: vendor, import date, source file, source row

### ✅ Step 5: Inventory Setup
- Sets inventory to **300 units** per variant
- Links to default stock location

### ✅ Step 6: Detailed Reporting
- Total products processed
- Successfully imported count
- Failed products with reasons
- Duplicate SKUs skipped
- Total variants created
- Total images linked

---

## 🚀 How to Run

### Prerequisites
1. **Backend must be running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Excel files must be in the correct location:**
   ```
   MawgoodWep/
   ├── data-products/
   │   ├── H-I-X.xlsx
   │   ├── H&S.xlsx
   │   ├── Rehab Lafy.xlsx
   │   └── مصنع E-S-H.xlsx
   └── backend/
   ```

### Run the Script

**Option 1: Using npm script (recommended)**
```bash
cd backend
npm run db:cleanup-import
```

**Option 2: Direct execution**
```bash
cd backend
npx medusa exec ./scripts/full-database-cleanup-and-import.ts
```

---

## 📊 Expected Output

```
================================================================================
🚀 FULL DATABASE CLEANUP AND HIGH-FIDELITY IMPORT
================================================================================
This script will:
  1. Delete ALL existing products from the database
  2. Import products from 4 Excel files with strict validation
  3. Provide detailed import statistics
================================================================================

================================================================================
🗑️  STEP 1: DATABASE CLEANUP
================================================================================
Found 150 products to delete
⚠️  This will DELETE ALL PRODUCTS from the database!
   Deleted batch 1: 50/150 products
   Deleted batch 2: 100/150 products
   Deleted batch 3: 150/150 products
✅ Database cleanup complete: 150 products deleted

================================================================================
📋 STEP 2: LOADING REQUIRED ENTITIES
================================================================================
✅ Sales Channel: sc_01HXXX...
✅ Stock Location: sloc_01HXXX...

================================================================================
📂 STEP 3: READING EXCEL FILES
================================================================================
Data directory: C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products

📄 Parsing: H-I-X.xlsx
   Sheet: Sheet2
   Total rows: 43
   Columns found: Code=0, Price=10, Desc=7, Category=10, Color=5, Size=6
✅ H-I-X.xlsx: 44 products

📄 Parsing: H&S.xlsx
   Sheet: Sheet2
   Total rows: 91
✅ H&S.xlsx: 92 products

📄 Parsing: Rehab Lafy.xlsx
   Sheet: Sheet1
   Total rows: 70
✅ Rehab Lafy.xlsx: 71 products

📄 Parsing: مصنع E-S-H.xlsx
   Sheet: Sheet1
   Total rows: 46
✅ مصنع E-S-H.xlsx: 47 products

================================================================================
✔️  STEP 4: VALIDATING PRODUCTS
================================================================================
⚠️  Row 15: No colors specified - will use "Default"
⚠️  Duplicate SKU: HIX002 (Row 3, H-I-X.xlsx)

✅ Validation complete:
   Valid products: 252
   Invalid products: 2
   Duplicate SKUs: 0

================================================================================
📁 STEP 5: CREATING CATEGORIES
================================================================================
✅ Created category: T-Shirts
✅ Created category: Dresses
✅ Created category: Shirts

================================================================================
📦 STEP 6: IMPORTING PRODUCTS
================================================================================
   Batch 1: ✅ 5/252 (2%)
   Batch 2: ✅ 10/252 (4%)
   ...
   Batch 50: ✅ 250/252 (99%)
   Batch 51: ✅ 252/252 (100%)

================================================================================
📊 STEP 7: SETTING INVENTORY LEVELS
================================================================================
✅ Inventory set for 1008 items (300 units each)

================================================================================
📊 IMPORT SUMMARY
================================================================================
Total rows processed: 254
✅ Successfully imported: 252 products
   Total variants created: 1008
   Total images linked: 252
❌ Failed: 2 products
⚠️  Duplicate SKUs skipped: 0

❌ Failed Rows:
   Row 45 (H&S.xlsx): Invalid price: 0

================================================================================
✅ IMPORT COMPLETE!
================================================================================

📋 Next steps:
   1. Run visibility fix: npm run fix:visibility
   2. Check storefront: http://localhost:3000/eg
   3. Check admin panel: http://localhost:5173
```

---

## 🎯 Data Mapping Details

### Color Translation (Arabic → English)
```
ابيض/أبيض → White
اسود/أسود → Black
رمادي → Gray
زيتي → Olive
نبيتي → Navy
بيج → Beige
بني → Brown
سماوي → Sky Blue
ازرق/أزرق → Blue
كحلي → Dark Blue
بترولي → Petrol
مينت جرين → Mint Green
موف → Mauve
برتقالي → Orange
رصاصي → Silver Gray
مسترده → Mustard
اصفر/أصفر → Yellow
جملي → Camel
سيمون → Salmon
```

### Category Translation (Arabic → English)
```
تيشرت/تيشيرت → T-Shirts
قميص → Shirts
دريس/فستان → Dresses
بنطلون → Pants
جاكيت → Jackets
بلوزة → Blouses
جيبة → Skirts
شورت → Shorts
بدلة → Suits
```

### Variant Generation Logic

**Example 1: Multiple Colors & Sizes**
```
Product: تيشرت بلياقه (ESH001)
Colors: White, Black, Olive
Sizes: M, L, XL, XXL

Generated Variants:
- White / M (SKU: ESH001-WHI-M)
- White / L (SKU: ESH001-WHI-L)
- White / XL (SKU: ESH001-WHI-XL)
- White / XXL (SKU: ESH001-WHI-XXL)
- Black / M (SKU: ESH001-BLA-M)
- Black / L (SKU: ESH001-BLA-L)
... (12 variants total)
```

**Example 2: Multiple Colors Only**
```
Product: دريس خروج (831)
Colors: Olive, White, Mustard, Blue, Petrol, Mint Green
Sizes: One Size

Generated Variants:
- Olive (SKU: 831-OLI)
- White (SKU: 831-WHI)
- Mustard (SKU: 831-MUS)
... (6 variants total)
```

---

## ⚠️ Important Notes

### 🔴 Before Running
1. **Backup your database!** This script deletes ALL products
2. **Close Excel files** - they must not be open
3. **Ensure backend is running** on port 9000
4. **Check file paths** - Excel files must be in `data-products/`

### 🟡 During Execution
1. **Do not interrupt** - let the script complete
2. **Monitor console output** for errors
3. **Check validation warnings** - they indicate data issues

### 🟢 After Execution
1. **Run visibility fix:**
   ```bash
   npm run fix:visibility
   ```
2. **Verify in Admin Panel:** http://localhost:5173
3. **Check Storefront:** http://localhost:3000/eg
4. **Review failed rows** if any

---

## 🐛 Troubleshooting

### Error: "File not found"
```
⚠️  File not found: H-I-X.xlsx
```
**Solution:** Ensure Excel files are in `MawgoodWep/data-products/` folder

### Error: "Invalid price: 0"
```
❌ Row 45 (H&S.xlsx): Invalid price: 0
```
**Solution:** Check the Excel file - price column must have a valid number

### Error: "Duplicate SKU"
```
⚠️  Duplicate SKU: HIX002 (Row 3, H-I-X.xlsx)
```
**Solution:** The script automatically skips duplicates, keeping the first occurrence

### Error: "Backend not running"
```
Error: connect ECONNREFUSED 127.0.0.1:9000
```
**Solution:** Start the backend first:
```bash
cd backend
npm run dev
```

---

## 📈 Performance

- **Processing Speed:** ~50 products/minute
- **Memory Usage:** ~200MB for 250 products
- **Database Operations:** Batched (5 products per batch)
- **Estimated Time:** 5-10 minutes for 254 products

---

## 🔄 Re-running the Script

You can run this script multiple times. Each time it will:
1. Delete ALL existing products
2. Re-import from Excel files
3. Generate fresh data

**Use cases:**
- Excel data has been updated
- Need to fix import errors
- Want to reset the product database

---

## 📝 Script Location

```
backend/scripts/full-database-cleanup-and-import.ts
```

**Added to package.json as:**
```json
"db:cleanup-import": "medusa exec ./scripts/full-database-cleanup-and-import.ts"
```

---

## ✅ Success Criteria

After successful import, you should have:
- ✅ ~252 products in the database
- ✅ ~1000+ variants (depending on color/size combinations)
- ✅ All products with status = PUBLISHED
- ✅ All products linked to Sales Channel
- ✅ All variants with inventory = 300 units
- ✅ All products categorized correctly
- ✅ All colors translated to English
- ✅ All products visible in storefront

---

## 🎉 Next Steps After Import

1. **Run visibility fix:**
   ```bash
   npm run fix:visibility
   ```

2. **Update product images:**
   - Currently using placeholder images from Unsplash
   - Add real product images via Admin Panel
   - Or update the `images` columns in Excel and re-import

3. **Review products in Admin Panel:**
   - Check product details
   - Verify prices
   - Confirm variants
   - Update descriptions if needed

4. **Test in Storefront:**
   - Browse products: http://localhost:3000/eg/products
   - Test filtering by category
   - Test color/size selection
   - Test add to cart

---

## 📞 Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Review the "Failed Rows" section in the summary
3. Verify Excel file structure matches expected format
4. Ensure all required columns exist in Excel files

---

**Created by:** Kiro AI  
**Date:** May 8, 2026  
**Version:** 1.0.0
