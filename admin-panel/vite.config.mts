import path from 'path'

import inject from '@medusajs/admin-vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const BASE          = env.VITE_MEDUSA_BASE          || '/'
  const STOREFRONT_URL = env.VITE_MEDUSA_STOREFRONT_URL || 'http://localhost:3000'
  const B2B_PANEL     = env.VITE_MEDUSA_B2B_PANEL     || 'false'
  const TALK_JS_APP_ID = env.VITE_TALK_JS_APP_ID      || undefined

  // ── Reverse-proxy strategy ────────────────────────────────────────────────
  // In PRODUCTION the bundle always uses the relative path "/api".
  // Nginx (or any reverse proxy) routes /api → http://localhost:9000.
  // This means the built JS never contains a hard-coded domain, so the same
  // dist/ folder works on any server without a rebuild.
  //
  // In DEVELOPMENT Vite's built-in proxy forwards /api → localhost:9000,
  // so the dev server behaves identically to production Nginx.
  const BACKEND_ORIGIN = env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  // The value baked into the bundle is always the relative prefix "/api"
  const BACKEND_URL_BAKED = '/api'

  const MEDUSA_PROJECT = env.VITE_MEDUSA_PROJECT || null
  const sources = MEDUSA_PROJECT ? [MEDUSA_PROJECT] : []

  return {
    plugins: [
      inspect(),
      react(),
      inject({ sources }),
    ],

    resolve: {
      alias: {
        '@custom-types': path.resolve(__dirname, './src/types'),
        '@hooks':        path.resolve(__dirname, './src/hooks'),
        '@components':   path.resolve(__dirname, './src/components'),
        '@routes':       path.resolve(__dirname, './src/routes'),
        '@utils':        path.resolve(__dirname, './src/utils'),
        '@assets':       path.resolve(__dirname, './src/assets'),
        '@styles':       path.resolve(__dirname, './src/styles'),
        '@lib':          path.resolve(__dirname, './src/lib'),
        '@providers':    path.resolve(__dirname, './src/providers'),
        '@':             path.resolve(__dirname, './src'),
      },
    },

    define: {
      __BASE__:          JSON.stringify(BASE),
      // Always "/api" — Nginx handles the actual backend host
      __BACKEND_URL__:   JSON.stringify(BACKEND_URL_BAKED),
      __STOREFRONT_URL__: JSON.stringify(STOREFRONT_URL),
      __B2B_PANEL__:     JSON.stringify(B2B_PANEL),
      __TALK_JS_APP_ID__: JSON.stringify(TALK_JS_APP_ID),
    },

    server: {
      open: true,
      // ── Dev proxy: mirrors the Nginx /api block ──────────────────────────
      // All requests to /api/* are forwarded to the Medusa backend.
      // The /api prefix is stripped before forwarding (rewrite).
      proxy: {
        '/api': {
          target:      BACKEND_ORIGIN,
          changeOrigin: true,
          secure:      false,
          rewrite:     (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
