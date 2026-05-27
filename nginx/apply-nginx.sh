#!/usr/bin/env bash
# =============================================================================
# apply-nginx.sh — Apply the unified Nginx config on the server
#
# Run from the project root:
#   bash nginx/apply-nginx.sh
# =============================================================================

set -euo pipefail

CONF_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mawgood.cloud.conf"
CONF_DST="/etc/nginx/sites-available/mawgood.cloud.conf"
CONF_LINK="/etc/nginx/sites-enabled/mawgood.cloud.conf"

echo "▶  Copying config to $CONF_DST"
sudo cp "$CONF_SRC" "$CONF_DST"

echo "▶  Enabling site"
sudo ln -sf "$CONF_DST" "$CONF_LINK"

echo "▶  Testing Nginx config"
sudo nginx -t

echo "▶  Reloading Nginx"
sudo systemctl reload nginx

echo ""
echo "✅  Done. Check your sites:"
echo "   https://mawgood.cloud"
echo "   https://admin.mawgood.cloud"
echo "   https://vendor.mawgood.cloud"
echo "   https://api.mawgood.cloud"
