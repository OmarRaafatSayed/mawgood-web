# Nginx Configuration — Mawgood Marketplace

## Reverse-Proxy Strategy

All frontend apps (admin, vendor, storefront) communicate with the backend
via the **relative path `/api`** only. They never contain a hard-coded domain.

```
Browser → /api/admin/products
         ↓
       Nginx  (strips /api prefix)
         ↓
       Medusa backend :9000/admin/products
```

This means:
- The same `dist/` bundle works on any server without a rebuild
- Changing the domain only requires updating Nginx, not the JS code
- No MIME-type issues from cross-origin requests in production

## Files

| File | Domain | Backend port |
|------|--------|-------------|
| `mawgood-api.conf` | api.mawgood.cloud | :9000 (direct) |
| `mawgood-admin.conf` | admin.mawgood.cloud | :5173 (SPA) + /api → :9000 |
| `mawgood-vendor.conf` | vendor.mawgood.cloud | :5174 (SPA) + /api → :9000 |
| `mawgood-storefront.conf` | mawgood.cloud | :3000 (Next.js) + /api → :9000 |

## Install on Server

```bash
# Copy all configs
sudo cp nginx/*.conf /etc/nginx/sites-available/

# Enable them
for conf in mawgood-api mawgood-admin mawgood-vendor mawgood-storefront; do
  sudo ln -sf /etc/nginx/sites-available/${conf}.conf /etc/nginx/sites-enabled/
done

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

## SSL (after HTTP is working)

```bash
sudo certbot --nginx \
  -d api.mawgood.cloud \
  -d admin.mawgood.cloud \
  -d vendor.mawgood.cloud \
  -d mawgood.cloud \
  -d www.mawgood.cloud
```

Then uncomment the HTTPS server blocks in each `.conf` file.

## Dev vs Production

| Environment | How /api is handled |
|-------------|---------------------|
| Development (Vite) | Vite `server.proxy` forwards `/api` → `localhost:9000` |
| Development (Next.js) | `next.config.ts` `rewrites()` forwards `/api` → `localhost:9000` |
| Production | Nginx `location /api/` block forwards to `:9000` |
