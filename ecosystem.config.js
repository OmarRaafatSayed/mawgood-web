'use strict'

/**
 * PM2 Ecosystem Configuration — Mawgood Marketplace
 * ====================================================
 *
 * Deployment Profiles
 * -------------------
 *   production  →  pm2 start ecosystem.config.js --env production
 *   staging     →  pm2 start ecosystem.config.js --env staging
 *
 * Recommended workflow (uses the helper script that pre-loads .env files):
 *   bash scripts/pm2-start.sh production
 *   bash scripts/pm2-start.sh staging
 *
 * Per-process commands:
 *   pm2 start   ecosystem.config.js --only mawgood-backend --env production
 *   pm2 reload  ecosystem.config.js --env production   # zero-downtime
 *   pm2 stop    ecosystem.config.js
 *   pm2 delete  ecosystem.config.js
 *   pm2 logs                                           # tail all logs
 *   pm2 monit                                          # live dashboard
 *
 * Security note
 * -------------
 * Sensitive values (DATABASE_URL, JWT_SECRET, etc.) are read from each
 * service's .env file at startup via pm2-start.sh.  The fallback strings
 * below are intentional placeholders — never commit real secrets here.
 */

const path = require('path')

const ROOT = __dirname
const LOGS = path.join(ROOT, 'logs')

// ─── Shared process defaults ─────────────────────────────────────────────────
const SHARED = {
  // Restart policy
  autorestart:   true,
  restart_delay: 4000,   // ms — wait before restarting after a crash
  max_restarts:  10,     // give up after 10 consecutive crashes
  min_uptime:    '15s',  // must stay up 15 s to count as a successful start

  // Misc
  watch:           false,
  merge_logs:      true,
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

  // Graceful shutdown defaults (overridden per-app where needed)
  kill_timeout:   15000,
  listen_timeout: 10000,
}

// ─── App definitions ─────────────────────────────────────────────────────────

