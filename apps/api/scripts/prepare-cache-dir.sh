#!/usr/bin/env bash
set -euo pipefail
CACHE_DIR="${TILE_CACHE_DIR:-/var/cache/esri-tiles}"
sudo mkdir -p "$CACHE_DIR"
sudo chown -R "${SUDO_USER:-$USER}:${SUDO_USER:-$USER}" "$CACHE_DIR"
chmod 0750 "$CACHE_DIR"
echo "Prepared $CACHE_DIR"
