# Artikel / Pusat Panduan Tekstil + Peningkatan UX CMS — PT. Texora Visi Prima

Dokumentasi fitur **blog B2B** (top-of-funnel untuk website "web publish + CMS")
serta peningkatan **user experience panel CMS**.

---

## 1. Kenapa fitur ini dibuat

Mode website Texora adalah **web publish + CMS**, bukan e-commerce. Contain buyer
B2B tidak langsung checkout, tapi mencari informasi dulu sebelum minta harga.
Tanpa konten edukatif, website hanya bisa而为-target orang yang sudah siap
menggali áudio (kata "harga kain sublimasi", "jual roll kain jakarta").

| Masalah | Solusi dari fitur ini |
|---|---|
| Top-of-funnel kosong, semua trafik dari intent transaksional | 13 artikel menjawab pertanyaan pre-purchase |
| Hanya ada 4 kategori + FAQ, kedalaman topik tipis | Cluster artikel per kategori kain (sportswear, hijab, home living, merchandise, proses) |
| Halaman produk tidak pernah \"dibuat\" | Artikel mengarahkan trafik ke produk + form Minta Penawaran |
| Terjemahan 6 bahasa mahal (6x pekerjaan editor) | Bahasa lain dibuat otomatis dari satu naskah Indonesia (infra `content_translations` sudah ada) |
| AI assistant tidak punya sumber untuk mengutip | `llms.txt` + schema `Article` + isi artikel = bahan kutipan |

> Catatan: kategori landing page (`/kategori/*`) dan FAQ **sudah ada**.
> Artikel **tidak** mengulang keduanya — artikel ditulis khusus untuk intent
> edukatif yang belum dijawab, dan selalu menautkan ke kategori/produk.

---

## 2. Arsitektur

```
prisma/schema.prisma           model Article  ->  cms_articles
src/app/(storefront)/artikel/
  page.tsx                     daftar artikel (server, metadata + JSON-LD CollectionPage)
  ArtikelClient.tsx            filter kategori + pencarian (client, kartu tetap di HTML awal)
  [slug]/page.tsx              detail artikel (server, metadata + JSON-LD Article)
  [slug]/ArticleToc.tsx        daftar isi + scroll-spy (client)
src/app/api/articles/route.ts  GET publik + ?admin=1 (Administrator/Sales)
src/app/api/cms/route.ts       type "article": create / update / delete (Administrator)
src/app/portal/content-management/ArticleManager.tsx   editor artikel (client)
src/lib/article-utils.ts       normalisasi payload (slug, sanitasi HTML, JSON array)
src/lib/i18n/article-dictionary.ts   kamus teks 6 bahasa
src/config/cms-tabs.ts         registry tab CMS (dipakai sidebar + tab bar)
scripts/seed-articles.mjs      seed 13 artikel
scripts/test-articles.mjs      34 pemeriksaan otomatis
```

### Model data

| Field | Fungsi |
|---|---|
| `slug` | URL unik (`/artikel/<slug>`) |
| `title`, `excerpt` | Judul + ringkasan (kartu artikel & meta description) |
| `body` | HTML dari RichTextEditor (disanitasi saat disimpan) |
| `coverImage` | Gambar cover (upload lokal) |
| `category` | `sportswear` / `hijab-fashion` / `home-living` / `merchandise` / `proses` / `panduan` |
| `articleType` | `panduan` / `tips` / `case-study` / `news` |
| `tags`, `relatedProducts` | JSON array (tag bebas & slug produk untuk internal linking) |
| `author`, `authorRole` | Penulis + expertise (mis. Supervisor Dyeing & Printing) |
| `readMinutes`, `seoTitle`, `seoDescription` | Data tampilan + SEO manual |
| `isPublished`, `publishedAt` | Status publikasi & tanggal terbit |

---

## 3. Halaman Publik

### `/artikel` (daftar)
- Server component: semua kartu artikel **ada di HTML awal** (crawler & AI
  membaca tanpa menjalankan JS).
- Filter kategori + pencarian (client-side, state awal = "semua" supaya SSR
  dan HTML awal identik).
