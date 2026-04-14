# Multi-Vendor Architecture Implementation Summary

## Overview

This document summarizes the complete multi-vendor architecture implementation for the Mawgood platform, built on MedusaJS 2.11.3 with MercurJS B2B/B2C suite. The system is production-ready and configured for deployment on Hostinger VPS.

---

## Architecture Components

### 1. Backend (MedusaJS + MercurJS)

**Core Technologies:**
- MedusaJS 2.11.3
- MercurJS B2B/B2C Suite 1.5.3
- PostgreSQL (Production Database)
- Redis (Caching & Queues)
- TypeScript

**Existing Infrastructure:**
The project already had significant multi-vendor support through `@mercurjs/b2c-core`:
- ✅ Seller entity (provided by MercurJS)
- ✅ Product-seller relationship (`seller_id` field)
- ✅ Seller management workflows
- ✅ Commission tracking (`@mercurjs/commission`)
- ✅ Seller-specific notifications

**New Implementations:**

#### A. Custom API Endpoints

1. **Store (Public) Endpoints:**
   - `GET /store/vendors` - List all active vendors
   - `GET /store/vendors/:id/products` - Get vendor-specific products

2. **Vendor (Authenticated) Endpoints:**
   - `GET /vendor/products` - Vendor manages their products

3. **Admin (Protected) Endpoints:**
   - `GET /admin/vendors` - List all vendors
   - `GET /admin/vendors/:id` - Get vendor details
   - `PATCH /admin/vendors/:id` - Update vendor
   - `DELETE /admin/vendors/:id` - Delete vendor

#### B. Middleware System

**File:** `backend/src/api/middlewares/vendor-auth.ts`

Three middleware functions:
1. `isVendor` - Verifies user is an active vendor
2. `isAdmin` - Verifies user is an admin
3. `vendorOwnsResource` - Ensures vendors can only access their own resources

**File:** `backend/src/api/middlewares.ts`

Routes middleware configuration using MedusaJS `defineMiddlewares`.

#### C. Event Subscribers

1. **Vendor Onboarding** (`backend/src/subscribers/vendor-onboarding.ts`)
   - Listens to: `seller.created`
   - Actions:
     - Creates default stock location
     - Sets up shipping options
     - Sends welcome email
     - Initializes commission tracking

2. **Product Approval** (`backend/src/subscribers/product-approval.ts`)
   - Listens to: `product.created`, `product.updated`
   - Actions:
     - Notifies vendor on product approval/rejection
     - Updates product visibility
     - Notifies admin of new submissions

#### D. CORS Configuration

**File:** `backend/medusa-config.ts`

Updated with environment-aware CORS:
- **Development:** localhost URLs
- **Production:** Configured domain names
- **Flutter App:** Included in AUTH_CORS

```typescript
const STORE_CORS = process.env.NODE_ENV === 'production'
  ? (process.env.STORE_CORS || 'https://your-storefront-domain.com')
  : (process.env.STORE_CORS || 'http://localhost:8000')
```

---

### 2. Storefront (Next.js)

**Core Technologies:**
- Next.js (App Router)
- React 18
- TypeScript
- TailwindCSS
- MedusaJS SDK

**Existing Infrastructure:**
- ✅ Seller pages (`/sellers/[handle]`)
- ✅ ProductDetailsSeller component
- ✅ Seller data fetching (`getSellerByHandle`)
- ✅ Filter system (price, size, color, condition)
- ✅ Seller rating filter

**New Implementations:**

#### A. Vendor Filter Component

**File:** `storefront/src/components/cells/VendorFilter/VendorFilter.tsx`

Features:
- Fetches active vendors from backend API
- Checkbox-based multi-select interface
- Integrates with existing `useFilters` hook
- Displays vendor name and photo
- URL-based state management (`?seller_id=id1,id2`)

#### B. Filter Integration

Updated filter helper:
**File:** `storefront/src/lib/helpers/get-faced-filters.ts`

Added `seller_id` to facet filter mapping:
```typescript
case "seller_id":
  return "seller_id"
```

#### C. Sidebar Integration

Updated both sidebar variants:
1. `ProductSidebar.tsx` - Standard version
2. `AlgoliaProductSidebar.tsx` - Algolia-powered version

