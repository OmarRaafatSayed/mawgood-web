# 🚀 Deploy to Hostinger - Quick Guide

## ⚡ Before You Start

### 1. Update Production Environment
```bash
cd backend
nano .env.production
```

**Update these values:**
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/mawgood_production
JWT_SECRET=<run: openssl rand -base64 32>
COOKIE_SECRET=<run: openssl rand -base64 32>
STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
VENDOR_CORS=https://vendor.yourdomain.com
```

### 2. Test Build Locally
```bash
# Backend
cd backend
npm run production:build
npm run production:start

# Storefront
cd storefront
npm run build
npm start

# Admin Panel
cd admin-panel
npm run build:preview

# Vendor Panel
cd vendor-panel
npm run build:preview
```

## 📤 Push to GitHub

```bash
git add .
git commit -m "Production ready - optimized for Hostinger deployment"
git push origin main
```

## 🖥️ On Hostinger Server

### Step 1: Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE mawgood_production;
CREATE USER mawgood_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE mawgood_production TO mawgood_user;
\q
```

### Step 3: Clone & Setup
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/mawgood-web.git
cd mawgood-web

# Install backend
cd backend
npm install --production
cp .env.production .env
nano .env  # Update with actual values

# Run migrations
npm run production:migrate
npm run production:seed

# Build
npm run production:build

# Install storefront
cd ../storefront
npm install --production
npm run build

# Install admin panel
cd ../admin-panel
npm install --production
npm run build:preview

# Install vendor panel
cd ../vendor-panel
npm install --production
npm run build:preview
```

### Step 4: Start Services
```bash
cd /var/www/mawgood-web
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

**Backend API:**
```bash
sudo nano /etc/nginx/sites-available/mawgood-backend
```
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 50M;
}
```

**Storefront:**
```bash
sudo nano /etc/nginx/sites-available/mawgood-storefront
```
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Admin Panel:**
```bash
sudo nano /etc/nginx/sites-available/mawgood-admin
```
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /var/www/mawgood-web/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Vendor Panel:**
```bash
sudo nano /etc/nginx/sites-available/mawgood-vendor
```
```nginx
server {
    listen 80;
    server_name vendor.yourdomain.com;

    root /var/www/mawgood-web/vendor-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Enable sites:**
```bash
sudo ln -s /etc/nginx/sites-available/mawgood-backend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL
```bash
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
sudo certbot --nginx -d vendor.yourdomain.com
```

### Step 7: Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/mawgood-web/backend/static
sudo chmod -R 755 /var/www/mawgood-web/backend/static
```

## ✅ Verify Deployment

```bash
# Test backend
curl https://api.yourdomain.com/health

# Test vendors endpoint
curl https://api.yourdomain.com/store/vendors

# Test images
curl -I https://api.yourdomain.com/static/extracted-images/H-I-X-1.jpeg
```

**Visit in browser:**
- Storefront: https://yourdomain.com
- Admin: https://admin.yourdomain.com
- Vendor: https://vendor.yourdomain.com

## 🔄 Update Deployment

```bash
cd /var/www/mawgood-web
git pull origin main

# Rebuild if needed
cd backend && npm run production:build
cd ../storefront && npm run build
cd ../admin-panel && npm run build:preview
cd ../vendor-panel && npm run build:preview

# Restart services
pm2 restart all
```

## 📊 Monitor

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Check status
pm2 status
```

## 🆘 Troubleshooting

### Backend not starting
```bash
pm2 logs mawgood-backend
# Check .env.production values
# Check database connection
```

### Images not loading
```bash
ls -la /var/www/mawgood-web/backend/static/extracted-images/
sudo chown -R www-data:www-data /var/www/mawgood-web/backend/static
```

### CORS errors
```bash
# Check .env.production CORS settings
# Restart backend
pm2 restart mawgood-backend
```

---

**Estimated Time:** 2-3 hours  
**Difficulty:** Medium  
**Status:** Ready to deploy ✅
