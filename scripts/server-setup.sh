#!/usr/bin/env bash
# =============================================================================
# server-setup.sh — First-time server setup for Mawgood Marketplace
#
# Run once on a fresh Ubuntu/Debian VPS:
#   bash scripts/server-setup.sh
#
# What it does:
#   1. Installs Node 20, pnpm, PM2, serve
#   2. Creates the logs directory
#   3. Copies .env template files (you fill in the real values)
#   4. Registers PM2 to start on system boot
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "═══════════════════════════════════════════════"
echo "  Mawgood Marketplace — Server Setup"
echo "═══════════════════════════════════════════════"

# ── Node 20 via nvm ──────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "▶  Installing Node.js 20 via nvm…"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
else
  echo "   Node $(node -v) already installed"
fi

# ── pnpm ─────────────────────────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  echo "▶  Installing pnpm@9…"
  npm install -g pnpm@9
else
  echo "   pnpm $(pnpm -v) already installed"
fi

# ── PM2 ──────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  echo "▶  Installing PM2…"
  npm install -g pm2
else
  echo "   PM2 $(pm2 -v) already installed"
fi

# ── serve (for static SPA panels) ────────────────────────────────────────────
if ! command -v serve &>/dev/null; then
  echo "▶  Installing serve…"
  npm install -g serve
else
  echo "   serve already installed"
fi

# ── Logs directory ───────────────────────────────────────────────────────────
echo "▶  Creating logs directory…"
mkdir -p "$ROOT_DIR/logs"

# ── .env files ───────────────────────────────────────────────────────────────
echo "▶  Checking .env files…"

copy_env_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$dst" ]]; then
    cp "$src" "$dst"
    echo "   Created $dst — ⚠  EDIT THIS FILE with real values before starting"
  else
    echo "   $dst already exists — skipping"
  fi
}

copy_env_if_missing "$ROOT_DIR/backend/.env.production"    "$ROOT_DIR/backend/.env"
copy_env_if_missing "$ROOT_DIR/storefront/.env.production" "$ROOT_DIR/storefront/.env.production.local"

# ── PM2 startup ──────────────────────────────────────────────────────────────
echo "▶  Registering PM2 startup hook…"
pm2 startup | tail -1 | bash || true

echo ""
echo "═══════════════════════════════════════════════"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit backend/.env with real DATABASE_URL, JWT_SECRET, etc."
echo "  2. Run: pnpm install"
echo "  3. Run: pnpm build"
echo "  4. Run: bash scripts/pm2-start.sh production"
echo "═══════════════════════════════════════════════"
