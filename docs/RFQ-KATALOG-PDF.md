# Minta Penawaran (RFQ) & Katalog PDF — PT. Texora Visi Prima

Dokumentasi fitur **konversi B2B** untuk mode "web publish + CMS": pengunjung
tidak checkout, tapi **meminta penawaran harga** dan **mengunduh katalog PDF**.

---

## 1. Ringkasan

| Komponen | Lokasi |
|---|---|
| Halaman RFQ (publik) | `src/app/(storefront)/request-quote/page.tsx` |
| Form RFQ (client, multi-bahasa) | `src/app/(storefront)/request-quote/RequestQuoteClient.tsx` |
| API RFQ (POST publik / GET+PATCH admin) | `src/app/api/quote-requests/route.ts` |
| Generator Katalog PDF | `src/app/api/catalog/pdf/route.ts` |
| Kamus teks RFQ (6 bahasa) | `src/lib/i18n/quote-dictionary.ts` |
| Halaman admin RFQ | `src/app/portal/crm/quotes/page.tsx` |
| Tabel DB | `QuoteRequest` → `quote_requests` (Prisma) |
| Skrip test | `scripts/test-quote.mjs` (`npm run test:quote`) |

---

## 2. Halaman "Minta Penawaran" (`/request-quote`)

Halaman **server component** (metadata + JSON-LD dirender di server → terbaca
Googlebot/AI crawler tanpa JS) dengan form **client component**.

### Isi form
1. Nama lengkap* , Email* , WhatsApp/telepon, Perusahaan/Brand, Negara
2. Estimasi kebutuhan (meter)
3. Multi-select jenis kain (dari katalog, opsional)
4. Detail kebutuhan (warna target, lebar, GSM, repeat, deadline, catatan)
5. Upload file referensi (JPG/PNG/WebP/PDF, maks **2 MB**)
6. Centang **"Saya ingin sample swatch gratis"**

### Multi-bahasa
- Prefix URL: `/request-quote`, `/en/request-quote`, `/zh/...`, `/ja/...`, `/de/...`, `/ar/...` (RTL)
- Teks chrome memakai `QUOTE_COPY` (kamus terpisah 6 bahasa, `src/lib/i18n/quote-dictionary.ts`)
- `request-quote` didaftarkan di dua tempat agar konsisten:
  - `LOCALE_ALLOWED_SEGMENTS` → `src/middleware.ts` (rewrite + header `x-locale`)
  - `LOCALIZABLE_SEGMENTS` → `src/lib/i18n/LanguageContext.tsx` (prefix link internal)
- Link dengan query string tetap dapat di-prefix bahasa
  (contoh: `/en/request-quote?product=dryfit-milano-premium&source=catalog`)

### SEO
- `buildPageMetadata()` → canonical, hreflang 6 bahasa + x-default, OG locale
- JSON-LD: `BreadcrumbList` + `WebPage` + `LocalBusiness` + `Service`
- Terdaftar di `sitemap.xml` (priority 0.85) dan bagian **Request a Quote** di `llms.txt`

---

## 3. API RFQ (`/api/quote-requests`)

### `POST` (publik, tanpa login)
Request JSON:
```json
{
  "name": "Budi", "company": "PT Contoh", "email": "budi@contoh.com",
  "phone": "+62 812...", "country": "Indonesia", "meters": 750,
  "productIds": ["dryfit-milano-premium"], "productsText": "Dryfit Milano 180 GSM",
  "needsSample": true, "message": "Butuh warna navy...",
  "fileDataUrl": "data:image/png;base64,...", "fileName": "desain.png",
  "locale": "id", "source": "website"
}
```

Aturan:
- **CSRF**: header `Origin` harus sama dengan host (middleware menolak selain itu → 403)
- Validasi nama (≥2 karakter) + format email → 400 bila tidak valid
- Maks. pesan 4000 karakter
- File dikirim sebagai **data URL** (bukan endpoint upload publik):
  - Tipe diizinkan: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
  - Maks **2 MB**, tipe lain → 400
  - Disimpan ke `public/uploads/rfq-<ts>-<rand>.<ext>`
- Data tersimpan ke `quote_requests` (status awal `NEW`)
- Otomatis membuat **Lead** di pipeline CRM (`stage = NEW_INQUIRY`) agar tim sales
  bisa lanjut di `/portal/crm/leads`
- Audit log `QUOTE_REQUEST_CREATED`

### `GET` (Administrator / Sales Rep)
Mengembalikan daftar permintaan (maks 200, terbaru dulu). Query `?status=NEW`.
Tanpa login → 401. Role lain → 403.

### `PATCH` (Administrator / Sales Rep)
```json
{ "id": "...", "status": "CONTACTED", "notes": "Dihubungi via WhatsApp." }
```
Status: `NEW` → `CONTACTED` → `QUOTED` → `WON` / `LOST`.

---

## 4. Katalog PDF (`/api/catalog/pdf`)

Generate PDF A4 di server memakai **pdfkit**:

- **Cover**: identitas perusahaan, 4 poin kunci (kapasitas, jumlah katalog, sertifikasi, MOQ)
- **Halaman produk**: foto (di-resize ke 280px/quality 72 via **sharp**), komposisi,
  anyaman, lebar, status siap sublimasi, varian GSM, stok, harga bertingkat, deskripsi
