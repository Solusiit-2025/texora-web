# Deploy & Update VPS (xoramateria.com)

Runbook update aplikasi di VPS. **Deploy bersifat manual** (tanpa GitHub Actions).

- Repo di VPS: `~/projects/texora-web`
- Proses PM2: `texora-web`
- Domain: `xoramateria.com`
- Skrip deploy: `deploy.sh` (satu perintah untuk semua langkah)

## 1. Alur kerja

**Di komputer lokal** — simpan perubahan ke GitHub:

```bash
git add -A
git commit -m "pesan perubahan"
git push origin main
```

**Di VPS** — deploy satu perintah:

```bash
cd ~/projects/texora-web
bash deploy.sh
```

`deploy.sh` melakukan semuanya secara berurutan (berhenti otomatis kalau ada yang gagal):

1. `git fetch` + `git reset --hard origin/main` (`.env` aman — untracked)
2. muat `nvm` → `npm` & `pm2` selalu tersedia, termasuk di shell non-interactive
3. `unset NODE_ENV` + `npm ci --include=dev` → tailwindcss/typescript tidak terlewat
4. `npx prisma migrate deploy` → skema DB selalu sinkron
5. `rm -rf .next` + `npm run build` → tidak memakai cache Turbopack basi
6. `pm2 restart texora-web` + `pm2 save`

## 2. Verifikasi setelah deploy

Di VPS:

```bash
pm2 status
pm2 logs texora-web --lines 40 --nostream
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000
```

Dari komputer lokal:

```powershell
curl.exe -s -o NUL -w "home -> %{http_code}`n" https://xoramateria.com
```

## 3. Jangan lakukan ini

- **Jangan** pakai `git pull` di VPS. Kalau muncul `local changes … would be
  overwritten`, buang perubahan lokal: `git reset --hard origin/main`.
- **Jangan** `pm2 restart` kalau `npm run build` gagal — `.next` bisa tidak
  lengkap dan situs jadi 502. `deploy.sh` sudah menghentikan proses sebelum
  restart, jadi cukup pakai skrip itu.
- **Jangan** `set -a; . ./.env; set +a` di shell yang sama lalu `npm ci`:
  `NODE_ENV=production` akan membuat npm melewati devDependencies (gejalanya
  `Cannot find module 'tailwindcss'`). Kalau butuh `.env` untuk `psql`, pakai
  subshell: `( set -a; . ./.env; set +a; psql ... )`.

## 4. `npm ci` gagal: "Missing: @img/sharp-linux-x64 from lock file"

Penyebab: `package-lock.json` dibuat di Windows dan tidak memuat paket binary
platform lain. `package-lock.json` di repo sudah diperbaiki; kalau muncul lagi
setelah menambah dependency, regenerate dengan npm 10:

```bash
# di lokal (Windows)
rm -rf node_modules
rm package-lock.json
npx npm@10 install --package-lock-only --ignore-scripts
npx npm@10 ci --dry-run --ignore-scripts        # harus exit 0
git add package-lock.json && git commit -m "chore: lengkapi package-lock"
```

Cek cepat:

```bash
grep -c 'node_modules/@img/sharp-linux-x64' package-lock.json   # harus 1
grep -c 'node_modules/fsevents' package-lock.json              # harus 1
```

## 5. Upload > 1 MB / katalog PDF gagal (413 Nginx)

Sekali saja di VPS:

```bash
sudo grep -rn "server_name" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/
sudo nano /etc/nginx/sites-enabled/<file-yang-muncul>
#   tambahkan di dalam server { ... }:
#   client_max_body_size 25M;
sudo nginx -t && sudo systemctl reload nginx
```

Detail: `docs/DEPLOY-UPLOAD-NGINX.md`.

## 6. Rollback

```bash
cd ~/projects/texora-web
git log --oneline -5
git reset --hard <commit-yang-masih-bagus>
npm ci --include=dev
rm -rf .next
npm run build
pm2 restart texora-web && pm2 save
```
