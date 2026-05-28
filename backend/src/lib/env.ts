import { z } from 'zod'

const databaseUrl = z
  .string()
  .min(1, 'DATABASE_URL is required')
  .refine(
    (url) => {
      try { new URL(url); return true } catch { return false }
    },
    { message: 'DATABASE_URL is not a valid URL' }
  )
  .refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    { message: 'DATABASE_URL must start with postgresql:// or postgres://' }
  )

const corsOrigins = z.string().refine(
  (val) => {
    if (!val) return true
    return val.split(',').every((origin) => {
      try { new URL(origin.trim()); return true } catch { return false }
    })
  },
  { message: 'Must be a comma-separated list of valid URLs' }
)

const requiredCorsOrigins = z.string().min(1).refine(
  (val) => val.split(',').every((origin) => {
    try { new URL(origin.trim()); return true } catch { return false }
  }),
  { message: 'Must be a comma-separated list of valid URLs' }
)

const isProduction = process.env.NODE_ENV === 'production'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(9000),

  DATABASE_URL: databaseUrl,

  REDIS_URL: isProduction
    ? z.string().url('REDIS_URL must be a valid URL')
    : z.string().url().optional(),

  JWT_SECRET: isProduction
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production')
    : z.string().default('supersecret'),

  COOKIE_SECRET: isProduction
    ? z.string().min(32, 'COOKIE_SECRET must be at least 32 characters in production')
    : z.string().default('supersecret'),

  STORE_CORS: isProduction ? requiredCorsOrigins : corsOrigins.optional(),
  ADMIN_CORS: isProduction ? requiredCorsOrigins : corsOrigins.optional(),
  AUTH_CORS:  isProduction ? requiredCorsOrigins : corsOrigins.optional(),
  VENDOR_CORS: corsOrigins.optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
  SEED_SELLER_EMAIL: z.string().email().optional(),
  SEED_SELLER_PASSWORD: z.string().min(12).optional(),
  SEED_SELLER_STORE_NAME: z.string().optional(),
})

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `  x ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  console.error('ENVIRONMENT VALIDATION FAILED')
  console.error(errors)
  console.error('Fix these in your .env file and restart.')
  process.exit(1)
}

export const env = result.data
export type Env = typeof env
