# Optimasi Performa — PT. Texora Visi Prima

Dokumentasi audit & optimasi kecepatan website. Semua angka diukur dengan
`npm run test:perf` (mode produksi, `next build` + `next start`).

---

## 1. Diagnosis: kenapa website terasa lambat

| Temuan | Bukti |
|---|---|
| **Database Postgres berada di server REMOTE** (`77.37.44.232`) | `inet_server_addr()` → 77.37.44.232/32, PostgreSQL 16.15 |
| **Latensi 1 query = ~180 ms** | `SELECT 1` 10x: rata-rata 182 ms (network round-trip) |
| **Query berat = 0,4–1,1 detik** | products+variants+tiers 1105 ms · article 558 ms · siteContent 368 ms |
| **Firewall remote memutus koneksi idle** | `ConnectionReset: An existing connection was forcibly closed by the remote host` |
| **Efeknya:** koneksi pool mati → query berikutnya harus reconnect | **Homepage: 20.039 ms** (20 detik!) |
| **1 halaman memicu 8–10 query + 8–10 request API dari client** | Navbar, SeoHead, PageGate, SocialLinks, FloatingSocial, HomeClient → `/api/seo` (3x), `/api/social-links` (2x), `/api/products`, `/api/cms`, `/api/auth/me` |
| **Halaman bahasa asing lebih lambat** | `localizeRows()` query `content_translations` tiap kali (tidak di-cache) → 500 ms |

Kesimpulan: **bukan kode-nya yang berat, tapi tiap round-trip ke DB remote + koneksi
yang diputus firewall**. Solusinya: drastically mengurangi jumlah query per
request, dan memastikan request tetap cepat walau DB sedang lambat.

---

## 2. Hasil A/B (produksi, environment sama)

### Halaman (TTFB)

| Halaman | Sebelum | Sesudah | Speedup |
|---|---|---|---|
| Homepage | 1.371 ms → **20.039 ms** | **48–57 ms** | **~30–400x** |
| Katalog | 1.015 ms | 48–82 ms | ~15x |
| Daftar Artikel | 825 ms | 31–63 ms | ~15x |
| Detail Artikel | 976 ms | 36–60 ms | ~18x |
| Landing Kategori | 791 ms | 35–56 ms | ~15x |
| About | 824 ms | 32–46 ms | ~19x |
| Minta Penawaran | 809 ms | 30–50 ms | ~17x |
| Homepage EN | 1.192 ms | 39–52 ms | ~24x |
| Artikel EN | 1.532 ms | 35–52 ms | ~31x |

### API

| Endpoint | Sebelum | Sesudah | Speedup |
|---|---|---|---|
| `/api/seo` | 419 ms | **4 ms** | **105x** |
| `/api/social-links` | 427 ms | **4 ms** | **107x** |
| `/api/products` | 637 ms | **3 ms** | **212x** |
| `/api/cms` | 420 ms | **4 ms** | **105x** |
| `/api/catalog/pdf` | 909 ms | 599 ms | 1,5x |

> Cara mereproduksi bagian "Sebelum": jalankan server dengan
> `DISABLE_APP_CACHE=1` (kill-switch cache) lalu `npm run test:perf`.

---

## 3. Apa yang diubah

### 3.1 Cache aplikasi (server-side) — `src/lib/cache.ts` (BARU)
Cache in-memory dengan 3 kondisi:
- **fresh** (TTL 60 dtk) → pakai nilai memory, **tanpa query DB**
- **stale** (sampai 10 mnt) → pakai nilai lama (tetep cepat), refresh di background
- **expired** → query DB, sekaligus **dedupe request paralel** (hanya 1 query)

Efek samping bagus: **kalau DB sedang mati/lambat, halaman tetap Balk fast**
diambil dari cache stale.

Diterapkan di:
| Data | Fungsi |
|---|---|
| Pengaturan SEO | `getSeoSettings()` |
| Katalog produk | `getStorefrontProducts()` |
| FAQ / Hero / Testimoni | `getStorefrontFaqs()` / `HeroSlides()` / `Testimonials()` |
| Site content (statistik, CTA) | `getSiteContentValue()` |
| Artikel (list, detail, related) | `getStorefrontArticles()` / `BySlug()` / `getRelatedArticles()` |
| Cache terjemahan | `localizeRows()` → `translations:{entity}:{locale}` |
| API social links / products / cms | route handler masing-masing |

**Invalidasi otomatis** setelah admin menyimpan konten:
`invalidateStorefrontCache()` + `invalidateCache("translations:")` di
`/api/cms` (POST/PUT/DELETE), `/api/i18n/translations` (PUT/DELETE), dan
`/api/products` (POST). Perubahan admin langsung terlihat (< 1 detik).

Kill-switch untuk debug: `DISABLE_APP_CACHE=1`.

### 3.2 Query paralel
`src/app/(storefront)/page.tsx` — 6 query homepage (products, faqs, hero,
testimonials, stats, CTA) sekarang **satu `Promise.all`**, bukan 2 tahap
sequential. Dengan latensi 180 ms/query, paralel = hemat ~360 ms.

### 3.3 Dedupe request client-side — `src/lib/client-api.ts` (BARU)
Module-level promise cache + TTL 60 detik, dipakai oleh:
`SeoHead` + `PageGate` + `Navbar` (`/api/seo`) → **3 request jadi 1**
`SocialLinks` + `FloatingSocial` (`/api/social-links`) → **2 request jadi 1**

### 3.4 Header cache untuk API publik
`Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`
→ browser & CDN bisa menyimpan respons, request berikutnya **0 query**.

