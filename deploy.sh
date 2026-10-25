#!/usr/bin/env bash
set -euo pipefail

# Deploy script untuk web-texora di VPS (dipanggil oleh GitHub Actions).
# Bisa juga dijalankan manual di VPS: bash ~/projects/texora-web/deploy.sh

cd ~/projects/texora-web

echo "==> git pull"
git fetch origin main
git reset --hard origin/main

echo "==> install"
npm ci

echo "==> build"
npm run build

echo "==> restart"
pm2 restart texora-web
pm2 save

echo "==> deploy selesai"
