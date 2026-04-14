
import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// CORS Configuration for Production & Development
// Development: Use '*' or localhost URLs
// Production: Replace with actual domains (Flutter app, storefront, admin panel)
const STORE_CORS = process.env.NODE_ENV === 'production'
  ? (process.env.STORE_CORS || 'https://your-storefront-domain.com')
  : (process.env.STORE_CORS || 'http://localhost:8000,https://docs.medusajs.com')

const ADMIN_CORS = process.env.NODE_ENV === 'production'
  ? (process.env.ADMIN_CORS || 'https://admin.your-domain.com')
  : (process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000,https://docs.medusajs.com')

const VENDOR_CORS = process.env.NODE_ENV === 'production'
  ? (process.env.VENDOR_CORS || 'https://vendor.your-domain.com')
  : (process.env.VENDOR_CORS || 'http://localhost:5174,http://localhost:9000')

// Flutter app CORS - for mobile development use '*' or specific URLs
const AUTH_CORS = process.env.NODE_ENV === 'production'
  ? (process.env.AUTH_CORS || 'https://your-storefront-domain.com,https://admin.your-domain.com')
  : (process.env.AUTH_CORS || 'http://localhost:5173,http://localhost:5174,http://localhost:8000,http://localhost:9000,https://docs.medusajs.com')

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      // @ts-expect-error: vendorCors is not a valid config
      vendorCors: VENDOR_CORS,
      authCors: AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret'
    }
  },
  admin: {
    disable: true,
  },
  plugins: [
    {
      resolve: '@mercurjs/b2c-core',
      options: {}
    },
    {
      resolve: '@mercurjs/commission',
      options: {}
    },
    {
      resolve: '@mercurjs/reviews',
      options: {}
    },
    {
      resolve: '@mercurjs/requests',
      options: {}
    },
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
          },
          {
            resolve:
              '@mercurjs/payment-stripe-connect/providers/stripe-connect',
            id: 'stripe-connect',
            options: {
              apiKey: process.env.STRIPE_SECRET_API_KEY
            }
          }
        ]
      }
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@mercurjs/resend/providers/resend',
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL
            }
          },
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