### 3.5 Ketahanan koneksi DB — `src/lib/prisma.ts`
Ditambahkan parameter: `connect_timeout=15`, `socket_timeout=20`,
`pool_timeout=30`, `connection_limit=15`.
Tujuannya: kalau koneksi diputus firewall, Prisma gagal/reconnect dalam
15–20 detik, bukan "membeku" 30+ detik.

### 3.6 Negative cache gambar remote (PDF)
`/api/catalog/pdf` mencoba fetch 5 foto Unsplash; kalau DNS gagal (jaringan
blokir) → `ENOTFOUND` tiap generate. Sekarang kegagalan dicatat 10 menit
(`remoteFailCache`) → PDF tidak bolak-balik coba.

### 3.7 Rate limiter login diperbaiki — `src/app/api/auth/login/route.ts`
Sebelumnya **semua** percobaan login dihitung, termasuk yang **berhasil** →
admin yang login rutin ikut terkunci `429` (masalah nyata: test suite & user
sama). Sekarang **hanya login GAGAL** yang dihitung; login berhasil me-reset
penghitung. Proteksi brute-force tetap bekerja.

---

## 4. Dampak ke konten & SEO

- Cache **tidak** mengubah HTML yang dilihat crawler: halaman tetap SSR
  (`force-dynamic`), meta tag, JSON-LD, hreflang, sitemap — semua utuh.
- Isi CMS yang diubah admin **muncul dalam ≤ 1 detik** (invalidate cache).
- `Cache-Control` pada API tidak memengaruhi halaman (hanya API publik yang
  di-cache; `?admin=1` tetap `no-store`).

---

## 5. Cara mengukur ulang

```bash
npm run build && npm start          # produksi
npm run test:perf                   # benchmark lengkap

# Bandingkan tanpa cache:
$env:DISABLE_APP_CACHE="1"; npm start   # (PowerShell)
npm run test:perf
```

---

## 6. Sisa masalah (di luar aplikasi)

| Masalah | Dampak | Saran |
|---|---|---|
| **DB Postgres remote & sering drop koneksi** | Query bisa gagal total saat DB down | Pindahkan DB ke server yang sama dengan aplikasi (atau jadi managed DB dengan failover) |
| `max_connections=100`, dipakai ~44 koneksi | Kalau traffic naik, pool habis | Turunkan `connection_limit` per proses, atau pakai PgBouncer |
| 5 foto produk masih dari Unsplash (remote) | Gambar bisa gagal dimuat + lambat | Unduh 5 foto itu ke `public/images/fabrics/` (sudah ada 13 foto lokal) |
| Cache in-memory per proses | Multi-instance → tiap instance cache sendiri | Kalau butuh shared cache: Redis (sudah ada plumbing untuk Upstash) |

---

## 7. Checklist cegah regresi

- `npm run test:all` → 414 pemeriksaan harus 0 fail
- `npm run test:perf` → semua halaman < 100 ms TTFB, API < 10 ms
- Setelah ubah konten di CMS: **cek halaman langsung** (cache di-invalidate otomatis)

---

## 8. Navigasi client-side (pindah halaman lewat navbar)

Diukur dengan Playwright (`scripts/bench-navigation.mjs`) — alur nyata: klik link
navbar, tunggu heading halaman baru muncul.

### Hasil produksi (Vercel)

| Navigasi | Sebelum | Sesudah |
|---|---|---|
| Katalog EN | ~1.800 ms | **114 ms** |
| Artikel EN | ~1.800 ms | **54 ms** |
| Homepage EN | ~1.800 ms | **55 ms** |
| SSR ulang (page load langsung) | 2.045–4.783 ms | **330–560 ms** |

### Penyebab: prefetch storm
`<Link>` di Next.js otomatis mem-prefetch RSC payload setiap link yang masuk
viewport. Di halaman artikel ada **11 link** (produk terkait, artikel terkait,
CTA, footer) → **11 render server paralel** → semua rebutan koneksi DB remote.

Perbaikan:
- `prefetch={false}` pada link berat: kartu produk, kartu artikel, produk &
  artikel terkait, dan **14 link di footer**
- Link navbar utama tetap di-prefetch (itu yang paling sering diklik)

### Progress bar navigasi (ganti `loading.tsx`)
`loading.tsx` sempat dicoba, tapi **merusak SEO**: file itu membuat Next.js
mulai streaming respons sebelum halaman selesai dirender, sehingga
`notFound()` tidak bisa lagi mengubah status HTTP → artikel yang tidak ada
mengembalikan **200** ("soft 404"). Google mengindeksnya sebagai halaman valid.

Sekarang:
- **Tidak ada `loading.tsx`** di route storefront → status 404 benar ✅
- Feedback visual memakai `NavProgress` (bar progres tipis di atas, murni
  client-side, tidak memengaruhi status HTTP)

### Peran 5 bahasa terhadap kecepatan
Ya, **5 bahasa menambah beban** karena tiap varian bahasa butuh lookup
terjemahan sendiri:
- `localizeRows()` → query tabel `content_translations` per entitas per bahasa
- Sebelum: 4–6 query tambahan per render halaman non-Indonesia
- Sekarang: **di-cache per (entitas, bahasa)** → 0 query setelah request pertama
- Ditambah index DB `content_translations(entity, locale)` supaya lookup
  per-bahasa tidak scan tabel

Pengecekan cepat: buka `/en/artikel` (versi non-Inggris) — kalau masih
lambat, berarti cache belum terisi (instance baru) → tunggu 1 menit.

---

## 9. Skrip benchmark

```bash
npm run test:perf    # TTFB + total tiap halaman & API
npm run test:rsc     # RSC payload + prefetch (yang dipakai navigasi)
npm run test:nav     # navigasi navbar sungguhan (Playwright)
npm run test:db      # latensi & koneksi database
```
