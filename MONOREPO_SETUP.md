# Monorepo Setup — Turborepo + pnpm

## Prerequisites

Install pnpm globally:
```bash
npm install -g pnpm@9
```

Install Turborepo globally (optional, already in devDependencies):
```bash
npm install -g turbo
```

## Installation

```bash
# Install all dependencies across all packages
pnpm install

# Or with legacy peer deps if needed
pnpm install --config.strict-peer-dependencies=false
```

## Build Commands

```bash
# Build everything (respects dependency order)
pnpm build

# Build specific package
pnpm build:backend
pnpm build:admin
pnpm build:vendor
pnpm build:storefront

# Build with cache bypass
pnpm turbo run build --force
```

## Development

```bash
# Run all dev servers
pnpm dev

# Run specific package
pnpm dev:backend
pnpm dev:admin
```

## Version Alignment

| Package | React | TypeScript | Vite |
|---------|-------|------------|------|
| backend | 18 | 5.6 | 5 |
| admin-panel | 19 | 5.9 | 7 |
| vendor-panel | 18 | 5.2 | 5 |
| storefront | 19 | 5 | N/A (Next.js) |

> Note: React versions differ intentionally — backend uses React 18 (Medusa requirement),
> admin-panel and storefront use React 19. Do NOT hoist React to root to avoid conflicts.

## Turborepo Cache

Turborepo caches build outputs in `.turbo/`. To clear cache:
```bash
pnpm turbo run build --force
```

Remote caching can be enabled via Vercel:
```bash
pnpm turbo login
pnpm turbo link
```

## Adding a New Package

1. Create directory under `packages/your-package/`
2. Add `package.json` with `"name": "@mawgood/your-package"`
3. Run `pnpm install` from root
4. Add to `turbo.json` tasks if needed

## PM2 Deployment

The `ecosystem.config.js` remains unchanged for production deployment.
After building with `pnpm build`, start with:
```bash
pm2 start ecosystem.config.js
```