- **Halaman penutup**: CTA "Siap Minta Penawaran?" + kontak (WhatsApp, email, alamat, jam kerja)
- Footer di setiap halaman: alamat + nomor halaman

Ukuran akhir ± **290 KB** untuk 17 produk (sebelum resize ≈ 9,6 MB).

Header respons:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Texora-Katalog-Produk-YYYY-MM-DD.pdf"
Cache-Control: public, max-age=3600
```

### Katalog unggahan (R2/S3) — disajikan lewat domain sendiri

Kalau admin mengunggah katalog sendiri, file disimpan di Cloudflare R2 dan
`/api/catalog/pdf` **tidak** me-redirect ke `*.r2.dev` lagi. Alasannya: domain
`r2.dev` diblokir DNS sebagian ISP Indonesia (resolv ke IP halaman blokir),
sehingga tombol "Unduh Katalog PDF" berakhir **"This site can't be reached"**.

Sekarang endpoint tersebut mengambil file di server lalu meneruskannya ke
pengunjung:

1. **Utama** — `GetObjectCommand` (S3 API) memakai `STORAGE_ENDPOINT`,
   `STORAGE_BUCKET_NAME`, dan kredensial yang sama dengan proses upload. Host-nya
   `*.r2.cloudflarestorage.com` yang tidak terkena blokir DNS.
2. **Fallback** — `fetch()` biasa ke URL publik, kalau URL bukan milik bucket
   kita (mis. CDN lain).
3. Kalau keduanya gagal — pengunjung tetap mendapat katalog otomatis yang
   dibuat dari data produk (bukan halaman error).

Range request diteruskan (`Accept-Ranges: bytes`), dan file dikirim sebagai
stream sehingga PDF besar (puluhan MB) tidak dibuffer penuh di memori.


> **Catatan font**: PDF memakai font standar (WinAnsi) → mendukung Latin/Indonesia
> (é, ñ). Glyph Mandarin/Japanese tidak tersedia di font standar, jadi katalog
> PDF sengaja dibuat dalam Bahasa Indonesia.

### Catatan teknis
- `pdfkit` & `sharp` harus **di-external-kan** di `next.config.mjs`:
  ```js
  experimental: { serverComponentsExternalPackages: ["pdfkit", "sharp"] }
  ```
  Tanpa ini, Next membundel pdfkit dan file metrik font
  (`data/Helvetica.afm`) tidak ditemukan (`ENOENT vendor-chunks/data/Helvetica.afm`).
- Dependency: `pdfkit`, `@types/pdfkit`, `iconv-lite` (butuh fontkit), `sharp`.

---

## 5. Integrasi CTA

| Lokasi | Tombol |
|---|---|
| Navbar (desktop + mobile) | "Minta Penawaran" → `/request-quote` |
| Footer | "Minta Penawaran Harga" + "Unduh Katalog PDF" |
| Hero homepage | CTA ketiga "Minta Penawaran" |
| Halaman `/catalog` | "Minta Penawaran" + "Unduh Katalog PDF" (header) |
| Kartu produk katalog | Ikon file → `/request-quote?product=<slug>&source=catalog` |
| Detail produk | "Minta Penawaran" → `/request-quote?product=<slug>&source=product` |
| Halaman `/request-quote` | Kartu "Unduh Katalog PDF" |

Semua link internal memakai `useLocalePath()` / `lp()` sehingga prefix bahasa
tetap terjaga (`/en/request-quote`).

---

## 6. Halaman Admin (`/portal/crm/quotes`)

- Menu portal: **CRM & Penjualan → "Permintaan Penawaran (RFQ)"** (id `crm.quotes`)
- Akses: `ADMINISTRATOR` + `SALES_REP` (mengikuti `ROUTE_PERMISSIONS` `/portal/crm`)
- Fitur: filter status (dengan jumlah), pencarian, ubah status langsung,
  detail (pesan, file referensi, catatan internal, link ke Lead di pipeline),
  tombol unduh katalog PDF
- Peta hak akses menu tersimpan di `SystemSetting` key `rbac.menu_access`;
  role yang sudah punya `crm.leads` otomatis diberi `crm.quotes`
  (skrip `scripts/migrate-menu-quotes.mjs`)

---

## 7. Pengujian

```bash
npm run test:quote     # 23 pemeriksaan
npm run test:all       # suite lengkap (quote ikut termasuk)
```

Cakupan: 6 versi bahasa halaman, CTA di beranda/katalog, unduh PDF (magic bytes
`%PDF` + header), validasi form, file referensi (sukses & ditolak), hak akses
admin, ubah status, halaman admin, menu portal, sitemap, dan `llms.txt`.

---

## 8. Catatan operasional

- **Quota AI**: halaman RFQ **tidak** memanggil AI saat render — seluruh teks
  berasal dari kamus statis (6 bahasa). Tidak ada kebocoran kuota.
- **Keamanan**: `Origin` check (CSRF), whitelist tipe/ukuran file, penamaan file
  acak, upload hanya ke `public/uploads`, list RFQ hanya untuk Admin/Sales.
- **Data**: tabel `quote_requests` otomatis ikut terbackup oleh scheduler backup
  (`instrumentation.ts` + `/api/cron/backup`).