- JSON-LD `CollectionPage` + `ItemList` + `BreadcrumbList` + `LocalBusiness`.
- Metadata: canonical, hreflang 6 bahasa + x-default, OG.

### `/artikel/<slug>` (detail)
- **Daftar isi otomatis**: heading H2/H3 diambil langsung dari DOM artikel
  (client component `ArticleToc`), jadi selalu sinkron dengan isi — tidak
  perlu slug manual di editor. Sekalian jadi scroll-spy.
- Meta artikel: penulis, tanggal terbit, waktu baca, tag.
- **Kain yang dibahas**: kartu produk dari `relatedProducts` (internal linking).
- **Artikel terkait**: 3 artikel terbaru dengan kategori sama.
- CTA di sidebar + di bawah artikel: **Minta Penawaran** + **Unduh Katalog PDF**.
- JSON-LD `Article` (headline, author, datePublished, dateModified, publisher,
  articleSection, keywords) + `WebPage` + `BreadcrumbList`.

### Multi-bahasa
- `artikel` didaftarkan di `LOCALE_ALLOWED_SEGMENTS` (middleware) dan
  `LOCALIZABLE_SEGMENTS` (LanguageContext) → URL `/en/artikel`, `/ja/artikel/<slug>`, dll.
- Teks chrome artikel dari `src/lib/i18n/article-dictionary.ts` (6 bahasa).
- Isi artikel (title/excerpt/body) diterjemahkan via `content_translations`
  (entity `article`), fallback ke Bahasa Indonesia bila cache belum ada.

---

## 4. Panel Admin (tab "Artikel")

`CMS Konten → tab Artikel` (`/portal/content-management?tab=artikel`)

| Fitur | Penjelasan |
|---|---|
| Ringkasan | Kartu **Total / Publish / Draft** + jumlah per kategori |
| Pencarian | Judul, slug, dan tag |
| Filter | Semua / Publish / Draft |
| Aksi cepat | Lihat di website, **publish ⇄ draft** (tanpa buka editor), Edit, Hapus |
| Editor modal | Judul + slug (auto dari judul), excerpt, kategori, tipe, cover (upload), body (RichTextEditor), tag, **kain yang dibahas** (multi-select produk), penulis |
| Preview | Tombol Preview menampilkan artikel seperti di website |
| Pratinjau Google | Tampilan meta title/description + URL seperti hasil pencarian (di section SEO & Penulis) |
| Simpan | **Simpan Draft** atau **Simpan & Terbitkan** |
| Konfirmasi hapus | Dialog modal (bukan `confirm()` bawaan) dengan peringatan nama artikel |
| Notifikasi | Toast sukses/gagal auto-hide, plus pesan error per field |

Semua operasi menulis ke `/api/cms` dengan `type: "article"` (Administrator
saja) dan otomatis memicu **pre-translate** ke 5 bahasa lain.

---

## 5. Peningkatan UX CMS (bukan cuma blog)

| Perubahan | File |
|---|---|
| **Tab bar horizontal** di atas halaman CMS (sebelumnya tab hanya ada di submenu sidebar yang mudah terlewat) | `src/components/portal/CmsTabBar.tsx` |
| Registry tab tunggal dipakai sidebar **dan** tab bar (tanpa duplikasi) | `src/config/cms-tabs.ts` |
| Panduan (guide) per tab — termasuk tab Artikel | `src/app/portal/content-management/page.tsx` (`CMS_GUIDE_DETAILS`, `CMS_MODULE_TIPS`, `CMS_SEO_TIPS`) |
| Tab bar selalu terlihat (tidak menunggu data) + sticky | `src/app/portal/content-management/page.tsx` |
| Breadcrumb "Beranda" ikut berbahasa (sebelumnya hardcoded Indonesia) | `src/components/common/Breadcrumb.tsx` |

### Perbaikan teknis yang ikut dikerjakan
1. **`preTranslateFields` tadinya tidak pernah menerjemahkan** — hanya membaca
   cache. Sekarang memakai `translateItems()` sehingga benar-benar memanggil AI
   dan menyimpan hasil terjemahan (`src/lib/content-translator.ts`).
