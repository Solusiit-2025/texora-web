# Deploy & Update VPS (xoramateria.com)

Runbook singkat untuk update aplikasi di VPS.

- Repo VPS: `~/projects/texora-web`
- Proses PM2: `texora-web`
- Domain: `xoramateria.com`
- Auto-deploy: `.github/workflows/deploy.yml` (push ke `main` → SSH ke VPS)

## 1. Alur normal (dari komputer lokal)

```bash
git add -A
git commit -m "pesan perubahan"
git push origin main
```

Kalau GitHub Actions sehat, VPS ter-update otomatis (±2–5 menit).
Cek: https://github.com/Solusiit-2025/texora-web/actions

## 2. Deploy manual di VPS

```bash
ssh USER@IP_VPS
cd ~/projects/texora-web

git fetch origin main
git reset --hard origin/main     # .env (untracked) aman, tidak terhapus
npm ci
npm run build
pm2 restart texora-web
pm2 save
```

Atau: `bash deploy.sh` (isinya sama).

> Jangan pakai `git pull` di VPS. Kalau muncul "local changes … would be
> overwritten", buang perubahan lokal: `git reset --hard origin/main`.

## 3. `npm ci` gagal: "Missing: @img/sharp-linux-x64 from lock file"

Penyebab: `package-lock.json` dibuat di Windows dan **tidak memuat paket
binary platform lain** (Linux/macOS). Akibatnya `npm ci` gagal di VPS dan
semua job GitHub Actions ikut gagal.

Cara cepat (sementara) di VPS — `npm install` akan melengkapi lock lokal:

```bash
npm install
npm run build
pm2 restart texora-web
```

Cara benar (commit lock yang lengkap, sekali waktu):

```bash
# di lokal (Windows) — hapus lock lama, generate ulang dengan npm 10
# (npm 11 memangkas paket platform lain sehingga lock jadi tidak lengkap)
rm -rf node_modules
rm package-lock.json
npx npm@10 install --package-lock-only --ignore-scripts
npx npm@10 ci --dry-run --ignore-scripts        # harus exit 0
git add package-lock.json && git commit -m "chore: lengkapi package-lock (linux+windows)"
```

Cek cepat isi lock:

```bash
grep -c 'node_modules/@img/sharp-linux-x64' package-lock.json   # harus 1
grep -c 'node_modules/fsevents' package-lock.json              # harus 1
```

## 4. Upload > 1 MB / katalog PDF gagal (413 Nginx)

Sekali saja di VPS:

```bash
sudo grep -rn "server_name" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/
sudo nano /etc/nginx/sites-enabled/<file-yang-muncul>
#   tambahkan di dalam server { ... }:
#   client_max_body_size 25M;
sudo nginx -t && sudo systemctl reload nginx
```

Detail: `docs/DEPLOY-UPLOAD-NGINX.md`.

## 5. Verifikasi setelah deploy

Dari komputer lokal:

```powershell
# katalog: 200 + application/pdf, TIDAK ada location ke r2.dev
curl.exe -s -o NUL -D - https://xoramateria.com/api/catalog/pdf | Select-String "HTTP/|location|content-type"

# upload 2 MB: 401 (belum login), bukan 413
curl.exe -s -o NUL -w "%{http_code}`n" -X POST -H "Origin: https://xoramateria.com" https://xoramateria.com/api/upload
```

Di VPS:

```bash
pm2 status
pm2 logs texora-web --lines 40 --nostream
```

## 6. Rollback

```bash
cd ~/projects/texora-web
git log --oneline -5
git reset --hard <commit-yang-masih-bagus>
npm ci && npm run build && pm2 restart texora-web
```
