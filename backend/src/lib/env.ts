/**
 * Environment Validation — Backend (Medusa v2)
 *
 * Uses Zod to validate all required env vars at startup.
 * The app will throw immediately (fail-fast) if any variable is
 * missing, empty, or in the wrong format — before any DB connection
 * or HTTP server is started.
 *
 * Import this file at the very top of medusa-config.ts:
 *   import './src/lib/env'
 */

import { z } from 'zod'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Reject placeholder strings that were never replaced */
const notPlaceholder = (placeholders: string[]) =>
  z.string().refine(
    (v) => !placeholders.some((p) => v.includes(p)),
    (v) => ({ message: `Value "${v}" looks like an unreplaced placeholder` })
  )

/**
 * Validate a DATABASE_URL.
 * Rejects URLs where the password contains un-encoded special chars
 * that would break Knex/pg URL parsing: @ # % (outside the scheme).
 *
 * The correct fix is to percent-encode the password:
 *   @ → %40   # → %23   % → %25   ! → %21   $ → %24
 */
const databaseUrl = z
  .string()
  .min(1, 'DATABASE_URL is required')
  .refine(
    (url) => {
      try {
        // node's URL parser will throw if the URL is malformed
        new URL(url)
        return true
      } catch {
        return false
      }
    },
    {
      message:
        'DATABASE_URL is not a valid URL. ' +
        'If your password contains special chars (@ # % ! $), ' +
        'percent-encode them: @ → %40, # → %23, % → %25, ! → %21, $ → %24',
    }
  )
  .refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    { message: 'DATABASE_URL must start with postgresql:// or postgres://' }
  )

/** Comma-separated list of origins — each must be a valid URL */
const corsOrigins = z.string().refine(
  (val) => {
    if (!val) return true // empty is allowed (will be caught by .min if required)
    return val.split(',').every((origin) => {
      try {
        new URL(origin.trim())
        return true
      } catch {
        return false
      }
    })
  },
  { message: 'Must be a comma-separated list of valid URLs (e.g. https://example.com)' }
)

// ─── Schema ─────────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production'

const EnvSchema = z.object({
  // ── Node ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(9000),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: databaseUrl,

  // ── Redis (optional in dev, required in production) ───────────────────────
  REDIS_URL: isProduction
    ? z.string().url('REDIS_URL must be a valid URL').startsWith('redis', 'REDIS_URL must start with redis:// or rediss://')
    : z.string().url().optional(),

  // ── Security secrets ──────────────────────────────────────────────────────
  JWT_SECRET: isProduction
    ? notPlaceholder(['supersecret', 'CHANGE_THIS', 'CHANGE_ME'])
        .min(32, 'JWT_SECRET must be at least 32 characters in production')
    : z.string().default('supersecret'),

  COOKIE_SECRET: isProduction
    ? notPlaceholder(['supersecret', 'CHANGE_THIS', 'CHANGE_ME'])
        .min(32, 'COOKIE_SECRET must be at least 32 characters in production')
    : z.string().default('supersecret'),

  // ── CORS (required in production, optional in dev) ────────────────────────
  STORE_CORS: isProduction
    ? corsOrigins.min(1, 'STORE_CORS is required in production')
    : corsOrigins.optional(),

  ADMIN_CORS: isProduction
    ? corsOrigins.min(1, 'ADMIN_CORS is required in production')
    : corsOrigins.optional(),

  AUTH_CORS: isProduction
    ? corsOrigins.min(1, 'AUTH_CORS is required in production')
    : corsOrigins.optional(),

  VENDOR_CORS: corsOrigins.optional(),

  // ── Email (optional) ──────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
})

// ─── Validate ────────────────────────────────────────────────────────────────

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  console.error('\n╔══════════════════════════════════════════════════════╗')
  console.error('║  ENVIRONMENT VALIDATION FAILED — server will not start ║')
  console.error('╚══════════════════════════════════════════════════════╝\n')
  console.error('The following environment variables are invalid or missing:\n')
  console.error(errors)
  console.error('\nFix these in your .env file and restart.\n')

  process.exit(1)
}

export const env = result.data

export type Env = typeof env
