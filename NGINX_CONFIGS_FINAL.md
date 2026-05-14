# إعدادات Nginx النهائية

## 1. Backend API - /etc/nginx/sites-available/mawgood-api

```nginx
server {
    listen 80;
    server_name api.mawgood.cloud;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /static/ {
        alias /var/www/mawgood-web/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 2. Storefront - /etc/nginx/sites-available/mawgood-storefront

```nginx
server {
    listen 80;
    server_name mawgood.cloud www.mawgood.cloud;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. Admin Panel - /etc/nginx/sites-available/mawgood-admin

```nginx
server {
    listen 80;
    server_name admin.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SPA fallback - handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:5173;
    }
}
```

## 4. Vendor Panel - /etc/nginx/sites-available/mawgood-vendor

```nginx
server {
    listen 80;
    server_name vendor.mawgood.cloud;

    location / {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SPA fallback - handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:5174;
    }
}
```

## تطبيق الإعدادات

```bash
# نسخ الملفات
sudo nano /etc/nginx/sites-available/mawgood-api
# الصق المحتوى أعلاه

sudo nano /etc/nginx/sites-available/mawgood-storefront
# الصق المحتوى أعلاه

sudo nano /etc/nginx/sites-available/mawgood-admin
# الصق المحتوى أعلاه

sudo nano /etc/nginx/sites-available/mawgood-vendor
# الصق المحتوى أعلاه

# تفعيل الإعدادات
sudo ln -sf /etc/nginx/sites-available/mawgood-api /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-storefront /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-admin /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mawgood-vendor /etc/nginx/sites-enabled/

# اختبار وإعادة تحميل
sudo nginx -t
sudo systemctl reload nginx
```

## تثبيت SSL (بعد التأكد من عمل HTTP)

```bash
sudo certbot --nginx -d api.mawgood.cloud
sudo certbot --nginx -d mawgood.cloud -d www.mawgood.cloud
sudo certbot --nginx -d admin.mawgood.cloud
sudo certbot --nginx -d vendor.mawgood.cloud
```
