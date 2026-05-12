import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isProduction = process.env.NODE_ENV === 'production'

// CORS Configuration
// In production: read from .env only (no localhost fallback)
// In development: allow all common dev ports
const devOrigins = 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://localhost:7001,http://localhost:9000,https://docs.medusajs.com'

const STORE_CORS = process.env.STORE_CORS || (isProduction ? '' : devOrigins)
const ADMIN_CORS = process.env.ADMIN_CORS || (isProduction ? '' : devOrigins)
const VENDOR_CORS = process.env.VENDOR_CORS || (isProduction ? '' : devOrigins)
const AUTH_CORS  = process.env.AUTH_CORS  || (isProduction ? '' : devOrigins)

// Validate production secrets
if (isProduction) {
  const jwtSecret = process.env.JWT_SECRET
  const cookieSecret = process.env.COOKIE_SECRET
  if (!jwtSecret || jwtSecret === 'supersecret' || jwtSecret === 'CHANGE_THIS_TO_RANDOM_64_CHAR_STRING') {
    console.warn('[SECURITY WARNING] JWT_SECRET is not set or using default value in production!')
  }
  if (!cookieSecret || cookieSecret === 'supersecret' || cookieSecret === 'CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING') {
    console.warn('[SECURITY WARNING] COOKIE_SECRET is not set or using default value in production!')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('[FATAL] DATABASE_URL is required in production')
  }
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret'
    },
    defaultCurrencyCode: 'egp',
    // Redis for caching and queues (recommended in production)
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {})
  },
  admin: {
    disable: true,
  },
  plugins: [
    {
      resolve: '@mercurjs/resend',
      options: {}
    }
  ],
  modules: [
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/cash-on-delivery',
            id: 'cash-on-delivery',
            options: {}
          }
        ]
      }
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              channels: ['feed', 'seller_feed']
            }
          }
        ]
      }
    }
  ]
})
