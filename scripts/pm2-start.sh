#!/usr/bin/env bash
# =============================================================================
# pm2-start.sh — Pre-load all service .env files, then start PM2
#
# Usage:
#   bash scripts/pm2-start.sh production   (default)
#   bash scripts/pm2-start.sh staging
#
# What it does:
#   1. Validates required tools (node, pm2, pnpm/serve)
#   2. Loads each service's .env file into the shell so PM2 inherits the vars
#   3. Ensures the logs/ directory exists
#   4. Starts or zero-downtime-reloads all PM2 processes
#   5. Saves the process list for auto-restart on reboot (pm2 startup)
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
PROFILE="${1:-production}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECOSYSTEM="$ROOT_DIR/ecosystem.config.js"
LOG_DIR="$ROOT_DIR/logs"

# Colour helpers (safe fallback if tput is unavailable)
GREEN=$(tput setaf 2 2>/dev/null || echo '')
YELLOW=$(tput setaf 3 2>/dev/null || echo '')
RED=$(tput setaf 1 2>/dev/null || echo '')
RESET=$(tput sgr0 2>/dev/null || echo '')

info()  { echo "${GREEN}▶  $*${RESET}"; }
warn()  { echo "${YELLOW}⚠  $*${RESET}"; }
error() { echo "${RED}✖  $*${RESET}" >&2; }

# ── Validate profile ──────────────────────────────────────────────────────────
if [[ "$PROFILE" != "production" && "$PROFILE" != "staging" ]]; then
  error "Unknown profile '$PROFILE'. Use: production | staging"
  exit 1
fi

info "Starting Mawgood Marketplace — profile: $PROFILE"
echo "   Root : $ROOT_DIR"
echo "   Logs : $LOG_DIR"
echo ""

# ── 1. Prerequisite checks ────────────────────────────────────────────────────
for cmd in node pm2; do
  if ! command -v "$cmd" &>/dev/null; then
    error "'$cmd' not found in PATH. Please install it before running this script."
    exit 1
  fi
done

# Warn if serve is not installed locally in admin-panel / vendor-panel
for panel in admin-panel vendor-panel; do
  SERVE_BIN="$ROOT_DIR/$panel/node_modules/.bin/serve"
  if [[ ! -x "$SERVE_BIN" ]]; then
    warn "'serve' not found at $SERVE_BIN"
    warn "Run: cd $ROOT_DIR/$panel && pnpm install   (or npm install)"
  fi
done

# ── 2. Load .env files ────────────────────────────────────────────────────────
# Each service's .env is sourced so that PM2 inherits the variables.
# Variables already set in the environment take precedence (set -o allexport
# only exports; it does NOT override existing vars).

load_env() {
  local label="$1"
  local env_file="$2"

  if [[ -f "$env_file" ]]; then
    info "Loading $label env → $env_file"
    set -o allexport
    # shellcheck disable=SC1090
    source "$env_file"
    set +o allexport
  else
    warn "$label env file not found: $env_file"
    warn "PM2 will fall back to the defaults in ecosystem.config.js"
  fi
}

load_env "Backend"    "$ROOT_DIR/backend/.env"
load_env "Storefront" "$ROOT_DIR/storefront/.env.local"
# Admin and Vendor panels use VITE_ vars baked at build time — no runtime .env needed.
# If you have a runtime .env for them, uncomment the lines below:
# load_env "Admin"   "$ROOT_DIR/admin-panel/.env"
# load_env "Vendor"  "$ROOT_DIR/vendor-panel/.env"

echo ""

# ── 3. Run database migrations before starting the backend ───────────────────
info "Running database migrations…"
cd "$ROOT_DIR/backend"

if yarn db:migrate 2>&1; then
  info "Migrations applied successfully"
else
  error "Migration failed — aborting startup. Fix the error above and retry."
  exit 1
fi

cd "$ROOT_DIR"
echo ""

# ── 4. Ensure log directory exists ───────────────────────────────────────────
mkdir -p "$LOG_DIR"
info "Log directory ready: $LOG_DIR"

# ── 5. Start / reload PM2 ────────────────────────────────────────────────────
cd "$ROOT_DIR"

if pm2 list 2>/dev/null | grep -q "mawgood-backend"; then
  info "Existing PM2 processes detected — performing zero-downtime reload…"
  pm2 reload "$ECOSYSTEM" --env "$PROFILE"
else
  info "No existing processes — starting fresh…"
  pm2 start "$ECOSYSTEM" --env "$PROFILE"
fi

# ── 5. Save process list ─────────────────────────────────────────────────────
pm2 save
info "PM2 process list saved (survives reboots via 'pm2 startup')"

# ── 6. Summary ───────────────────────────────────────────────────────────────
echo ""
pm2 list
echo ""
info "Done. Useful commands:"
echo "   pm2 logs              — tail all logs"
echo "   pm2 logs mawgood-backend  — tail backend only"
echo "   pm2 monit             — live resource dashboard"
echo "   pm2 reload ecosystem.config.js --env $PROFILE  — zero-downtime reload"
