# Audit SEO & Rencana Aksi — XoraMateria

**Tanggal audit:** 23 Oktober 2026
**Domain kanonik:** `https://texora.co.id`
**Stack:** Next.js 14 (App Router) + PostgreSQL/Prisma + Vercel
**Status:** Audit selesai, sebagian perbaikan sudah diimplementasikan

---

## 1. Ringkasan Eksekutif

| Pilar | Skor | Status |
|---|---|---|
| **Technical SEO** | **88/100** | Fondasi kuat; optimasi caching tersisa |
| **On-Page SEO** | **92/100** | Sangat lengkap (metadata, schema, internal link) |
| **Off-Page SEO** | **55/100** | Fondasi sosial ada; backlink & GBP belum |
| **E-E-A-T** | **88/100** | Naik setelah halaman legal & profil tim |

**Kesimpulan:** secara teknis situs sudah di atas rata-rata. Yang paling menahan pertumbuhan bukan kode, melainkan **sinyal otoritas** (backlink, Google Business Profile, konsistensi konten) dan **kecepatan respons** (belum ada cache CDN).

**Bahasa utama yang diindeks:** **Bahasa Indonesia** (URL tanpa prefix = kanonik, `x-default` → versi Indonesia). Lima bahasa lain (`en`, `zh`, `ja`, `de`, `ar`) diindeks sebagai halaman terpisah dengan `hreflang`.

---

## 2. Technical SEO

### 2.1 Yang sudah baik

| Item | Bukti / Implementasi |
|---|---|
| Sitemap dinamis + `hreflang` 6 bahasa + image sitemap | `src/app/sitemap.xml/route.ts` |
| `robots.txt` + allowlist 20 AI crawler | `src/app/robots.ts` |
| Canonical per halaman + `x-default` | `src/lib/seo-metadata.ts:112-222` |
| Optimasi gambar AVIF/WebP + cache 30 hari | `next.config.mjs` (`images.formats`) |
| Preload gambar hero (LCP) | `src/app/(storefront)/page.tsx` |
| URL bersih & deskriptif | `/catalog/[slug]`, `/kategori/[slug]`, `/artikel/[slug]` |
| Redirect manager 301 | `/api/seo/redirects` + `src/lib/redirects.ts` |
| Header keamanan | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **HSTS (baru)** | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| **CSP (baru)** | `Content-Security-Policy` di `next.config.mjs` |
| **CDN cache storefront (baru)** | `s-maxage=300, stale-while-revalidate=600` untuk dokumen HTML publik |

### 2.2 Yang diperbaiki dalam audit ini

1. **Konflik robots vs sitemap** — `/custom-sublimation` di-*disallow* tetapi tetap dikirim di sitemap. Sudah dibuka.
2. **Font render-blocking** — Google Fonts `<link>` diganti **`next/font`** (self-hosted, `display: swap`, preload otomatis).
3. **HSTS** ditambahkan.
4. **CSP** ditambahkan (production: tanpa `unsafe-eval`; development: dilonggarkan untuk React Refresh).
5. **CDN cache headers** ditambahkan di middleware untuk halaman storefront publik.

### 2.3 CDN Cache yang Diterapkan

Header yang dikirim untuk dokumen HTML publik:

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
CDN-Cache-Control: public, s-maxage=300, stale-while-revalidate=600
Vercel-CDN-Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

**Aturan bypass (tidak di-cache):**

| Kondisi | Alasan |
|---|---|
| Method bukan `GET` | Tidak ada konten untuk di-cache |
| `Sec-Fetch-Dest` bukan `document` | Navigasi RSC/fetch Next.js punya payload berbeda |
| `?preview=1` atau `?fresh=1` | Admin butuh data terbaru |
| Prefix `/portal`, `/customer`, `/api`, `/cart`, `/checkout`, `/track-order`, `/login`, dll. | Halaman privat/transaksional |
| URL non-prefix + cookie `texora-locale` | HTML bisa berbeda bahasa untuk URL yang sama |
| Response mengirim `Set-Cookie` | Respons personal |

**Konsekuensi yang perlu diketahui:**
- Perubahan konten/modul bisa terlihat telat **maksimal 5 menit** di edge.
- Pengunjung yang memilih bahasa lewat cookie tetapi membuka URL non-prefix akan menerima versi cache (Indonesia). Language switcher tetap mengarahkan ke URL ber-prefix (`/en`, `/de`, dst.), jadi alur normal tidak terpengaruh.
- Jika butuh invalidasi instan, turunkan `s-maxage` ke 60 detik atau tambahkan purge pada pipeline deploy.

### 2.4 Gap tersisa

