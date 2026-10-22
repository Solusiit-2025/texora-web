# Analisis Biaya & Risiko — Pemilihan CMS untuk Web Texora

**Tanggal:** 2026-10-22
**Status:** Analisis / keputusan arsitektur (belum ada implementasi)
**Trigger:** Permintaan "tambah CMS yang bisa dikelola dari WordPress" — trigger utama: tim marketing butuh editor yang lebih familiar.

---

## 0. TL;DR — Rekomendasi Singkat

> **Rekomendasi: Opsi A — perkuat CMS custom yang sudah ada (bukan menambah WordPress).**
> Alasan: gap yang dikeluhkan marketing (editor kurang familiar) bisa ditutup di custom CMS dengan effort **± 8–10 hari kerja**, sementara mengadopsi WordPress menambah **1 database, 1 sistem auth, 1 jadwal backup, 1 hosting/CDN, dan 1 attack surface** dengan biaya operasional **2–4× lebih tinggi** dan TCO 1 tahun **2–3× lebih mahal**.

WordPress **bisa** dan **sah** sebagai solusi (Skenario B), tapi hanya masuk akal bila **minimal salah satu** syarat ini terpenuhi:

1. Tim marketing **benar-benar menolak** bekerja dengan form CMS custom apa pun (mereka minta Gutenberg/Elementor secara eksplisit).
2. Ada **kebutuhan plugin/fitur spesifik** yang tidak mungkin dibangun di custom (mis. WooCommerce di WP, Yoast, element builder).
3. Sudah ada **situs/blog lama di WordPress** yang isinya harus dipertahankan/migrasi.

Kalau dari 3 syarat tersebut **tidak ada yang terpenuhi**, jangan tambah CMS. Perbaiki editor-nya saja.

---

## 1. Inventaris Faktual — CMS Custom yang Sudah Ada

Berdasarkan audit kode (`src/`, `prisma/schema.prisma`, `docs/`):

| Modul | Sumber Data | Lokasi | Status |
|---|---|---|---|
| Hero slider homepage | `HeroSlide` → `cms_hero_slides` | `src/app/portal/content-management/page.tsx` | ✅ Produksi |
| Testimoni mitra | `Testimonial` → `cms_testimonials` | idem | ✅ Produksi |
| FAQ | `FaqItem` → `cms_faq_items` | idem | ✅ Produksi |
| Konten/statistik situs (key-value) | `SiteContent` → `cms_site_content` | idem | ✅ Produksi |
| **Artikel / Blog** | `Article` → `cms_articles` | `src/app/portal/content-management/ArticleManager.tsx` | ✅ Produksi |
| Katalog produk + varian GSM + tier harga | `FabricProduct`, `FabricVariant`, `PriceTier` | `src/app/portal/catalog-management/page.tsx` | ✅ Produksi |
| SEO (meta, canonical, redirect, audit) | `seo-metadata.ts`, `/api/seo/*` | `src/app/portal/content-management?tab=seo` | ✅ Produksi |
| **AI optimizer (SEO)** | `category-seo.ts` + Gemini | `docs/SEO-AI-OPTIMIZER.md` | ✅ Produksi |
| **Terjemahan AI 5 bahasa (en/zh/ja/de/ar)** | `ContentTranslation` + `content-translator.ts` (44 KB) | `docs/I18N-MULTIBAHASA.md` | ✅ Produksi |
| Media sosial + inbox + komentar | `SocialComment`, `/api/social`, `/api/webhooks/social/*` | `src/app/portal/social-media` | ✅ Produksi |
| RBAC 4 role | `User`, `/api/rbac/*`, `docs/MODUL-AKSES-RBAC.md` | `src/app/portal/settings/users-rbac` | ✅ Produksi |
| Audit log + backup otomatis | `AuditLog`, `BackupLog`, `/api/cron/backup` | `src/lib/backup.ts` | ✅ Produksi |
| Integrasi ERP / Payment | `/api/webhooks/erp`, `/api/webhooks/payment` | `.env` §5 | ✅ Produksi |

