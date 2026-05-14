#!/bin/bash
# Deployment Fix Script for Mawgood Backend
# This script properly builds and deploys the backend

set -e  # Exit on error

echo "🚀 Starting Mawgood Backend Deployment Fix..."

# Navigate to backend directory
cd /var/www/mawgood-web/backend

echo "📦 Installing dependencies..."
npm install --production=false

echo "🔨 Building backend..."
npm run build

echo "✅ Build complete! Checking .medusa directory..."
ls -la .medusa/server/

echo "🔄 Restarting PM2 backend..."
pm2 restart mawgood-backend

echo "⏳ Waiting 10 seconds for backend to start..."
sleep 10

echo "🏥 Checking backend health..."
curl -f http://localhost:9000/health || echo "⚠️ Backend not responding yet, check logs with: pm2 logs mawgood-backend"

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status with: pm2 status"
echo "📝 Check logs with: pm2 logs mawgood-backend --lines 50"
