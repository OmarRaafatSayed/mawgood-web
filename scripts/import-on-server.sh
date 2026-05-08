#!/bin/bash
# ============================================================
# Mawgood - Import Local DB Dump into Hostinger Production DB
# Run this script ON the Hostinger VPS after uploading the SQL
# ============================================================

set -e

# ─── Config (edit these to match your Hostinger setup) ──────────────────────
PROD_DB="mawgood_production"
PROD_USER="mawgood_user"
PROD_HOST="localhost"
DUMP_FILE="/tmp/mawgood_export.sql"
# ─────────────────────────────────────────────────────────────────────────────

echo "============================================"
echo "  Mawgood - Production DB Import"
echo "============================================"
echo ""

# 1. Check dump file exists
if [ ! -f "$DUMP_FILE" ]; then
  echo "[ERROR] Dump file not found: $DUMP_FILE"
  echo "  Upload it first with:"
  echo "  scp mawgood_export_*.sql root@YOUR_VPS_IP:/tmp/mawgood_export.sql"
  exit 1
fi

echo "[1/4] Dump file found: $DUMP_FILE ($(du -sh $DUMP_FILE | cut -f1))"
echo ""

# 2. Backup existing production DB (safety net)
BACKUP_FILE="/tmp/mawgood_backup_before_import_$(date +%Y%m%d_%H%M%S).sql"
echo "[2/4] Creating safety backup of current production DB..."
pg_dump -h "$PROD_HOST" -U "$PROD_USER" -d "$PROD_DB" \
  --no-owner --no-acl \
  -f "$BACKUP_FILE" 2>/dev/null && \
  echo "      Backup saved: $BACKUP_FILE" || \
  echo "      (No existing data to backup - fresh install)"
echo ""

# 3. Run migrations first (ensures schema is up to date)
echo "[3/4] Running Medusa DB migrations..."
cd /var/www/mawgood-web/backend
NODE_ENV=production npx medusa db:migrate
echo "      Migrations done."
echo ""

# 4. Import the dump
echo "[4/4] Importing data from dump..."
psql -h "$PROD_HOST" -U "$PROD_USER" -d "$PROD_DB" \
  -v ON_ERROR_STOP=0 \
  -f "$DUMP_FILE"

echo ""
echo "============================================"
echo "  Import COMPLETE"
echo "============================================"
echo ""
echo "Verify with:"
echo "  psql -h $PROD_HOST -U $PROD_USER -d $PROD_DB -c \"SELECT COUNT(*) FROM product;\""
echo ""
echo "Then restart the backend:"
echo "  pm2 restart mawgood-backend"
echo ""