| Gap | Dampak | Rekomendasi |
|---|---|---|
| Semua halaman `force-dynamic` | Render di origin (walau HTML kini di-cache CDN 5 menit) | ISR setelah refactor locale (menengah) |
| `cookies()` di root layout | Memaksa seluruh route dinamis | Pindahkan locale ke URL, hapus fallback cookie di SSR |
| Gate modul (`isPageDisabled`) di root layout | Query DB + `headers()` per request | Pindahkan ke middleware dengan cache 60 detik |
| Belum ada CSP nonce | `script-src` masih `unsafe-inline` | Gunakan nonce via middleware (hardening lanjutan) |
| Verifikasi HTTPS & sitemap di GSC | Belum terbukti dari kode | Tugas dashboard (lihat §6) |

### 2.5 Kenapa ISR belum diaktifkan

1. `cookies()` dan `headers()` di root layout membuat **semua halaman dinamis**.
2. Locale saat ini dikirim sebagai **header hasil rewrite middleware** (`/en/catalog` → `/catalog` + `x-locale: en`).
3. ISR menyimpan cache berdasarkan **path hasil rewrite**. Jika diaktifkan sekarang, `/en`, `/de`, dan `/ja` akan berbagi cache key `/catalog` → **bahasa bisa tertukar**.
4. Agar ISR aman, locale harus menjadi bagian dari route (mis. `src/app/[locale]/...`) sehingga cache key unik per bahasa.

**Estimasi refactor penuh:** 2–3 hari kerja + pengujian 6 bahasa.

---

## 3. On-Page SEO

### 3.1 Yang sudah baik

| Item | Status |
|---|---|
| Satu H1 per halaman + hierarki H2/H3 | ✅ terverifikasi 12 halaman utama |
| Meta title ≤ 62 karakter & description ≤ 160 (auto-truncate) | ✅ `truncateTitle()` / `truncateDescription()` |
| Keyword per halaman | ✅ `src/lib/seo-pages.ts` |
| Structured data | ✅ WebSite + SearchAction, LocalBusiness/Manufacturer/WholesaleStore, Product + Offer + Review, FAQPage, Article, Breadcrumb, WebPage |
| Internal linking | ✅ breadcrumb, produk terkait, artikel → produk, footer katalog/kategori |
| AI SEO optimizer per kategori | ✅ `src/lib/category-seo.ts` |
| SEO Health Audit di CMS | ✅ `/api/seo/audit` + `SeoHealthPanel` |
| Multibahasa + hreflang | ✅ 6 locale, canonical per URL |

### 3.2 Gap tersisa

- Riset keyword & search intent bersifat **operasional/editorial**, bukan pekerjaan kode.
- Perlu disiplin menautkan setiap artikel ke minimal satu produk katalog.
- Beberapa meta description mendekati batas 160 karakter — pantau di SEO Health Check.

---

## 4. Off-Page SEO

### 4.1 Yang sudah ada

- `sameAs` di schema Organization: Instagram, TikTok, YouTube, Facebook, LinkedIn.
- Tautan sosial dikelola dari CMS + floating social dock.
- Konsistensi brand **XoraMateria** di seluruh halaman.

### 4.2 Gap

| Item | Status | Catatan |
|---|---|---|
| Backlink berkualitas | ❌ | Belum ada strategi aktif |
| Google Business Profile | ❌ | Prioritas tertinggi untuk pasar Jakarta Utara |
| Brand mentions (media/forum) | ❌ | Belum ada |
| Direktori industri | ❌ | Belum terdaftar |
| Verifikasi URL sosial | ⚠️ | Pastikan akun `instagram.com/xora_hijab` & `linkedin.com/company/xoramateria-visi-prima` aktif |

> Off-page tidak dapat diselesaikan lewat kode. Perlu aksi marketing rutin.

---

## 5. E-E-A-T

### 5.1 Yang sudah ada

| Komponen | Status |
|---|---|
| Halaman Tentang + kapasitas pabrik | ✅ |
| Halaman Kontak + alamat, telepon, email | ✅ |
| Sertifikasi OEKO-TEX, toleransi produksi, termin pembayaran | ✅ |
| Author + role pada artikel | ✅ |
| **Kebijakan Privasi** (`/privacy`) | ✅ baru |
| **Syarat & Ketentuan** (`/terms`) | ✅ baru |
| **Halaman Tim & Keahlian** (`/penulis`) | ✅ baru |
| Kartu penulis di artikel + schema `Person` (`knowsAbout`) | ✅ baru |
| Link legal di footer & checkbox registrasi | ✅ |
| Halaman legal masuk sitemap | ✅ |
| Canonical legal → versi Indonesia + `noindex` untuk locale lain | ✅ baru |

### 5.2 Gap tersisa