Both now include `<VendorFilter />` in the filter list.

---

### 3. Production Deployment Configuration

#### A. Environment Variables

**File:** `backend/.env.production.template`

Complete template with:
- PostgreSQL connection (`DATABASE_URL`)
- Redis configuration (`REDIS_URL`)
- Security secrets (JWT, Cookie)
- CORS domains
- Resend email API
- Stripe payment keys
- S3/Cloudinary for images
- Algolia search (optional)

#### B. Package.json Scripts

**File:** `backend/package.json`

Added production-optimized scripts:

```json
{
  "production:build": "NODE_ENV=production medusa build",
  "production:start": "NODE_ENV=production medusa start",
  "production:migrate": "NODE_ENV=production medusa db:migrate",
  "production:seed": "NODE_ENV=production medusa exec ./src/scripts/seed.ts",
  "db:migrate": "medusa db:migrate",
  "db:reset": "medusa db:reset",
  "db:setup": "medusa db:create && medusa db:migrate"
}
```

#### C. Deployment Guide

**File:** `DEPLOYMENT_GUIDE.md`

Comprehensive 11-step guide covering:
1. Server setup (Ubuntu, Node.js, PostgreSQL, Redis)
2. Database creation
3. Backend deployment with PM2
4. Nginx configuration
5. Storefront deployment
6. Vendor panel deployment
7. Admin panel deployment
8. Static files handling
9. Monitoring & maintenance
10. Flutter app configuration
11. Testing procedures

