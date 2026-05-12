#!/bin/bash

# ========================================
# Script to Fix PM2 Errors - Mawgood Project
# ========================================

echo "🔧 Fixing PM2 errors..."

# Stop all processes
echo "⏹️  Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Clear PM2 logs
echo "🗑️  Clearing PM2 logs..."
pm2 flush

# Fix mawgood-admin (errored)
echo "🔧 Fixing mawgood-admin..."
cd /var/www/Mawgood/admin-panel
npm install
npm run build
pm2 start npm --name "mawgood-admin" -- run preview -- --port 5173 --host 0.0.0.0

# Fix mawgood-storefront (errored)
echo "🔧 Fixing mawgood-storefront..."
cd /var/www/Mawgood/storefront
npm install
npm run build
pm2 start npm --name "mawgood-storefront" -- start

# Fix mawgood-vendor (errored)
echo "🔧 Fixing mawgood-vendor..."
cd /var/www/Mawgood/vendor-panel
npm install
npm run build
pm2 start npm --name "mawgood-vendor" -- run preview -- --port 5174 --host 0.0.0.0

# Restart backend (it's online but let's ensure it's fresh)
echo "🔄 Restarting mawgood-backend..."
cd /var/www/Mawgood/backend
pm2 restart mawgood-backend

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo "✅ Done! Current status:"
pm2 status

echo ""
echo "📊 Check logs with:"
echo "   pm2 logs mawgood-admin"
echo "   pm2 logs mawgood-storefront"
echo "   pm2 logs mawgood-vendor"