**Total endpoint CMS:** `/api/cms` (19 KB, terpadu GET/POST/PUT/DELETE multi-tipe), `/api/products`, `/api/articles`, `/api/seo/*`, `/api/i18n/*`, `/api/upload`, `/api/social*`.

**Tab yang tersedia di Portal CMS** (dari `page.tsx`): `hero`, `testimonials`, `faqs`, `content`, `social`, `pricing`, `pages`, `artikel`, `seo`, `catalog`, `translations`.

> **Artinya: secara cakupan fitur, CMS custom kita sudah setara atau lebih lengkap dari WordPress + plugin untuk kasus use Texora.** Yang membedakan bukan fiturnya, tapi **ergonomi authoring** untuk non-teknis.

---

## 2. Gap Editor yang Dikeluhkan Marketing (Evidence-Based)

Ini akar masalah sebenarnya. Audit `src/components/common/RichTextEditor.tsx` (368 baris) + `ArticleManager.tsx`:

| Yang Biasa Ada di Gutenberg/Elementor | Ada di Custom Kita? | Catatan |
|---|---|---|
| Rich text block editor | ⚠️ **Setengah** | `contentEditable` + `document.execCommand()` (API browser yang sudah deprecated). Toolbar: bold, italic, H2, H3, list, ordered list, link, quote, image, undo, redo |
| **Tabel** | ❌ Tidak | Sering dibutuhkan marketing (tabel spesifikasi GSM) |
| **Block drag & drop / slash command** | ❌ Tidak | Mode "cruise control" WP |
| **Media library picker** | ❌ Tidak | `ImageUpload` → `/api/upload` → simpan ke `public/uploads`; **tidak ada** browse aset yang sudah terunggah |
| **Autosave draft** | ❌ Tidak | Kalau tab tertutup, kerjaan hilang |
| **Live preview halaman** | ❌ Tidak | Cek tampilan harus publish dulu |
| **Heading map / outline** | ❌ Tidak | Navigasi artikel panjang difficult |
| **Version history / undo multi-level** | ❌ Tidak | Hanya undo/redo session |
| **Bulk edit + scheduled publish** | ⚠️ Terbatas | Ada `isPublished` + `publishedAt` |
| **SEO field inline + preview SERP** | ✅ Ada | Lebih baik dari WP standar (AI optimizer) |
| **Terjemahan 5 bahasa otomatis** | ✅ Ada | WP butuh Polylang/WPML (paid) |
| **Preview draft tanpa publish** | ❌ Tidak | — |

**Kesimpulan:** yang hilang bukan "kemampuan", tapi **kelolaan**. 6–8 fitur di atas (tabel, media library, autosave, preview, heading map, block UX) bisa ditutup di custom dengan **± 8–10 hari kerja** tanpa menambah sistem apa pun.

---

## 3. Opsi yang Dipertimbangkan

| Opsi | Deskripsi | Skor marketing-UX | Biaya | Risiko |
|---|---|---|---|---|
| **A. Perkuat CMS Custom** | Upgrade `RichTextEditor` → Tiptap/ProseMirror, tambah Media Library, autosave, preview | ⭐⭐⭐⭐ (4/5, setelah patch) | 🟢 Terendah | 🟢 Rendah |
| **B. Headless WordPress (khusus Artikel)** | WP di subdomain, Next.js tarik via REST API, portal tetap untuk produk/CRM | ⭐⭐⭐⭐⭐ (5/5) | 🟡 Sedang | 🟡 Sedang–Tinggi |
| **C. WordPress Penuh** | WP jadi sumber konten utama (artikel + halaman + mungkin produk) | ⭐⭐⭐⭐⭐ | 🔴 Tinggi | 🔴 Tinggi |
| **D. Headless Self-Hosted (Payload / Directus)** | Overlay di Next.js/Postgres yang sudah ada | ⭐⭐⭐⭐ (4/5) | 🟡 Sedang | 🟡 Sedang |
| **E. SaaS (Sanity / Storyblok)** | CMS terkelola vendor, Studio di cloud | ⭐⭐⭐⭐ (4/5) | 🟡 Sedang | 🟢 Rendah (vendor) |

