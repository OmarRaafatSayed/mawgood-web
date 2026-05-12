#!/bin/bash
# ============================================================
# Professional Product Deployment Script
# سكربت نشر احترافي للمنتجات - يعمل بضغطة زر واحدة
# ============================================================

set -e  # Exit on error

echo "============================================================"
echo "🚀 Mawgood Product Deployment"
echo "============================================================"
echo ""

# ============================================================
# Step 1: Convert Excel to JSON
# ============================================================
echo "📊 Step 1: Converting Excel files to validated JSON..."
echo "------------------------------------------------------------"

if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

python3 scripts/excel-to-json-validator.py

if [ ! -f "backend/scripts/imports/products-validated.json" ]; then
    echo "❌ Error: JSON file was not created"
    exit 1
fi

# Check if JSON has products
PRODUCT_COUNT=$(python3 -c "import json; data=json.load(open('backend/scripts/imports/products-validated.json')); print(len(data))")

if [ "$PRODUCT_COUNT" -eq 0 ]; then
    echo "❌ Error: No valid products found in JSON"
    echo "Please check your Excel files in data-products/"
    exit 1
fi

echo "✅ Found $PRODUCT_COUNT validated products"
echo ""

# ============================================================
# Step 2: Upload to Server
# ============================================================
echo "📤 Step 2: Uploading files to server..."
echo "------------------------------------------------------------"

SERVER="root@72.62.177.210"
REMOTE_PATH="/var/www/mawgood-web"

# Upload JSON file
echo "Uploading products JSON..."
scp backend/scripts/imports/products-validated.json $SERVER:$REMOTE_PATH/backend/scripts/imports/

# Upload import script
echo "Uploading import script..."
scp backend/scripts/import-from-json.ts $SERVER:$REMOTE_PATH/backend/scripts/

echo "✅ Files uploaded"
echo ""

# ============================================================
# Step 3: Run Import on Server
# ============================================================
echo "🔄 Step 3: Running import on server..."
echo "------------------------------------------------------------"

ssh $SERVER << 'ENDSSH'
set -e

cd /var/www/mawgood-web/backend

echo "Compiling TypeScript..."
npx tsc scripts/import-from-json.ts --esModuleInterop --resolveJsonModule --skipLibCheck

echo ""
echo "Running import..."
npx medusa exec ./scripts/import-from-json.js

echo ""
echo "✅ Import completed on server"
ENDSSH

echo ""

# ============================================================
# Step 4: Verify Products
# ============================================================
echo "🔍 Step 4: Verifying products..."
echo "------------------------------------------------------------"

ssh $SERVER << 'ENDSSH'
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mawgood.cloud","password":"Admin@123456"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Check product count
PRODUCT_COUNT=$(curl -s http://localhost:9000/store/products \
  -H "x-publishable-api-key: pk_96276f993950aba8a7b5d21380f31f873986c63520b6c74330aea576a3b728a5" | \
  grep -o '"count":[0-9]*' | cut -d':' -f2)

echo "Total products in store: $PRODUCT_COUNT"

# Check first product price
FIRST_PRODUCT=$(curl -s http://localhost:9000/store/products?limit=1 \
  -H "x-publishable-api-key: pk_96276f993950aba8a7b5d21380f31f873986c63520b6c74330aea576a3b728a5")

echo ""
echo "Sample product data:"
echo "$FIRST_PRODUCT" | python3 -m json.tool | head -50

ENDSSH

echo ""
echo "============================================================"
echo "✅ Deployment Complete!"
echo "============================================================"
echo ""
echo "🌐 Check your store:"
echo "   Admin Panel: https://admin.mawgood.cloud"
echo "   Storefront:  https://mawgood.cloud"
echo ""
echo "============================================================"
