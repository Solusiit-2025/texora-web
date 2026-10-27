#!/usr/bin/env bash
set -euo pipefail

# Deploy script untuk web-texora di VPS (dipanggil oleh GitHub Actions).
# Bisa juga dijalankan manual di VPS: bash ~/projects/texora-web/deploy.sh

cd ~/projects/texora-web

# Muat nvm bila ada, supaya `npm`/`pm2` tersedia juga di shell non-interactive.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi

echo "==> git pull"
git fetch origin main
git reset --hard origin/main

# Jangan biarkan NODE_ENV=production (mis. dari sourcing .env) membuat npm
# melewati devDependencies — tailwindcss & typescript dibutuhkan saat build.
unset NODE_ENV

echo "==> install"
npm ci --include=dev

# Terapkan migrasi database SEBELUM build. Tanpa ini, kolom/tabel baru di
# prisma/schema.prisma hanya ada di Prisma Client (hasil `prisma generate`)
# tetapi belum ada di database produksi.
echo "==> prisma migrate deploy"
npx prisma migrate deploy

echo "==> build"
# Buang cache Turbopack lama supaya tidak memakai resolusi modul dari
# node_modules versi sebelumnya (pernah bikin "Cannot find module tailwindcss").
rm -rf .next
npm run build

echo "==> restart"
pm2 restart texora-web
pm2 save

echo "==> deploy selesai"