---

## 4. Analisis Biaya

### 4.1 Biaya Langsung per Bulan (IDR, estimasi Okt 2026)

| Komponen | A. Custom | B. WP Headless | C. WP Penuh | D. Payload/Directus | E. Sanity |
|---|---|---|---|---|---|
| Lisensi CMS | Rp 0 | Rp 0 (core) / Rp 0 (Community) | Rp 0 | Rp 0 (MIT) | Free: Rp 0 (≤20 seat) |
| Hosting WP / CMS | — | Rp 50.000–150.000 (VPS 2GB + MariaDB) | Rp 50.000–150.000 | Rp 0–80.000 (container di server yang sama) | Rp 0 (termasuk) |
| DB tambahan | — | Rp 0–50.000 (MariaDB di container yang sama) | Rp 0–50.000 | Rp 0 (pakai Postgres existing) | Rp 0 |
| Plugin premium (Elementor Pro / Yoast / WPML) | — | Rp 0–350.000 | Rp 150.000–500.000 | — | — |
| Seat SaaS | — | — | — | — | Rp 0–245.000/editor (Growth $15/seat) |
| **Total incremental / bulan** | **Rp 0** | **Rp 50.000–550.000** | **Rp 200.000–700.000** | **Rp 0–80.000** | **Rp 0–245.000** |

> Kurs indikatif USD/IDR ≈ 16.300. Harga hosting Indonesia: shared hosting ±Rp 30.000–80.000/bln; VPS lokal mulai Rp 20.000 (1GB) – Rp 50.000 (3GB) – Rp 100.000+ (8GB). Managed WP global (Kinsta/WP Engine) ≈ $35–70/bln ≈ **Rp 570.000–1.140.000/bln** — jauh lebih mahal, jarang masuk akal untuk 1 subdomain.

### 4.2 Biaya Development (Hari Kerja)

| Opsi | Breakdown | Total |
|---|---|---|
| **A. Custom** | Tiptap/ProseMirror + tabel + image extension (3), Media Library picker + endpoint list (2), Autosave draft + Preview (2), Heading map + polish UX (1), Pengujian & SOP (2) | **8–10 hari** |
| **B. WP Headless** | Docker compose WP+MariaDB+vhost (1,5), REST adapter + mapping ke model `Article` (3), Webhook publish → revalidate (1), Media proxy + `remotePatterns` (1), i18n bridging WP↔`ContentTranslation` (3), SEO canonical/sitemap/redirect (1,5), Sanitasi & regresi (2) | **12–18 hari** |
| **C. WP Penuh** | B + migrasi seluruh konten existing ke CPT (5), mapping produk ke WooCommerce/ACF (6), training & SOP (2), cutover & rollback plan (3) | **28–40 hari** |
| **D. Payload (Next-native)** | Install Payload di Next.js + schema migrasi dari Prisma (4), Admin auth + role mapping ke RBAC existing (2), media pipeline ke S3/R2 (1,5), testing (2) | **8–12 hari** |
| **D. Directus** | Install + connect ke Postgres existing (2), schema + role sync (3), adapter ke portal (3), testing (2) | **8–12 hari** |
| **E. Sanity** | Studio setup + schema (3), GROQ adapter + webhook (2), migrasi konten (3), media pipeline (1,5), testing (2) | **10–14 hari** |

> **Catatan Payload:** Payload v3 jalan *native di dalam Next.js* dan memakai **Postgres yang sudah ada** → tanpa DB baru, tanpa hosting baru, satu deploy. Ini kandidat terkuat kalau tetap mau "CMS terpisah tapi modern".

### 4.3 Biaya Operasional Berkelanjutan (per bulan)

