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

# Terapkan migrasi database SEBELUM build. Tanpa ini, kolom/tabel baru di
# prisma/schema.prisma hanya ada di Prisma Client (hasil `prisma generate`)
# tetapi belum ada di database produksi — gejalanya query 500 saat login.
echo "==> prisma migrate deploy"
npx prisma migrate deploy

echo "==> build"
npm run build

echo "==> restart"
pm2 restart texora-web
pm2 save

echo "==> deploy selesai"
