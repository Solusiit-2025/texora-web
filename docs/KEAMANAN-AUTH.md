# Keamanan Autentikasi (Login Portal)

Ringkasan hasil audit + prosedur operasional. Terakhir diperbarui: 27 Okt 2026.

## 1. Hasil audit

### Sudah baik
- Password di-hash **bcrypt 12 rounds** (`src/lib/auth/password.ts`).
- Cookie sesi **HttpOnly + Secure + SameSite=Lax**: access 15 menit, refresh 7 hari.
- Refresh token **dirotasi** tiap refresh, disimpan sebagai hash di DB, dan ada
  **deteksi token reuse** (sesi dicabut).
- **CSRF**: semua `POST/PUT/PATCH/DELETE` di `/api` wajib `Origin` = `Host`.
- **Security headers**: HSTS preload, CSP, X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy.
- Portal diproteksi proxy (JWT diverifikasi) → redirect ke `/login`.
- `/api/backup`, `/api/seo/audit` menolak tanpa sesi (401).
- `.env`, `.git/config`, source map tidak dapat diakses (404).
- Registrasi memaksa role `CUSTOMER` (tidak bisa eskalasi).
- 2FA TOTP + kode cadangan tersedia.

### Yang diperbaiki (kode)
| Masalah | Perbaikan |
|---|---|
| Rate limit login bisa di-bypass dengan memalsukan `X-Forwarded-For` | `src/lib/client-ip.ts`: prioritas `cf-connecting-ip` → `x-real-ip` → entri **terakhir** XFF |
| Pesan login membocorkan email terdaftar | Pesan seragam: **"Email atau password salah."** |
| Password default tertanam di kode | Hanya aktif bila `ALLOW_DEFAULT_DEMO_PASSWORDS=true` (default **mati** di produksi) |
| Secret JWT punya fallback hardcoded di repo | `src/lib/auth/secrets.ts`: produksi **wajib** env, kalau kosong → error jelas |
| Registrasi tanpa batas | Rate limit 5 pendaftaran/jam per IP (`REGISTER_RATE_LIMIT_*`) |
| Migrasi DB tidak pernah dijalankan saat deploy | `deploy.sh` + workflow menjalankan `prisma migrate deploy` |

## 2. Prosedur: cek akun tanpa password

```sql
SELECT id, email, role FROM users WHERE "passwordHash" IS NULL;
```

Kalau ada hasil, set password baru (semua sesi lama dicabut):

```bash
node scripts/reset-password.mjs <email> "<password-baru-minimal-16-karakter>"
```

## 3. Prosedur: rotasi secret JWT

```bash
# di VPS
cd ~/projects/texora-web
openssl rand -base64 48   # jalankan 3x
nano .env
# JWT_SECRET="..."
# JWT_REFRESH_SECRET="..."
# JWT_2FA_SECRET="..."
pm2 restart texora-web && pm2 save
```

Efek: **semua sesi lama logout** (memang diharapkan bila secret pernah bocor).

## 4. Prosedur: perbaiki login 500 (schema drift)

```bash
cd ~/projects/texora-web
pm2 logs texora-web --lines 200 --nostream | grep -i -A15 "Login error"
npx prisma migrate status

# WAJIB backup sebelum migrate
npm run backup:manual
npx prisma migrate deploy
pm2 restart texora-web
```

## 5. Checklist lanjutan (belum otomatis)

- [ ] Cloudflare → **Turnstile** di `/login` dan `/register`.
- [ ] Cloudflare → **WAF rate limiting** untuk `/api/auth/*`.
- [ ] Aktifkan 2FA untuk semua akun `ADMINISTRATOR` di portal
      (Portal → Pengaturan → Keamanan).
- [ ] Rotasi password akun seed (`admin@…`, `sales@…`, `gudang@…`).
- [ ] Review berkala `audit_logs` untuk `LOGIN_FAILED` beruntun.

## 6. Audit trail (`/portal/audit-logs`)

- **Halaman:** `src/app/portal/audit-logs/page.tsx` — data nyata dari
  `GET /api/audit-logs` (sebelumnya masih data mock).
- **Akses:** hanya role `ADMINISTRATOR`. Dijaga dua lapis:
  - halaman → `ROUTE_PERMISSIONS` di `src/proxy.ts`;
  - API → cek `SYSTEM_ADMIN_ROLE` (403 untuk role lain).
- **Yang dicatat:**
  - `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `LOGIN_2FA_CHALLENGE`,
    `2FA_*` (aktivasi/nonaktif/kode cadangan);
  - `CMS_CREATE` / `CMS_UPDATE` / `CMS_DELETE` + label item (judul artikel,
    pertanyaan FAQ, key konten situs, dsb.);
  - `PRODUCT_CREATE` / `PRODUCT_UPDATE` / `PRODUCT_DELETE` + daftar field yang
    berubah (nama, harga/meter, kategori, galeri, varian/stok, tier harga);
  - RBAC (`USER_*`, `ROLE_*`, `MENU_*`), SEO redirect, i18n, RFQ, backup.
- **Metadata:** IP (`cf-connecting-ip` → `x-real-ip` → XFF terakhir) dan
  user agent, lewat helper `src/lib/audit.ts`.
- **Catatan:** log lama (sebelum patch ini) tidak punya IP/user agent dan belum
  memiliki `LOGIN_SUCCESS`; data baru tercatat mulai deploy berikutnya.

## 7. Endpoint yang diamankan

`POST /api/products` dan `PUT/DELETE /api/products/[id]` sebelumnya **tanpa
autentikasi**. Sekarang wajib login + akses menu katalog
(`canManageCatalog`) dan setiap perubahan ditulis ke audit log.