| Opsi | Task rutin | Estimasi jam/bulan | Equivalent (Rp 120.000/jam) |
|---|---|---|---|
| A. Custom | Update dependency, sesekali bugfix | 1–2 jam | Rp 120.000–240.000 |
| B. WP Headless | Update core + plugin, hardening, backup DB WP, monitoring, spam | **4–8 jam** | Rp 480.000–960.000 |
| C. WP Penuh | B + sinkronisasi 2 arah + duplikasi kontrol akses | 6–12 jam | Rp 720.000–1.440.000 |
| D. Payload/Directus | Update service, backup | 2–3 jam | Rp 240.000–360.000 |
| E. Sanity | Review usage, ambil screenshot bulanan | 0,5–1 jam | Rp 60.000–120.000 |

**Perkiraan insiden keamanan WordPress (proyeksi internal, bukan statistik resmi):** ~4–8 insiden/tahun (plugin/theme usang, brute-force `wp-login`, injection lewat plugin form). Dampak rata-rata: 2–6 jam perbaikan + potensi reputasi. **Custom Next.js (TypeScript, dependency minimized) mengekspos surface jauh lebih kecil** — codebase sekarang sudah punya `sanitize.ts`, rate-limit login, 2FA, audit log.

### 4.4 Total Cost of Ownership — 1 Tahun

Asumsi: tarif engineer Rp 120.000/jam, 1 jam = 0,125 hari kerja.

| Opsi | Dev (1×) | Lisensi + hosting (12 bln) | Opsional (12 bln) | **TCO 1 tahun** |
|---|---|---|---|---|
| **A. Custom** | Rp 10–14 juta | Rp 0 | Rp 1,4–2,9 juta | **Rp 11–17 juta** |
| **B. WP Headless** | Rp 18–27 juta | Rp 0,6–6,6 juta | Rp 5,8–11,5 juta | **Rp 24–45 juta** |
| **C. WP Penuh** | Rp 42–60 juta | Rp 2,4–8,4 juta | Rp 8,6–17,3 juta | **Rp 53–86 juta** |
| **D. Payload/Directus** | Rp 12–18 juta | Rp 0–1 juta | Rp 2,9–4,3 juta | **Rp 15–23 juta** |
| **E. Sanity** | Rp 15–21 juta | Rp 0–2,9 juta | Rp 0,7–1,4 juta | **Rp 16–25 juta** |

> **Selisih A vs B ≈ Rp 13–28 juta/tahun.** Cukup untuk menutup biaya Theme WP premium, biaya migration, dan biaya “training marketing” sekaligus, **dengan mengorbankan 0 fitur CMS** (karena fiturnya sudah ada).

---

## 5. Analisis Risiko

### 5.1 Risiko Arsitektural (Opsi B & C — Headless WP)

| # | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R1 | **Dua sumber kebenaran** — artikel bisa ada di WP *dan* di `cms_articles` (Prisma) | Tinggi | Sedang | Tentukan WP sebagai *authoring only*, Prisma sebagai *cache/fallback*. Sinkronisasi 1 arah (WP → Next.js), enforced di kode. |
| R2 | **Penggabungan i18n** — `ContentTranslation` (AI, 5 bahasa) vs Polylang/WPML | Tinggi | Tinggi | Kalau pilih B: **jangan pakai Polylang**. WP dipakai hanya Bahasa Indonesia; terjemahan tetap di `ContentTranslation` via adapter. |
| R3 | **Login ganda** — marketing login WP, staff login portal | Sedang | Tinggi | Training + SOP; atau passkey/TOTP SSO (biaya +2 hari). |
| R4 | **Performa** — 1 hop tambahan (Next.js → WP API) saat render | Sedang | Sedang | `revalidate` 300s + ISR + cache edge; fallback ke DB kalau WP timeout > 2s. |
| R5 | **Media** — gambar dari `wp-content/uploads` tanpa CDN | Sedang | Tinggi | Wajib proxy/cache gambar ke R2/Cloudflare; jangan tarik langsung. |
| R6 | **SEO** — duplikasi URL, canonical salah, sitemap dua sumber | Tinggi | Sedang | Single source of truth untuk sitemap; canonical → `texora.co.id`; mapping redirect WP → Next.js. |
| R7 | **Lock-in vendor** — markup WP, plugin wajib | Sedang | Sedang | Adapter terisolasi di 1 file (`src/lib/cms-provider.ts`) — ganti provider tanpa mengubah UI. |

