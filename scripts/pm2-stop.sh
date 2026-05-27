#!/usr/bin/env bash
# =============================================================================
# pm2-stop.sh — Gracefully stop all Mawgood PM2 processes
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "⏹  Stopping Mawgood Marketplace PM2 processes…"
cd "$ROOT_DIR"

pm2 stop ecosystem.config.js
pm2 list

echo "   Done."