module.exports = {
  apps: [

    // =========================================================================
    // 1. Backend — Medusa v2
    //    Runs via: medusa start (no pre-build required)
    //    Port: 9000 (production) | 9001 (staging)
    // =========================================================================
    {
      ...SHARED,
      name:   'mawgood-backend',
      cwd:    path.join(ROOT, 'backend'),
      script: 'node_modules/.bin/medusa',
      args:   'start',
      interpreter: 'none',

      // Restart if the process exceeds 1.2 GB RSS
      max_memory_restart: '1200M',

      // Allow more time for DB connections + Medusa plugin init
      kill_timeout:   30000,
      listen_timeout: 20000,

      error_file: path.join(LOGS, 'backend-error.log'),
      out_file:   path.join(LOGS, 'backend-out.log'),
      log_type:   'json',

      // ── Production ──────────────────────────────────────────────────────────
      // All secrets are loaded from backend/.env by pm2-start.sh before PM2
      // starts.  The values here act as typed documentation + safe fallbacks.
      env_production: {
        NODE_ENV: 'production',
        PORT:     9000,

        // Database & cache — MUST be set in backend/.env on the server
        DATABASE_URL:  process.env.DATABASE_URL  || 'postgresql://USER:PASS@localhost:5432/mawgood_db',
        REDIS_URL:     process.env.REDIS_URL     || 'redis://localhost:6379',

        // Auth secrets — MUST be set in backend/.env on the server
        JWT_SECRET:      process.env.JWT_SECRET      || 'CHANGE_ME_IN_BACKEND_ENV',
        COOKIE_SECRET:   process.env.COOKIE_SECRET   || 'CHANGE_ME_IN_BACKEND_ENV',
        SESSION_SECRET:  process.env.SESSION_SECRET  || 'CHANGE_ME_IN_BACKEND_ENV',

        // CORS — allow storefront, admin, and vendor origins
        STORE_CORS:  process.env.STORE_CORS  || 'https://mawgood.cloud,https://www.mawgood.cloud',
        ADMIN_CORS:  process.env.ADMIN_CORS  || 'https://admin.mawgood.cloud,https://mawgood.cloud',
        VENDOR_CORS: process.env.VENDOR_CORS || 'https://vendor.mawgood.cloud,https://mawgood.cloud',
        AUTH_CORS:   process.env.AUTH_CORS   || 'https://mawgood.cloud,https://www.mawgood.cloud,https://admin.mawgood.cloud,https://vendor.mawgood.cloud',

        // Public URLs
        MEDUSA_BACKEND_URL:             'https://api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'CHANGE_ME',

        // Upload & rate-limit
        MAX_FILE_SIZE:           10485760,   // 10 MB
        UPLOAD_DIR:              './static',
        RATE_LIMIT_ENABLED:      'true',
        RATE_LIMIT_MAX_REQUESTS: 100,
        RATE_LIMIT_WINDOW_MS:    60000,

        // Locale defaults
        DEFAULT_REGION:   'eg',
        DEFAULT_CURRENCY: 'EGP',

        LOG_LEVEL: 'info',
        LOG_FILE:  './logs/backend.log',
      },

      // ── Staging ─────────────────────────────────────────────────────────────
      env_staging: {
        NODE_ENV: 'staging',
        PORT:     9001,

        DATABASE_URL:  process.env.DATABASE_URL  || 'postgresql://USER:PASS@localhost:5432/mawgood_staging',
        REDIS_URL:     process.env.REDIS_URL     || 'redis://localhost:6379',
        JWT_SECRET:    process.env.JWT_SECRET    || 'CHANGE_ME_STAGING',
        COOKIE_SECRET: process.env.COOKIE_SECRET || 'CHANGE_ME_STAGING',

        STORE_CORS:  'https://staging.mawgood.cloud',
        ADMIN_CORS:  'https://staging-admin.mawgood.cloud',
        VENDOR_CORS: 'https://staging-vendor.mawgood.cloud',
        AUTH_CORS:   'https://staging.mawgood.cloud,https://staging-admin.mawgood.cloud,https://staging-vendor.mawgood.cloud',

        MEDUSA_BACKEND_URL:             'https://staging-api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://staging-api.mawgood.cloud',

        DEFAULT_REGION:   'eg',
        DEFAULT_CURRENCY: 'EGP',

        LOG_LEVEL: 'debug',
      },
    },

    // =========================================================================
    // 2. Storefront — Next.js 15 (standalone output)
    //    Build output: storefront/.next/standalone/server.js
    //    Port: 3000 (production) | 3001 (staging)
    //
    //    Requires next.config.ts → output: 'standalone'
    //    After build, copy static assets:
    //      cp -r storefront/.next/static storefront/.next/standalone/.next/static
    //      cp -r storefront/public       storefront/.next/standalone/public
    // =========================================================================
    {
      ...SHARED,
      name:   'mawgood-storefront',
      cwd:    path.join(ROOT, 'storefront'),
      script: 'node',
      args:   '.next/standalone/server.js',

      // Next.js can be memory-hungry under load
      max_memory_restart: '1G',

      kill_timeout:   30000,
      listen_timeout: 20000,

      error_file: path.join(LOGS, 'storefront-error.log'),
      out_file:   path.join(LOGS, 'storefront-out.log'),
      log_type:   'json',

      // ── Production ──────────────────────────────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT:     3000,
        HOSTNAME: '0.0.0.0',

        // Backend connection
        NEXT_PUBLIC_MEDUSA_BACKEND_URL:     'https://api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
          || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',

        // Site identity
        NEXT_PUBLIC_BASE_URL:          'https://mawgood.cloud',
        NEXT_PUBLIC_SITE_NAME:         'Mawgood - موجود',
        NEXT_PUBLIC_SITE_DESCRIPTION:  'موقع إلكتروني يضم كل المنتجات المحلية المصرية والعربية',
        NEXT_PUBLIC_IMAGE_DOMAINS:     'api.mawgood.cloud,mawgood.cloud',

        // Locale
        NEXT_PUBLIC_DEFAULT_REGION:   'eg',
        NEXT_PUBLIC_DEFAULT_CURRENCY: 'EGP',

        // Feature flags
        NEXT_PUBLIC_ENABLE_WISHLIST: 'true',
        NEXT_PUBLIC_ENABLE_REVIEWS:  'true',
        NEXT_PUBLIC_ENABLE_CHAT:     'true',

        // ISR revalidation — secret MUST be set in storefront/.env on the server
        REVALIDATE_TIME:   3600,
        REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || 'CHANGE_ME_IN_STOREFRONT_ENV',
      },

      // ── Staging ─────────────────────────────────────────────────────────────
      env_staging: {
        NODE_ENV: 'staging',
        PORT:     3001,
        HOSTNAME: '0.0.0.0',

        NEXT_PUBLIC_MEDUSA_BACKEND_URL:     'https://staging-api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
          || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',

        NEXT_PUBLIC_BASE_URL:         'https://staging.mawgood.cloud',
        NEXT_PUBLIC_DEFAULT_REGION:   'eg',
        NEXT_PUBLIC_DEFAULT_CURRENCY: 'EGP',

        REVALIDATE_TIME:   60,
        REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || 'CHANGE_ME_STAGING',
      },
    },

    // =========================================================================
    // 3. Admin Panel — Vite SPA (static files served via `serve`)
    //    Build output: admin-panel/dist/
    //    Port: 5173 (production) | 5175 (staging)
    //
    //    Note: VITE_* variables are baked into the bundle at build time.
    //    They have NO runtime effect here.  Always rebuild after changing them:
    //      VITE_MEDUSA_BACKEND_URL=https://api.mawgood.cloud pnpm build:admin
    // =========================================================================
    {
      ...SHARED,
      name:   'mawgood-admin',
      cwd:    path.join(ROOT, 'admin-panel'),

      script: 'bash',
      args:   '-c "serve dist --listen tcp://0.0.0.0:5173"',

      // Static file server is lightweight — keep memory limit low
      max_memory_restart: '256M',

      kill_timeout:   10000,
      listen_timeout: 10000,

      error_file: path.join(LOGS, 'admin-error.log'),
      out_file:   path.join(LOGS, 'admin-out.log'),

      // ── Production ──────────────────────────────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT:     5173,
        // VITE_ vars below are documentation only — they must be set at build time
        // VITE_MEDUSA_BACKEND_URL=https://api.mawgood.cloud
        // VITE_MEDUSA_PUBLISHABLE_KEY=pk_...
        // VITE_APP_NAME=Mawgood Admin
      },

      // ── Staging ─────────────────────────────────────────────────────────────
      env_staging: {
        NODE_ENV: 'staging',
        PORT:     5175,
      },
    },

    // =========================================================================
    // 4. Vendor Panel — Vite SPA (static files served via `serve`)
    //    Build output: vendor-panel/dist/
    //    Port: 5174 (production) | 5176 (staging)
    //
    //    Same build-time note as Admin Panel above.
    // =========================================================================
    {
      ...SHARED,
      name:   'mawgood-vendor',
      cwd:    path.join(ROOT, 'vendor-panel'),

      script: 'bash',
      args:   '-c "serve dist --listen tcp://0.0.0.0:5174"',

      max_memory_restart: '256M',

      kill_timeout:   10000,
      listen_timeout: 10000,

      error_file: path.join(LOGS, 'vendor-error.log'),
      out_file:   path.join(LOGS, 'vendor-out.log'),

      // ── Production ──────────────────────────────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT:     5174,
        // VITE_MEDUSA_BACKEND_URL=https://api.mawgood.cloud
        // VITE_MEDUSA_PUBLISHABLE_KEY=pk_...
        // VITE_APP_NAME=Mawgood Vendor
      },

      // ── Staging ─────────────────────────────────────────────────────────────
      env_staging: {
        NODE_ENV: 'staging',
        PORT:     5176,
      },
    },

  ],

  // ─── PM2 Deploy config ─────────────────────────────────────────────────────
  // Optional — enables `pm2 deploy production` workflow.
  // Replace YOUR_SERVER_IP and YOUR_ORG with real values on the server.
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['YOUR_SERVER_IP'],
      ref:  'origin/main',
      repo: 'git@github.com:YOUR_ORG/MawgoodWep.git',
      path: '/var/www/mawgood',

      // Run locally before pushing (leave empty if not needed)
      'pre-deploy-local': '',

      // Run on the server after git pull
      'post-deploy': [
        'pnpm install --frozen-lockfile',
        'pnpm build:backend',
        'pnpm build:storefront',
        'pnpm build:admin',
        'pnpm build:vendor',
        // Copy Next.js standalone static assets
        'cp -r storefront/.next/static storefront/.next/standalone/.next/static',
        'cp -r storefront/public       storefront/.next/standalone/public',
        'mkdir -p logs',
        'bash scripts/pm2-start.sh production',
      ].join(' && '),

      'pre-setup': 'apt-get install -y git curl && curl -fsSL https://get.pnpm.io/install.sh | sh',
    },

    staging: {
      user: 'ubuntu',
      host: ['YOUR_STAGING_SERVER_IP'],
      ref:  'origin/develop',
      repo: 'git@github.com:YOUR_ORG/MawgoodWep.git',
      path: '/var/www/mawgood-staging',

      'post-deploy': [
        'pnpm install --frozen-lockfile',
        'pnpm build:backend',
        'pnpm build:storefront',
        'pnpm build:admin',
        'pnpm build:vendor',
        'cp -r storefront/.next/static storefront/.next/standalone/.next/static',
        'cp -r storefront/public       storefront/.next/standalone/public',
        'mkdir -p logs',
        'bash scripts/pm2-start.sh staging',
      ].join(' && '),
    },
  },
}
