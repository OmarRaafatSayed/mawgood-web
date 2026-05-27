import path from 'path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

// Extract hostname from backend URL for image domains
let backendHostname = 'localhost'
let backendPort: string | undefined = '9000'
let backendProtocol: 'http' | 'https' = 'http'
try {
  const url = new URL(BACKEND_URL)
  backendHostname = url.hostname
  backendPort = url.port || undefined
  backendProtocol = url.protocol.replace(':', '') as 'http' | 'https'
} catch {}

const nextConfig: NextConfig = {
  output: "standalone",
  // Fix: tell Next.js the monorepo root so it doesn't warn about multiple lockfiles
  outputFileTracingRoot: path.join(__dirname, '..'),
  trailingSlash: false,
  reactStrictMode: true,
  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== 'production',
    }
  },
  images: {
    // Always optimize images in production
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85, 90, 95, 100],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      // Dynamic backend URL
      {
        protocol: backendProtocol,
        hostname: backendHostname,
        port: backendPort,
      },
      // Common dev ports
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      // Production CDN / S3
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'mercur-connect.s3.eu-central-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'api.mercurjs.com'
      },
      {
        protocol: 'https',
        hostname: 'api-sandbox.mercurjs.com',
        pathname: '/static/**'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 's3.eu-central-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'mercur-testing.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.hf.space'
      },
      {
        protocol: 'https',
        hostname: 'huggingface.co'
      },
      // Allow any HTTPS hostname (for flexibility with Hostinger)
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // ── Reverse-proxy: /api → Medusa backend ─────────────────────────────────
  // All server-side and client-side fetch calls to /api/* are rewritten to
  // the actual backend URL. This means the storefront code never contains a
  // hard-coded domain — only the env var needs to change per environment.
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ]
  },
  // Production headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  }
};

export default withNextIntl(nextConfig);