Includes:
- SSL setup (Let's Encrypt)
- PM2 process management
- Database backup scripts
- Cron job automation
- Performance optimization tips
- Security checklist

---

### 4. Documentation

#### A. API Documentation

**File:** `API_DOCUMENTATION.md`

Complete API reference with:
- All endpoints (store, vendor, admin)
- Request/response examples
- cURL examples
- Flutter/Dart integration example
- Authentication guide
- Error handling
- Rate limiting info

#### B. Implementation Summary

**File:** `MULTI_VENDOR_SUMMARY.md` (this document)

---

## File Structure

### Backend Files Created/Modified

```
backend/
├── src/
│   ├── api/
│   │   ├── middlewares.ts                    [NEW] Main middleware config
│   │   ├── middlewares/
│   │   │   └── vendor-auth.ts                [NEW] Auth middleware functions
│   │   ├── store/
│   │   │   └── vendors/
│   │   │       ├── route.ts                  [NEW] Public vendor listing
│   │   │       ├── middleware.ts             [NEW] Vendor route middleware
│   │   │       └── [id]/
│   │   │           └── products/
│   │   │               └── route.ts          [NEW] Vendor products endpoint
│   │   ├── vendor/
│   │   │   └── products/
│   │   │       └── route.ts                  [NEW] Vendor-managed products
│   │   └── admin/
│   │       └── vendors/
│   │           ├── route.ts                  [NEW] Admin vendor listing
│   │           └── [id]/
│   │               └── route.ts              [NEW] Admin vendor CRUD
│   └── subscribers/
│       ├── vendor-onboarding.ts              [NEW] New vendor workflow
│       └── product-approval.ts               [NEW] Product approval system
├── medusa-config.ts                          [MODIFIED] Enhanced CORS config
├── package.json                              [MODIFIED] Production scripts
└── .env.production.template                  [NEW] Production env template
```

### Storefront Files Created/Modified

```
storefront/
└── src/
    ├── components/
    │   ├── cells/
    │   │   ├── VendorFilter/
    │   │   │   ├── VendorFilter.tsx          [NEW] Vendor filter component
    │   │   │   └── index.ts                  [NEW] Export file
    │   │   └── index.ts                      [MODIFIED] Added VendorFilter export
    │   └── organisms/
    │       └── ProductSidebar/
    │           ├── ProductSidebar.tsx        [MODIFIED] Added VendorFilter
    │           └── AlgoliaProductSidebar.tsx [MODIFIED] Added VendorFilter
    └── lib/
        └── helpers/
            └── get-faced-filters.ts          [MODIFIED] Added seller_id support
```

### Documentation Files Created

```
mercur/
├── DEPLOYMENT_GUIDE.md                       [NEW] Complete deployment guide
├── API_DOCUMENTATION.md                      [NEW] API reference documentation
└── MULTI_VENDOR_SUMMARY.md                   [NEW] This file
```

---

## Database Schema

### Existing Entities (MedusaJS + MercurJS)

**Seller Entity** (from @mercurjs/b2c-core):
```
seller
├── id (string, primary key)
├── name (string)
├── handle (string, unique)
├── description (text, nullable)
├── photo (string, nullable)
├── email (string)
├── store_status (enum: ACTIVE, SUSPENDED, INACTIVE)
├── tax_id (string, nullable)
├── created_at (datetime)
├── updated_at (datetime)
└── address (one-to-one)
    ├── address_line
    ├── city
    ├── country_code
    └── postal_code
```

**Product Entity** (extended by MercurJS):
```
product
├── id (string, primary key)
├── title (string)
├── handle (string, unique)
├── description (text)
├── status (enum: draft, published, proposed, rejected)
├── seller_id (string, foreign key → seller.id)
├── created_at (datetime)
└── updated_at (datetime)
```

**User Entity** (with role support):
```
user
├── id (string, primary key)
├── email (string, unique)
├── actor_type (enum: admin, vendor, customer)
└── ... (other auth fields)
```

---

## API Endpoints Summary

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/store/vendors` | List active vendors |
| GET | `/store/vendors/:id/products` | Get vendor products |
| GET | `/store/seller/:handle` | Get seller by handle |

### Vendor Endpoints (Vendor JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendor/products` | Get own products |
| POST | `/vendor/products` | Create product |
| PATCH | `/vendor/products/:id` | Update product |
| DELETE | `/vendor/products/:id` | Delete product |

### Admin Endpoints (Admin JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/vendors` | List all vendors |
| GET | `/admin/vendors/:id` | Get vendor details |
| PATCH | `/admin/vendors/:id` | Update vendor |
| DELETE | `/admin/vendors/:id` | Delete vendor |

---

## Security Features

### 1. Authentication & Authorization

- **JWT-based authentication** with role verification
- **Middleware protection** for vendor and admin routes
- **Resource ownership** validation (vendors can only access their data)
- **Role-based access control** (ADMIN, VENDOR, CUSTOMER)

### 2. CORS Protection

- **Environment-aware** CORS configuration
- **Separate domains** for storefront, admin, vendor panels
- **Flutter app support** in AUTH_CORS

### 3. Production Security

- **Strong secrets** generation (JWT_SECRET, COOKIE_SECRET)
- **SSL/TLS** encryption (Let's Encrypt)
- **Database** password protection
- **Rate limiting** via Nginx

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Hostinger VPS (Ubuntu)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Nginx (Reverse Proxy + SSL)    │   │
│  │  - api.your-domain.com          │   │
│  │  - your-storefront-domain.com   │   │
│  │  - vendor.your-domain.com       │   │
│  │  - admin.your-domain.com        │   │
│  └─────────┬───────────────────────┘   │
│            │                            │
│  ┌─────────┴───────────────────────┐   │
│  │  PM2 Process Manager            │   │
│  │  - mawgood-backend (port 9000)  │   │
│  │  - mawgood-storefront (3000)    │   │
│  │  - mawgood-vendor (static)      │   │
│  │  - mawgood-admin (static)       │   │
│  └─────────┬───────────────────────┘   │
│            │                            │
│  ┌─────────┴───────────────────────┐   │
│  │  Services                       │   │
│  │  - PostgreSQL (port 5432)       │   │
│  │  - Redis (port 6379)            │   │
│  │  - Static Files (/static/)      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         │
         └──► Flutter App (iOS/Android)
```

---

## Performance Optimizations

### Backend
- **Database indexing** on `seller_id`, `status`, `handle`
- **Redis caching** for frequently accessed data
- **Pagination** on all list endpoints
- **Query optimization** with selective field loading

### Frontend
- **Next.js SSR/SSG** for fast initial load
- **Image optimization** via Next.js Image component
- **Code splitting** and lazy loading
- **CDN-ready** static asset configuration

### Nginx
- **Gzip compression** enabled
- **HTTP/2** support
- **Browser caching** headers
- **Static file serving** for product images

---

## Monitoring & Maintenance

### PM2 Monitoring
```bash
pm2 list                    # View all processes
pm2 logs mawgood-backend    # View backend logs
pm2 monit                   # Real-time monitoring
```

### Database Backups
- **Automated daily backups** via cron job
- **7-day retention** policy
- **SQL dump** format for easy restoration

### Log Management
- **PM2 logrotate** plugin installed
- **10MB max size** per log file
- **7-day retention**

---

## Testing Strategy

### Backend Testing
```bash
npm run test:unit           # Unit tests
npm run test:integration:http  # HTTP integration tests
npm run test:integration:modules # Module tests
```

### API Testing (Manual)
```bash
# Test health
curl https://api.your-domain.com/health

# Test vendors endpoint
curl https://api.your-domain.com/store/vendors

# Test with authentication
curl -H "Authorization: Bearer <token>" \
  https://api.your-domain.com/vendor/products
```

### Storefront Testing
- Visit all pages (home, products, vendors, etc.)
- Test filter functionality
- Test vendor filter specifically
- Verify responsive design

---

## Flutter Integration Guide

### 1. API Configuration

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://api.your-domain.com';
  
  // Vendor endpoints
  static const String vendors = '/store/vendors';
  static const String vendorProducts = '/store/vendors';
  static const String seller = '/store/seller';
  
  // Auth
  static const String login = '/auth/user/login';
  static const String customer = '/store/customers';
}
```

### 2. Vendor Service

See `API_DOCUMENTATION.md` for complete Dart service implementation.

### 3. CORS Configuration

Add Flutter app URLs to backend `.env.production`:
```bash
AUTH_CORS=https://your-storefront-domain.com,https://admin.your-domain.com,https://vendor.your-domain.com
```

For development:
```bash
AUTH_CORS=http://localhost:*,https://*
```

---

## Next Steps / Future Enhancements

### Recommended Additions

1. **Vendor Dashboard Analytics**
   - Sales metrics
   - Product performance
   - Customer reviews

2. **Advanced Search**
   - Algolia integration for vendor search
   - Full-text search across vendor products

3. **Vendor Verification**
   - KYC document upload
   - Tax verification
   - Badge system

4. **Commission Payouts**
   - Automated payouts via Stripe Connect
   - Monthly invoicing
   - Payout history

5. **Vendor Messaging**
   - Admin-to-vendor notifications
   - Customer-to-vendor chat
   - Order updates

6. **Bulk Product Operations**
   - CSV import/export
   - Bulk price updates
   - Bulk status changes

---

## Troubleshooting Common Issues

### Issue: CORS Errors in Production

**Solution:**
1. Check `.env.production` has correct domains
2. Ensure no trailing slashes in URLs
3. Restart backend after changes
4. Verify Nginx is passing correct headers

### Issue: Vendor Can't Access Their Products

**Solution:**
1. Verify JWT token has correct `actor_type: "vendor"`
2. Check `isVendor` middleware is applied
3. Ensure vendor's `store_status` is "ACTIVE"
4. Check product has correct `seller_id`

### Issue: Database Connection Fails

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U mawgood_user -d mawgood_production

# Check DATABASE_URL format
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Issue: Products Not Showing Vendor Filter

**Solution:**
1. Verify `VendorFilter` component is imported
2. Check backend `/store/vendors` endpoint returns data
3. Verify URL params are correctly set
4. Check Algolia facets include `seller_id`

---

## Support & Resources

### Documentation
- **MedusaJS:** https://docs.medusajs.com
- **MercurJS:** https://docs.mercurjs.com
- **Next.js:** https://nextjs.org/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

### Community
- **GitHub Issues:** https://github.com/OmarRaafatSayed/mawgood-web/issues
- **MedusaJS Discord:** https://discord.gg/medusajs

### Contact
- **Email:** support@your-domain.com
- **Deployment Support:** devops@your-domain.com

---

## License

This project is proprietary and confidential.

---

**Last Updated:** April 14, 2026  
**Version:** 1.0.0  
**MedusaJS Version:** 2.11.3  
**MercurJS Version:** 1.5.3