2. **`useLocalePath()` bug query string** — link seperti
   `/custom-sublimation?fabric=x` dan `/request-quote?product=y` sebelumnya
   **tidak** mendapat prefix bahasa. Sekarang segmen dibaca tanpa query string.
3. **Connection pool Postgres** — `connection_limit=13` (default) sering
   habis di mode dev → timeout. Sekarang 15 per proses + `pool_timeout=30`
   (total dibatasi agar tidak melebihi `max_connections=100`).
4. **Test navigasi flaky** — `test-locale-nav` sekarang menunggu navigasi selesai
   (`waitForURL`) alih-alih fixed delay.

---

## 6. Seed Konten

```bash
node scripts/seed-articles.mjs
```

13 artikel awal (idempotent — artikel yang slug-nya sudah ada dilewati):

| # | Slug | Kategori | Tipe |
|---|---|---|---|
| 1 | `panduan-memilih-kain-sublimasi-sportwear` | sportswear | panduan |
| 2 | `dryfit-jersey-pique-membedakan` | sportswear | panduan |
| 3 | `setting-heat-press-sublimasi-210-derajat` | proses | panduan |
| 4 | `sublimasi-vs-printing-plastisol` | proses | panduan |
| 5 | `voal-ultrafine-atau-ceruty-hijab` | hijab-fashion | panduan |
| 6 | `kenapa-viscose-tidak-bisa-disublimasi` | proses | panduan |
| 7 | `merawat-cetak-sublimasi-tahan-cuci` | proses | tips |
| 8 | `canvas-vs-oxford-600d` | merchandise | panduan |
| 9 | `banner-flag-menggunakan-polyester` | merchandise | panduan |
| 10 | `harga-bertingkat-moq-hitung-biaya-kain` | proses | tips |
| 11 | `studi-kasus-3000-meter-dryfit-turnamen` | sportswear | case-study |
| 12 | `proofing-digital-vs-sample-fisik-warna` | proses | panduan |
| 13 | `oeko-tex-standard-100-class-1` | proses | panduan |

> Semua isi ditulis dalam Bahasa Indonesia technical-practical (angka nyata:
> suhu, GSM, MOQ, toleransi) karena artikel yang menyebut angka teknis jauh
> lebih banyak dikutip AI assistant dan lebihobac进的 konversi.

---

## 7. SEO

- Satu artikel = satu kata kunci utama (tanpa cannibalization dengan
  `/kategori/*` dan FAQ).
- `sitemap.xml`: `/artikel` + semua detail artikel (priority 0.7, changefreq
  monthly, hreflang 6 bahasa).
- `llms.txt`: bagian **Articles & Technical Guides** berisi judul + ringkasan
  setiap artikel (bahan kutipan AI).
- Schema `Article` lengkap + `BreadcrumbList`.
- Judul artikel boleh punya `seoTitle`/`seoDescription` khusus; bila kosong
  memakai judul & ringkasan otomatis.

---

## 8. Pengujian

```bash
npm run test:articles   # 34 pemeriksaan
npm run test:all        # suite lengkap (artikel ikut termasuk)
```

Cakupan: 6 versi bahasa halaman daftar, 13 detail artikel (HTTP + JSON-LD +
CTA), slug ngawur → 404, prefix bahasa pada link artikel, API publik vs admin
(401), CRUD artikel via API CMS, penolakan slug bentrok (409), hapus artikel,
tab artikel di CMS + keberadaan tab bar, sitemap, llms.txt, dan link dari
homepage.

---

## 9. Ide Pengembangan Lanjutan (opsional)

- **Bulir komentar** — tidak direkomendasikan untuk B2B factory (menambah
  moderasi & spam tanpa manfaat konversi).
- **Newsletter** — cukup pakai CTA WhatsApp/RFQ yang sudah ada.
- **Related-post engine** — saat ini 3 artikel terbaru per kategori; bila
  jumlah artikel bertambah, ganti dengan similaritas kategori + tag.
- **AI draft** — tombol \"Buat draf artikel\" di editor yang menyusun outline
  dari kata kunci (GEMINI API), lalu diedit manusia sebelum publish.
- **Komentar teknis** — variasi artikel "pertanyaan teknis" per artikel
  untuk menangkap long-tail spesifik.
