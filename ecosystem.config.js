/**
 * PM2 Ecosystem Configuration — Mawgood Marketplace
 *
 * Deployment Profiles:
 *   production  → pm2 start ecosystem.config.js --env production
 *   staging     → pm2 start ecosystem.config.js --env staging
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start all apps (production)
 *   pm2 start ecosystem.config.js --only mawgood-backend
 *   pm2 reload ecosystem.config.js         # zero-downtime reload
 *   pm2 logs                               # tail all logs
 *   pm2 monit                              # live dashboard
 *
 * NOTE: Sensitive values (DATABASE_URL, JWT_SECRET, etc.) are intentionally
 * left as placeholders here. Copy the correct values from your .env files
 * on the server — never commit real secrets to this file.
 */

'use strict'

const path = require('path')

// ─── Shared defaults ────────────────────────────────────────────────────────

const SHARED = {
  autorestart:   true,
  restart_delay: 3000,
  max_restarts:  10,
  min_uptime:    '10s',
  watch:         false,
  merge_logs:    true,
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
}

// ─── App definitions ────────────────────────────────────────────────────────

module.exports = {
  apps: [

    // ── 1. Backend (Medusa v2) ───────────────────────────────────────────────
    {
      ...SHARED,
      name:   'mawgood-backend',
      cwd:    path.join(__dirname, 'backend'),
      script: 'node',
      args:   '.medusa/server/main.js',

      // Memory guard — restart if process exceeds 1 GB
      max_memory_restart: '1G',

      // Graceful shutdown: wait up to 30 s for in-flight requests
      kill_timeout:    30000,
      listen_timeout:  15000,

      // Log files (relative to project root)
      error_file: path.join(__dirname, 'logs', 'backend-error.log'),
      out_file:   path.join(__dirname, 'logs', 'backend-out.log'),
      log_type:   'json',

      // ── Production env ────────────────────────────────────────────────────
      // All variables are read from backend/.env on the server.
      // PM2 env_production overrides only what differs from that file.
      env_production: {
        NODE_ENV: 'production',
        PORT:     9000,

        // ⚠️  Set these on the server — do NOT commit real values here
        DATABASE_URL:  process.env.DATABASE_URL  || 'postgresql://USER:PASS@localhost:5432/mawgood_db',
        REDIS_URL:     process.env.REDIS_URL     || 'redis://localhost:6379',
        JWT_SECRET:    process.env.JWT_SECRET    || 'CHANGE_ME',
        COOKIE_SECRET: process.env.COOKIE_SECRET || 'CHANGE_ME',

        STORE_CORS:  process.env.STORE_CORS  || 'https://mawgood.cloud,https://www.mawgood.cloud',
        ADMIN_CORS:  process.env.ADMIN_CORS  || 'https://admin.mawgood.cloud',
        VENDOR_CORS: process.env.VENDOR_CORS || 'https://vendor.mawgood.cloud',
        AUTH_CORS:   process.env.AUTH_CORS   || 'https://mawgood.cloud,https://admin.mawgood.cloud,https://vendor.mawgood.cloud',

        MEDUSA_BACKEND_URL: 'https://api.mawgood.cloud',

        // Upload & rate-limit
        MAX_FILE_SIZE:          10485760,
        UPLOAD_DIR:             './static',
        RATE_LIMIT_ENABLED:     'true',
        RATE_LIMIT_MAX_REQUESTS: 100,
        RATE_LIMIT_WINDOW_MS:   60000,

        LOG_LEVEL: 'info',
      },

      // ── Staging env ───────────────────────────────────────────────────────
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
        AUTH_CORS:   'https://staging.mawgood.cloud,https://staging-admin.mawgood.cloud',
        MEDUSA_BACKEND_URL: 'https://staging-api.mawgood.cloud',
        LOG_LEVEL: 'debug',
      },
    },

    // ── 2. Storefront (Next.js 15 standalone) ───────────────────────────────
    {
      ...SHARED,
      name:   'mawgood-storefront',
      cwd:    path.join(__dirname, 'storefront'),
      script: 'node',
      args:   '.next/standalone/server.js',

      max_memory_restart: '1G',
      kill_timeout:   30000,
      listen_timeout: 15000,

      error_file: path.join(__dirname, 'logs', 'storefront-error.log'),
      out_file:   path.join(__dirname, 'logs', 'storefront-out.log'),
      log_type:   'json',

      env_production: {
        NODE_ENV: 'production',
        PORT:     3000,
        HOSTNAME: '0.0.0.0',

        NEXT_PUBLIC_MEDUSA_BACKEND_URL:      'https://api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:  'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        NEXT_PUBLIC_BASE_URL:                'https://mawgood.cloud',
        NEXT_PUBLIC_DEFAULT_REGION:          'eg',
        NEXT_PUBLIC_SITE_NAME:               'Mawgood - موجود',
        NEXT_PUBLIC_ENABLE_WISHLIST:         'true',
        NEXT_PUBLIC_ENABLE_REVIEWS:          'true',
        NEXT_PUBLIC_ENABLE_CHAT:             'true',
        REVALIDATE_TIME:                     3600,
        // ⚠️  Set on server
        REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || 'CHANGE_ME',
      },

      env_staging: {
        NODE_ENV: 'staging',
        PORT:     3001,
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_MEDUSA_BACKEND_URL:     'https://staging-api.mawgood.cloud',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        NEXT_PUBLIC_BASE_URL:               'https://staging.mawgood.cloud',
        NEXT_PUBLIC_DEFAULT_REGION:         'eg',
        REVALIDATE_TIME:                    60,
      },
    },

    // ── 3. Admin Panel (static SPA via serve) ───────────────────────────────
    {
      ...SHARED,
      name:   'mawgood-admin',
      cwd:    path.join(__dirname, 'admin-panel'),
      script: 'npx',
      args:   'serve -s dist -l 5173 --no-clipboard',

      // Static file server is lightweight
      max_memory_restart: '256M',
      kill_timeout:   10000,
      listen_timeout: 10000,

      error_file: path.join(__dirname, 'logs', 'admin-error.log'),
      out_file:   path.join(__dirname, 'logs', 'admin-out.log'),

      env_production: {
        NODE_ENV: 'production',
        PORT:     5173,
        // VITE_ vars are baked into the bundle at build time — listed here
        // only for documentation; they have no runtime effect on the static files.
        // Run: VITE_MEDUSA_BACKEND_URL=https://api.mawgood.cloud pnpm build:admin
      },

      env_staging: {
        NODE_ENV: 'staging',
        PORT:     5175,
      },
    },

    // ── 4. Vendor Panel (static SPA via serve) ──────────────────────────────
    {
      ...SHARED,
      name:   'mawgood-vendor',
      cwd:    path.join(__dirname, 'vendor-panel'),
      script: 'npx',
      args:   'serve -s dist -l 5174 --no-clipboard',

      max_memory_restart: '256M',
      kill_timeout:   10000,
      listen_timeout: 10000,

      error_file: path.join(__dirname, 'logs', 'vendor-error.log'),
      out_file:   path.join(__dirname, 'logs', 'vendor-out.log'),

      env_production: {
        NODE_ENV: 'production',
        PORT:     5174,
      },

      env_staging: {
        NODE_ENV: 'staging',
        PORT:     5176,
      },
    },

  ],

  // ── Deploy config (optional — for pm2 deploy workflow) ──────────────────
  deploy: {
    production: {
      user:        'ubuntu',
      host:        ['YOUR_SERVER_IP'],
      ref:         'origin/main',
      repo:        'git@github.com:YOUR_ORG/MawgoodWep.git',
      path:        '/var/www/mawgood',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install -y git',
    },
    staging: {
      user:        'ubuntu',
      host:        ['YOUR_STAGING_SERVER_IP'],
      ref:         'origin/develop',
      repo:        'git@github.com:YOUR_ORG/MawgoodWep.git',
      path:        '/var/www/mawgood-staging',
      'post-deploy':
        'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env staging',
    },
  },
}
