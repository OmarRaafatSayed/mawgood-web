# Quick Start Guide - Product Upload

## Prerequisites
1. Backend running on http://localhost:9000
2. Python 3.x installed
3. Admin credentials ready

## Installation
```bash
pip install pandas openpyxl requests
```

## Usage
```bash
cd C:\Users\EXPRESS\Downloads\coding\MawgoodWep
python scripts/upload_products_v2.py
```

## What it does
1. ✅ Authenticates with admin credentials
2. 🗑️ Deletes ALL existing products
3. 📤 Uploads products from 4 Excel files:
   - H-I-X.xlsx (44 products)
   - H&S.xlsx (64 products)
   - Rehab Lafy.xlsx (64 products)
   - مصنع E-S-H.xlsx (40 products)

## Excel Structure Required
- **CODE**: Product code (required)
- **وصف المنتج**: Product description (required)
- **الصنف**: Category (required)
- **اللون**: Colors separated by ● and \n (optional)
- **المقاس**: Sizes separated by \n (optional)
- **السعر بالجنيه**: Price in EGP (required)
- **السعر بالريال**: Price in SAR (optional)

## Features
✅ Automatic variant generation (color × size combinations)
✅ Price conversion (SAR to EGP if needed)
✅ Missing data handling (fills defaults)
✅ SKU generation
✅ Unique handle generation
✅ Error reporting

## Safety
⚠️ **WARNING**: This script will DELETE ALL existing products!
- Make a database backup first
- Type 'YES' to confirm deletion

## Output
- Total products processed
- Success count
- Failed count
- Error details (first 10)

## Troubleshooting
- **401 Error**: Check admin credentials
- **Connection Error**: Ensure backend is running
- **400 Error**: Check Excel data format
- **File Error**: Verify Excel files exist in data-products/

## Support
Check the detailed Arabic guide: `README_UPLOAD.md`
