# ✅ Production Deployment Checklist for Hostinger

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Update `backend/.env.production` with actual database credentials
- [ ] Generate new JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate new COOKIE_SECRET: `openssl rand -base64 32`
- [ ] Update CORS domains with your actual domains
- [ ] Add Resend API key for emails

### 2. Database Setup
```bash
# On Hostinger server
sudo -u postgres psql
CREATE DATABASE mawgood_production;
CREATE USER mawgood_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mawgood_production TO mawgood_user;
\q
```

### 3. Build All Applications
```bash
# Backend
cd backend
npm run production:build

# Storefront
cd storefront
npm run build

# Admin Panel
cd admin-panel
npm run build:preview

# Vendor Panel
cd vendor-panel
npm run build:preview
```

### 4. Image Optimization ✅
- [x] All images renamed (no spaces)
- [x] Fallback SVG implemented
- [x] Cache headers configured
- [x] 486 product images ready

### 5. Performance Packages Already Installed ✅
- [x] `compression` - Gzip compression
- [x] `helmet` - Security headers
- [x] `express-rate-limit` - Rate limiting
- [x] `sharp` - Image optimization

### 6. Security Checklist
- [ ] Change all default secrets
- [ ] Enable SSL/HTTPS (Let's Encrypt)
- [ ] Configure firewall (ufw)
- [ ] Set up database backups
- [ ] Configure PM2 with non-root user

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready - optimized images and environment"
git push origin main
```

### Step 2: On Hostinger Server
```bash
# Clone repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/mawgood-web.git
cd mawgood-web

# Install dependencies
cd backend && npm install --production
cd ../storefront && npm install --production
cd ../admin-panel && npm install --production
cd ../vendor-panel && npm install --production
```

### Step 3: Configure Environment
```bash
# Backend
cd backend
cp .env.production .env
nano .env  # Update with actual values

# Run migrations
npm run production:migrate

# Seed initial data
npm run production:seed
```

### Step 4: Build Applications
```bash
# Backend
cd backend
npm run production:build

# Storefront
cd storefront
npm run build

# Admin Panel
cd admin-panel
npm run build:preview

# Vendor Panel
cd vendor-panel
npm run build:preview
```

### Step 5: Start with PM2
```bash
cd /var/www/mawgood-web
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Configure Nginx
```bash
# Copy nginx configs from DEPLOYMENT_GUIDE.md
sudo nano /etc/nginx/sites-available/mawgood-backend
sudo nano /etc/nginx/sites-available/mawgood-storefront
sudo nano /etc/nginx/sites-available/mawgood-admin
sudo nano /etc/nginx/sites-available/mawgood-vendor

# Enable sites
sudo ln -s /etc/nginx/sites-available/mawgood-* /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL
```bash
sudo certbot --nginx -d api.mawgood.com
sudo certbot --nginx -d mawgood.com -d www.mawgood.com
sudo certbot --nginx -d admin.mawgood.com
sudo certbot --nginx -d vendor.mawgood.com
```

## 🔍 Post-Deployment Verification

### Test Backend
```bash
curl https://api.mawgood.com/health
curl https://api.mawgood.com/store/vendors
```

### Test Images
```bash
curl -I https://api.mawgood.com/static/extracted-images/H-I-X-1.jpeg
```

### Test Storefront
- Visit: https://mawgood.com
- Check: Product images load
- Check: Products display correctly

### Test Admin Panel
- Visit: https://admin.mawgood.com
- Login with admin credentials
- Check: Dashboard loads

### Test Vendor Panel
- Visit: https://vendor.mawgood.com
- Login with vendor credentials
- Check: Products management works

## 📊 Performance Monitoring

### PM2 Monitoring
```bash
pm2 list
pm2 logs mawgood-backend
pm2 monit
```

### Database Backup
```bash
# Setup daily backup cron job
crontab -e
# Add: 0 2 * * * /var/www/mawgood-web/backup.sh
```

## 🐛 Common Issues & Solutions

### Images Not Loading
- Check: `/backend/static/extracted-images/` permissions
- Run: `sudo chown -R www-data:www-data /var/www/mawgood-web/backend/static`
- Run: `sudo chmod -R 755 /var/www/mawgood-web/backend/static`

### CORS Errors
- Check: `.env.production` CORS settings
- Ensure: No trailing slashes in URLs
- Restart: `pm2 restart mawgood-backend`

### Database Connection Failed
- Check: PostgreSQL is running
- Check: DATABASE_URL is correct
- Test: `psql -h localhost -U mawgood_user -d mawgood_production`

## ✅ Production Ready Status

### Current Status: 🟡 ALMOST READY

**Completed:**
- ✅ Image optimization and fallback
- ✅ Performance packages installed
- ✅ Security middleware configured
- ✅ Clean codebase (removed temp files)
- ✅ Documentation complete
- ✅ PM2 configuration ready
- ✅ Nginx configuration ready

**Remaining:**
- ⚠️ Update `.env.production` with actual credentials
- ⚠️ Generate new JWT and Cookie secrets
- ⚠️ Test build process locally first
- ⚠️ Setup Hostinger server (Node.js, PostgreSQL, Redis)

## 📝 Final Notes

1. **Test Locally First:**
   ```bash
   # Test production build locally
   cd backend
   NODE_ENV=production npm run build
   NODE_ENV=production npm start
   ```

2. **Backup Before Deploy:**
   - Backup current database if updating existing deployment
   - Keep a copy of `.env` files

3. **Monitor After Deploy:**
   - Watch PM2 logs for first 24 hours
   - Monitor server resources (CPU, RAM, Disk)
   - Check error logs regularly

4. **Performance Tips:**
   - Enable Nginx caching
   - Use CDN for static assets (optional)
   - Monitor database query performance
   - Setup Redis for caching

---

**Last Updated:** May 11, 2026
**Status:** Ready for deployment after environment configuration
**Estimated Deploy Time:** 2-3 hours
