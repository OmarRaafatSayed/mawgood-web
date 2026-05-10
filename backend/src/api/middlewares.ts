import { defineMiddlewares } from '@medusajs/framework/http'
import type { MiddlewaresConfig } from '@medusajs/framework/http'
import express from 'express'
import path from 'path'
import fs from 'fs'

// Production middleware imports
let compression: any = null
let helmet: any = null
let rateLimit: any = null

try { compression = require('compression') } catch {}
try { helmet = require('helmet') } catch {}
try { rateLimit = require('express-rate-limit') } catch {}

// Fallback placeholder SVG (inline, no file dependency)
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f3f4f6"/>
  <rect x="60" y="55" width="80" height="65" rx="4" fill="#d1d5db"/>
  <circle cx="100" cy="75" r="12" fill="#9ca3af"/>
  <path d="M65 120 L85 95 L105 110 L125 85 L140 120 Z" fill="#9ca3af"/>
</svg>`

export default defineMiddlewares({
  routes: [
    // ─── Health Check ────────────────────────────────────────────────────────
    {
      matcher: '/health',
      middlewares: [
        (req: any, res: any) => {
          res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
          })
        }
      ]
    },

    // ─── Security Headers (Helmet) ────────────────────────────────────────────
    {
      matcher: '*',
      middlewares: [
        (req: any, res: any, next: any) => {
          if (helmet) {
            helmet({
              crossOriginResourcePolicy: { policy: 'cross-origin' },
              contentSecurityPolicy: false, // Medusa handles its own CSP
            })(req, res, next)
          } else {
            // Manual security headers fallback
            res.setHeader('X-Content-Type-Options', 'nosniff')
            res.setHeader('X-Frame-Options', 'SAMEORIGIN')
            res.setHeader('X-XSS-Protection', '1; mode=block')
            if (process.env.NODE_ENV === 'production') {
              res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            }
            next()
          }
        }
      ]
    },

    // ─── Compression ─────────────────────────────────────────────────────────
    {
      matcher: '*',
      middlewares: [
        (req: any, res: any, next: any) => {
          if (compression) {
            compression({ level: 6 })(req, res, next)
          } else {
            next()
          }
        }
      ]
    },

    // ─── Rate Limiting (API only) ─────────────────────────────────────────────
    {
      matcher: '/store*',
      middlewares: [
        (req: any, res: any, next: any) => {
          if (rateLimit) {
            rateLimit({
              windowMs: 15 * 60 * 1000, // 15 minutes
              max: 200,
              standardHeaders: true,
              legacyHeaders: false,
              message: { error: 'Too many requests, please try again later.' }
            })(req, res, next)
          } else {
            next()
          }
        }
      ]
    },

    // ─── Static Files with Fallback + Cache Headers ───────────────────────────
    {
      matcher: '/static*',
      middlewares: [
        (req: any, res: any, next: any) => {
          const staticPath = path.join(__dirname, '..', '..', 'static')

          // Set cache headers for images
          const ext = path.extname(req.path).toLowerCase()
          const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']
          if (imageExts.includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
          }

          // Serve static file
          express.static(staticPath, {
            maxAge: '1y',
            etag: true,
            lastModified: true,
            fallthrough: true
          })(req, res, (err: any) => {
            // File not found → return fallback SVG image
            if (err || !res.headersSent) {
              res.setHeader('Content-Type', 'image/svg+xml')
              res.setHeader('Cache-Control', 'public, max-age=3600')
              res.status(200).send(FALLBACK_SVG)
            }
          })
        }
      ]
    }
  ]
} as MiddlewaresConfig)