### 5.2 Risiko Operasional (khas WordPress)

| # | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R8 | **Kerentanan plugin** | Tinggi | Tinggi | Update mingguan, minimal plugin, WAF (Cloudflare), `wp-login` dibatasi IP. |
| R9 | **Brute-force & spam** | Sedang | Tinggi | Cloudflare + 2FA + plugin security + honeypot. |
| R10 | **Backup berlapis** — `BackupLog` sekarang hanya cover PostgreSQL | Tinggi | **Pasti** kalau B/C | Wajib: cron `mysqldump` → object storage, plus restore drill 1×/kuartal. |
| R11 | **Resource & monitoring** — WP + MariaDB + PHP-FPM = 4 proses lagi | Sedang | Tinggi | Container terpisah + limit CPU/memori + healthcheck. |
| R12 | **Human error** — marketing edit salah di WP (hapus article, publish draft) | Sedang | Sedang | Draft-first, review flow, atau nonaktifkan publish langsung oleh non-admin. |

### 5.3 Risiko Opsi A (Perkuat Custom)

| # | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| A1 | Ketergantungan ke `document.execCommand` (deprecated) | Sedang | **Pasti** (sudah terjadi) | Upgrade ke Tiptap/ProseMirror → ini *justru* bagian dari patch. |
| A2 | Marketing tetap mengeluh & meminta WP | Sedang | Sedang | démontré perbaikan (live demo), SOP + video 5 menit, tombol "Simpan Draft". |
| A3 | Dev time habis untuk fitur UI | Sedang | Sedang | Batasi scope: 8–10 hari, 1 sprint. |
| A4 | Tidak ada "page builder" visual (drag-drop section) | Sedang | Sedang | `SiteContent` + `HeroSlide` sudah menutup 80% kebutuhan landing page. |

---

## 6. Roadmap Jika Memilih Opsi A (Rekomendasi) — 3 Fase

