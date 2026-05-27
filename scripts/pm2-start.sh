#!/usr/bin/env bash
# =============================================================================
# pm2-start.sh — Load .env files then start PM2 with the correct profile
#
# Usage:
#   bash scripts/pm2-start.sh production   # default
#   bash scripts/pm2-start.sh staging
#
# What it does:
#   1. Loads backend/.env into the current shell (so PM2 inherits the vars)
#   2. Starts / reloads all apps with the chosen env profile
#   3. Saves the PM2 process list for auto-restart on reboot
# =============================================================================

set -euo pipefail

PROFILE="${1:-production}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "▶  Starting Mawgood Marketplace — profile: $PROFILE"
echo "   Root: $ROOT_DIR"

# ── 1. Load backend .env ─────────────────────────────────────────────────────
BACKEND_ENV="$ROOT_DIR/backend/.env"
if [[ -f "$BACKEND_ENV" ]]; then
  echo "   Loading $BACKEND_ENV"
  # Export every non-comment, non-empty line
  set -o allexport
  # shellcheck disable=SC1090
  source "$BACKEND_ENV"
  set +o allexport
else
  echo "   ⚠  $BACKEND_ENV not found — using ecosystem.config.js defaults"
fi

# ── 2. Ensure log directory exists ───────────────────────────────────────────
mkdir -p "$ROOT_DIR/logs"

# ── 3. Start / reload PM2 ────────────────────────────────────────────────────
cd "$ROOT_DIR"

if pm2 list | grep -q "mawgood-backend"; then
  echo "   PM2 processes found — reloading (zero-downtime)…"
  pm2 reload ecosystem.config.js --env "$PROFILE"
else
  echo "   Starting PM2 processes…"
  pm2 start ecosystem.config.js --env "$PROFILE"
fi

# ── 4. Save process list ─────────────────────────────────────────────────────
pm2 save
echo "   ✅  PM2 process list saved"

# ── 5. Print status ──────────────────────────────────────────────────────────
pm2 list
echo ""
echo "   Done. Use 'pm2 logs' to tail all logs."