- Halaman legalitas usaha publik (NPWP/izin) — opsional, memperkuat trust.
- Profil penulis masih berbasis divisi (bukan individu) — sesuai kebijakan privasi staf.
- Testimoni harus dipastikan berasal dari mitra nyata.

---

## 6. Tindakan Prioritas

### Hari ini (30 menit) — Google Search Console

- [ ] Buka [search.google.com/search-console](https://search.google.com/search-console)
- [ ] Tambahkan properti **Domain**: `texora.co.id` → verifikasi
- [ ] Submit sitemap: `https://texora.co.id/sitemap.xml`
- [ ] Cek **Indexing → Pages**: jumlah URL per prefix (`/`, `/en`, `/de`, `/zh`, `/ja`, `/ar`)
- [ ] Cek **Experience → Core Web Vitals**
- [ ] **URL Inspection** → minta indexing: `/`, `/catalog`, 2 produk, 2 artikel

### Minggu ini — sinyal lokal

- [ ] Buat **Google Business Profile** (alamat Tugu Utara)
- [ ] Samakan NAP (Nama–Alamat–Telepon) di website, GBP, direktori
- [ ] Daftar 3–5 direktori: Yellow Pages ID, Indonesia Export, asosiasi tekstil

### 30 hari — konten & internal link

- [ ] Semua kampanye/backlink mengarah ke **URL Indonesia** (bukan `/en`)
- [ ] 2–4 artikel baru/bulan dengan long-tail keyword
- [ ] Setiap artikel: 1 H1, H2/H3, link ke produk, CTA, author jelas
- [ ] Update 3 artikel lama/bulan (tambah data + internal link)

### Teknis (dapat dikerjakan developer)

- [x] CDN cache headers untuk storefront publik (±2–4 jam)
- [ ] Pindahkan gate modul ke middleware (±1 hari)
- [ ] Refactor locale ke route segment + ISR (±2–3 hari)
- [ ] CSP nonce (±1 hari)

---

## 7. Target 90 Hari

| Metrik | Target |
|---|---|
| URL terindeks | 30–50 (mayoritas versi Indonesia) |
| Keyword masuk 100 besar | 20+ |
| Keyword masuk 10 besar | 5+ |
| Lead organik/bulan | 5–10 (form + WhatsApp) |
| LCP mobile | < 2,5 detik |
| Error hreflang di GSC | 0 |
| Core Web Vitals "Poor" | 0 halaman |

---

## 8. Strategi Bahasa

| Skenario | Rekomendasi |
|---|---|
| **90% pembeli dari Indonesia** | Indonesia = prioritas. 5 bahasa lain sebagai pelengkap. Jangan investasi konten EN mahal. |
| **Mulai ekspor** | EN harus punya konten native (bukan terjemahan mesin). Jika belum siap, `noindex` EN. |
| **Belum yakin** | Biarkan konfigurasi sekarang, pantau GSC 30 hari. |

**Keputusan default yang direkomendasikan:** kunci pasar Indonesia dulu lewat GBP + backlink + konten, sambil menyiapkan caching.

---

## 9. Peta Berkas Terkait

| Kebutuhan | Berkas |
|---|---|
| Metadata, canonical, hreflang, schema | `src/lib/seo-metadata.ts` |
| Judul & deskripsi per halaman | `src/lib/seo-pages.ts` |
| Pengaturan SEO dari CMS | `src/lib/seo.ts`, `/api/seo` |
| Sitemap | `src/app/sitemap.xml/route.ts` |
| Robots | `src/app/robots.ts` |
| llms.txt (AI crawler) | `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts` |
| Header keamanan, CSP, font | `next.config.mjs`, `src/app/layout.tsx` |
| Legal & tim | `src/app/(storefront)/privacy`, `terms`, `penulis` |
| Halaman legal layout | `src/components/storefront/LegalDocument.tsx` |
| Profil tim editorial | `src/config/authors.ts` |
| Audit SEO internal | `/api/seo/audit`, `SeoHealthPanel` |

---

## 10. Catatan Operasional

- **Googlebot tidak mengirim cookie** → selalu melihat versi Indonesia pada URL non-prefix. Tidak ada cloaking.
- **`x-default`** menunjuk ke versi Indonesia untuk pengunjung yang bahasanya tidak cocok.
- **Terjemahan konten** tersimpan di tabel `content_translations` (270–279 baris per locale; produk 18/18, artikel ~91–94 field, SEO metadata 20 halaman).
- Jika terjemahan belum tersedia, sistem fallback ke teks Indonesia. Pantau coverage di **CMS → Terjemahan**.

---

*Dokumen ini adalah hasil audit kode, bukan laporan indexing Google. Status indexing aktual hanya dapat dilihat di Google Search Console.*
