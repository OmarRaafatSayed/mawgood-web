import { defineConfig, loadEnv } from '@medusajs/framework/utils'

// Load .env file BEFORE validation so env vars are available
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// ── Fail-fast env validation ─────────────────────────────────────────────────
// This will call process.exit(1) immediately if any required variable is
// missing, empty, or in the wrong format (e.g. un-encoded chars in DATABASE_URL).
import { env } from './src/lib/env'

// ─── CORS ────────────────────────────────────────────────────────────────────
// Development fallback: allow all common local ports
const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:7001',
  'http://localhost:9000',
  'https://docs.medusajs.com',
].join(',')

const STORE_CORS  = env.STORE_CORS  ?? devOrigins
const ADMIN_CORS  = env.ADMIN_CORS  ?? devOrigins
const VENDOR_CORS = env.VENDOR_CORS ?? devOrigins
const AUTH_CORS   = env.AUTH_CORS   ?? devOrigins

// ─── Config ──────────────────────────────────────────────────────────────────

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.DATABASE_URL,
    http: {
      storeCors:    STORE_CORS,
      adminCors:    ADMIN_CORS,
      authCors:     AUTH_CORS,
      jwtSecret:    env.JWT_SECRET,
      cookieSecret: env.COOKIE_SECRET,
    },
    // Redis: only injected when REDIS_URL is present (optional in dev)
    ...(env.REDIS_URL ? { redisUrl: env.REDIS_URL } : {}),
  },
  admin: {
    disable: true,
  },
  plugins: [
    {
      resolve: '@mercurjs/resend',
      options: {},
    },
  ],
  modules: [
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/cash-on-delivery',
            id: 'cash-on-delivery',
            options: {},
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              channels: ['feed', 'seller_feed'],
            },
          },
        ],
      },
    },
  ],
})