| Fase | Isi | Deliverable | Hari |
|---|---|---|---|
| **F1 — Editor 2.0** | Ganti `execCommand` → **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`); tambah extension **Table**, **Image**, **Link**, **Placeholder**; shortcut & toolbar ringkas; heading map/outline | `RichTextEditor.tsx` → `RichTextEditorV2.tsx` (versi lama tetap ada sebagai fallback) | 3 |
| **F2 — Media Library** | Tabel `MediaAsset` di Prisma (nama, url, mime, size, uploader, createdAt); endpoint `GET/POST/DELETE /api/media`; modal picker (grid, filter, salin URL, hapus) dipakai di editor + cover image + hero slide | `/portal/media-library` + integrasi di 3 tempat | 2 |
| **F3 — DX Marketing** | Autosave draft (debounce 2 d + restore saat buka modal), tombol **Pratinjau** (render `RichContent` dalam iframe/modal), scheduled publish, "Restore versi sebelumnya" (snapshot `body` per autosave), SOP + video 5 menit | QS | 2 |
| **F4 — Hardening (opsional)** | Rate-limit `/api/cms`, header CSP, audit log perubahan konten, notifikasi Telegram saat publish | QS | 1 |

**Total: 8–10 hari kerja.** Semua memakai stack yang sudah ada → **tanpa hosting baru, tanpa DB baru, tanpa tagihan baru**.

### Quick-win tambahan (bila tim marketing tetap kurang yakin)
- Template artikel (panduan / case study / berita) → 1 klik isi kerangka + contoh. (1 hari)
- "Copy dari artikel lain" untuk artikel multilingual. (0,5 hari)
- Preview gambar di dalam editor + alt text wajib. (0,5 hari)

---

## 7. Roadmap Jika Memilih Opsi B (Headless WP) — untuk perbandingan apples-to-apples

| Fase | Isi | Hari |
|---|---|---|
| B1 | `docker-compose.yml`: service `wordpress` (image `wordpress:6.x`) + `wp-db` (mariadb) + vhost nginx `cms.texora.co.id`; `.env` WP_URL, WP_USER, WP_APP_PW | 1,5 |
| B2 | `src/lib/cms-provider.ts` — interface `CmsProvider` + implementasi `PrismaProvider` (default) & `WordPressProvider` (feature flag) | 1 |
| B3 | `src/app/api/wp/posts/route.ts` — adapter REST (`/wp-json/wp/v2/posts?_embed`), mapping ke bentuk `Article` (slug, title, excerpt, body HTML, coverImage, tags, category, publishedAt) | 2 |
| B4 | Normalisasi HTML & sanitasi ulang (karena HTML WP bisa bring plugin markup) — reuse `src/lib/sanitize.ts` | 1 |
| B5 | Webhook `save_post` (plugin kecil atau WP-CLI) → `POST /api/revalidate` (secret) → `revalidateTag`/`revalidatePath` | 1 |
| B6 | Media: allowlist domain WP di `next.config` (`remotePatterns`), lazy-load + proxy cache ke R2 bila perlu | 1 |
| B7 | i18n: konten WP (ID) masuk ke `ContentTranslation` pipeline → 5 bahasa tetap dari Gemini; blokir pipeline untuk WP agar tidak dobel | 2 |
| B8 | SEO: canonical → `texora.co.id`, sitemap tetap dari Next.js, import redirect WP (jika ada) | 1,5 |
| B9 | Uji regresi: `npm run test:articles`, `test:seo`, `test:redirects`, `test:content-i18n`, `test:browser` | 1 |
| **B10** | **Hardening WP**: 2FA plugin, batasi `wp-login` IP, nonaktifkan users bawaan, auto-update core, minimal plugin, Cloudflare rule | 1 |

**Total: 12–18 hari kerja + 4–8 jam/bulan operasional.**

### Gotcha yang sering terlewat saat Integrasi WP Headless
1. **WordPress Rewrite & Pretty URL** — pastikan `/wp-json` tidak diblokir reverse proxy.
2. **Application Password** (Basic Auth) lebih aman daripada password biasa; jangan pernah taruh kredensial WP di client.
3. **Revisi (revisions)** = versioning — bisa dipakai untuk “restore versi” gratis (bonus vs custom).
4. **Emoji/shortcode** di body HTML harus di-expand sebelum disimpan.
5. **Cache WP (page cache plugin)** bisa menyajikan HTML basi — pakai REST API, bukan scraping HTML.
6. **Timezone** — WP default UTC vs `publishedAt` lokal; normalisasi ke UTC di adapter.

---

## 8. Kriteria Keputusan (Checklist)

Jawab **YA** untuk setiap pertanyaan. Kalau ≥3 “YA”, pilih Opsi B/C. Selain itu → Opsi A.

| # | Pertanyaan | Jawaban |
|---|---|---|
| 1 | Apakah marketing **menolak keras** memakai form CMS custom? (bukan sekadar "kurang nyaman") | ☐ |
| 2 | Apakah ada fitur/plugin WP spesifik yang **wajib** ada (WooCommerce, Multi-currency, membership)? | ☐ |
| 3 | Apakah sudah ada konten lama di WordPress yang harus dipertahankan? | ☐ |
| 4 | Apakah ada tim/teknisi yang **mengelola server WP** (update core, plugin, hardening)? | ☐ |
| 5 | Apakah siap menambah **1 database + 1 container + 1 backup schedule**? | ☐ |
| 6 | Apakah siap menambah **± Rp 25–45 juta** TCO 1 tahun? | ☐ |

> **Kondisi Texora saat ini:** 1 ☐, 2 ☐, 3 ☐, 4 ⚠️ (kemungkinan belum ada dedicated), 5 ☐, 6 ☐ → **Mayoritas “TIDAK” → Opsi A.**

---

## 9. Rekomendasi Final

1. **Pilih Opsi A (perkuat CMS custom).** Root cause masalah ada di *ergonomi authoring*, bukan di *kekurangan fitur*. Patch 8–10 hari menutup hampir semua keluhan marketing (tabel, media library, autosave, preview, heading map) **tanpa menambah sistem, hosting, atau tagihan**.
2. **Kalau nanti tetap butuh WP**, 반드시 **Opsi B (headless, khusus Artikel)** — bukan Opsi C. Dan pakai **feature flag** (`CMS_PROVIDER=prisma|wordpress`) plus adapter terisolasi di `src/lib/cms-provider.ts`, supaya migrasi bisa dilakukan bertahap dan di-rollback.
3. **Kalau tetap ingin "CMS terpisah yang modern" tanpa hosting/DB baru**, opsi terbaik adalah **Payload CMS** (native Next.js, Postgres existing) — effort mirip Opsi B, biaya jauh lebih rendah, tanpa surface keamanan WordPress. Ini kandidat cadangan nomor 1.
4. **Hindari** SaaS (Sanity/Contentful) kalau ada requirement data & translate 5 bahasa dengan AI — biaya seat + migrasi konten tidak sepadan dengan manfaat pada skala ini.

---

## 10. Referensi Harga (perlu diverifikasi ulang sebelum budget approval)

| Sumber | Angka | Tanggal cek |
|---|---|---|
| Sanity Pricing | Free: $0 (≤20 seat, 1M API CDN req, 100 GB bandwidth) · Growth: **$15/seat/bulan** + overage ($1/25k API req, $0.5/GB asset, $0.3/GB bandwidth) | Okt 2026 |
| Strapi Cloud | Starter $35/proyek · Pro $90 · Business $450 (bln); Self-hosted Community gratis (MIT) | Okt 2026 |
| Directus | Self-host gratis (revenue < $5J) · Cloud **$499/bln** (Team) | Okt 2026 |
| Contentful | Free ≤10 user · **Basic $300/bln** | Okt 2026 |
| Storyblok | Starter **$99/bln** per space | Okt 2026 |
| Payload | MIT gratis self-host · Cloud dari $99/bln | Okt 2026 |
| Hosting WP Indonesia | Shared ±Rp 30.000–80.000/bln · VPS 2–3GB Rp 50.000–150.000/bln | Okt 2026 |
| Managed WP global | Kinsta/WP Engine ±$35–70/bln (≈Rp 570rb–1,14jt) | Okt 2026 |

> Semua angka di atas **snapshot publik per Oktober 2026** — wajib dicek ulang ke halaman harga resmi sebelum masuk dokumen budget.

---

## 11. Lampiran — Sketsa Arsitektur Opsi B (kalau nanti dipilih)

```text
┌─────────────────┐   publish    ┌──────────────────┐
│  Tim Marketing  │ ───────────▶ │  WordPress       │
│  (wp-admin)     │              │  cms.texora.co.id│
└─────────────────┘              └────────┬─────────┘
                                          │ ① REST API (read-only, app password)
                                          │ ② webhook save_post → revalidate
                                          ▼
                          ┌───────────────────────────────┐
                          │  Next.js (tetap sama)         │
                          │  src/lib/cms-provider.ts      │
                          │   ├ PrismaProvider  (default) │
                          │   └ WordPressProvider (flag)  │
                          │  /api/articles  ← adapter     │
                          │  /api/media     ← proxy R2    │
                          │  ContentTranslation (AI 5    │
                          │    bahasa) tetap dari Prisma  │
                          └───────────┬───────────────────┘
                                      ▼
                          ┌───────────────────────────────┐
                          │  PostgreSQL (existing)        │
                          │  cms_articles, cms_translation│
                          │  → cache/fallback saat WP mati│
                          └───────────────────────────────┘
```

**Environment variables baru (kalau Opsi B):**

```env
# CMS Provider
CMS_PROVIDER="prisma"              # prisma | wordpress
WP_URL="https://cms.texora.co.id"
WP_APP_USER="texora_api"
WP_APP_PASSWORD="<app-password>"
WP_WEBHOOK_SECRET="<shared-secret>"
NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS="cms.texora.co.id,texora.co.id"
```

---

**Dokumen ini adalah analisis, belum ada perubahan kode.** Keputusan akhir → implementasi.
