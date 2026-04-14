# Multi-Vendor Production Deployment Guide for Hostinger VPS

## Prerequisites

- Hostinger VPS with Ubuntu 20.04+ or similar
- Domain name(s) configured
- SSL certificates (Let's Encrypt recommended)
- PostgreSQL 14+ installed
- Redis installed and configured
- Node.js 20+ installed
- PM2 or similar process manager

## Step 1: Server Setup

### 1.1 Update System and Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget build-essential
```

### 1.2 Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20.x.x
```

### 1.3 Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.4 Install Redis

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 1.5 Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database

```bash
sudo -u postgres psql

CREATE DATABASE mawgood_production;
CREATE USER mawgood_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mawgood_production TO mawgood_user;
\q
```

### 2.2 Test Database Connection

```bash
psql -h localhost -U mawgood_user -d mawgood_production
```

## Step 3: Backend Deployment

### 3.1 Clone Repository

```bash
cd /var/www
git clone https://github.com/OmarRaafatSayed/mawgood-web.git
cd mawgood-web/backend
```

### 3.2 Setup Environment Variables

```bash
cp .env.production.template .env.production
nano .env.production
```

Update all values in `.env.production`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `REDIS_URL`: Your Redis URL
- `JWT_SECRET` and `COOKIE_SECRET`: Generate with `openssl rand -base64 32`
- `STORE_CORS`, `ADMIN_CORS`, `VENDOR_CORS`, `AUTH_CORS`: Your production domains
- `RESEND_API_KEY`: Your Resend email API key
- `STRIPE_SECRET_API_KEY`: Your Stripe live secret key
- S3/Cloudinary credentials for image storage

### 3.3 Install Dependencies

```bash
yarn install --production
```

### 3.4 Run Database Migrations

```bash
npm run production:migrate
```

### 3.5 Build the Application

```bash
npm run production:build
```

### 3.6 Seed Initial Data (Optional)

```bash
npm run production:seed
```

### 3.7 Start with PM2

```bash
pm2 start npm --name "mawgood-backend" -- run production:start
pm2 save
pm2 startup
```

## Step 4: Nginx Configuration

### 4.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 4.2 Configure Backend API

```bash
sudo nano /etc/nginx/sites-available/mawgood-backend
```

Add:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

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

    # Increase upload limit for product images
    client_max_body_size 50M;
}
```

### 4.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/mawgood-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.4 Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

## Step 5: Storefront Deployment

### 5.1 Build Storefront

```bash
cd /var/www/mawgood-web/storefront
yarn install --production

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_STORE_URL=https://store.your-domain.com
NODE_ENV=production
EOF

# Build
npm run build
```

### 5.2 Start with PM2

```bash
pm2 start npm --name "mawgood-storefront" -- start
pm2 save
```

### 5.3 Configure Nginx for Storefront

```bash
sudo nano /etc/nginx/sites-available/mawgood-storefront
```

Add:

```nginx
server {
    listen 80;
    server_name your-storefront-domain.com www.your-storefront-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo certbot --nginx -d your-storefront-domain.com -d www.your-storefront-domain.com
```

## Step 6: Vendor Panel Deployment

### 6.1 Build Vendor Panel

```bash
cd /var/www/mawgood-web/vendor-panel
yarn install --production
npm run build
```

### 6.2 Serve with Nginx

```bash
sudo nano /etc/nginx/sites-available/mawgood-vendor
```

Add:

```nginx
server {
    listen 80;
    server_name vendor.your-domain.com www.vendor.your-domain.com;

    root /var/www/mawgood-web/vendor-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://api.your-domain.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/
sudo certbot --nginx -d vendor.your-domain.com -d www.vendor.your-domain.com
```

## Step 7: Admin Panel Deployment

### 7.1 Build Admin Panel

```bash
cd /var/www/mawgood-web/admin-panel
yarn install --production
npm run build
```

### 7.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/mawgood-admin
```

Add:

```nginx
server {
    listen 80;
    server_name admin.your-domain.com www.admin.your-domain.com;

    root /var/www/mawgood-web/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://api.your-domain.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
sudo certbot --nginx -d admin.your-domain.com -d www.admin.your-domain.com
```

## Step 8: Static Files (Product Images)

### 8.1 Configure Nginx for Static Files

```bash
sudo nano /etc/nginx/sites-available/mawgood-backend
```

Add to the server block:

```nginx
location /static/ {
    alias /var/www/mawgood-web/backend/static/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 8.2 Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/mawgood-web/backend/static
sudo chmod -R 755 /var/www/mawgood-web/backend/static
```

## Step 9: Monitoring and Maintenance

### 9.1 PM2 Monitoring

```bash
pm2 list
pm2 logs mawgood-backend
pm2 monit
```

### 9.2 Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 9.3 Database Backup Script

Create `/var/www/mawgood-web/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mawgood"
mkdir -p $BACKUP_DIR

DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U mawgood_user mawgood_production > $BACKUP_DIR/mawgood_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /var/www/mawgood-web/backup.sh
```

### 9.4 Setup Cron Job for Backups

```bash
crontab -e
```

Add:

```
0 2 * * * /var/www/mawgood-web/backup.sh
```

## Step 10: Flutter App Configuration

### 10.1 Update API Base URL

In your Flutter app, update the API base URL:

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://api.your-domain.com';
  
  // Vendor endpoints
  static const String vendors = '/store/vendors';
  static const String vendorProducts = '/store/vendors';
  
  // Auth endpoints
  static const String auth = '/auth';
  static const String customers = '/store/customers';
}
```

### 10.2 Update CORS

Ensure your Flutter app's production URL is added to `AUTH_CORS` in the backend `.env.production`.

## Step 11: Testing

### 11.1 Test API Endpoints

```bash
# Test health endpoint
curl https://api.your-domain.com/health

# Test vendors endpoint
curl https://api.your-domain.com/store/vendors

# Test product listing
curl https://api.your-domain.com/store/products
```

### 11.2 Test Storefront

Visit: `https://your-storefront-domain.com`

### 11.3 Test Vendor Panel

Visit: `https://vendor.your-domain.com`

### 11.4 Test Admin Panel

Visit: `https://admin.your-domain.com`

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs mawgood-backend

# Check port is available
sudo lsof -i :9000
```

### CORS Errors

- Ensure all domains are correctly set in `.env.production`
- Check that CORS URLs don't have trailing slashes
- Restart backend after changing CORS settings

### Image Upload Issues

- Check `/static/` directory permissions
- Verify `client_max_body_size` in Nginx config
- Check S3/Cloudinary credentials if using cloud storage

## Performance Optimization

### Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Enable HTTP/2

Update Nginx listen directives:

```nginx
listen 443 ssl http2;
```

### Database Indexing

Run these SQL commands for better query performance:

```sql
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

## Security Checklist

- [ ] All secrets changed from defaults
- [ ] SSL certificates installed and auto-renewing
- [ ] Database password is strong
- [ ] JWT_SECRET and COOKIE_SECRET are random strings
- [ ] Nginx configured to block unwanted HTTP methods
- [ ] Rate limiting enabled in Nginx
- [ ] Firewall configured (ufw recommended)
- [ ] Regular backups configured
- [ ] PM2 configured with non-root user
- [ ] File permissions set correctly

## Support

For issues or questions:
- Check MedusaJS docs: https://docs.medusajs.com
- Check MercurJS docs: https://docs.mercurjs.com
- GitHub Issues: https://github.com/OmarRaafatSayed/mawgood-web/issues
