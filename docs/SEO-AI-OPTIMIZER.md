# 🚀 SEO Google & AI Optimizer — PT. Texora Visi Prima

Dokumentasi lengkap implementasi SEO & AI-readiness untuk website Texora.
Semua metadata dirender **di server** sehingga Googlebot, Bingbot, dan AI
crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, dll.) membacanya
tanpa harus mengeksekusi JavaScript.

---

## 📌 Phase 2 (tambahan terbaru)

| Fitur | Deskripsi |
|---|---|
| **Redirect Manager** | CMS-managed 301/308/302/307, wildcard, middlewaare edge + cache 60 detik |
| **Landing Page Kategori** | 4 halaman `/kategori/*` dengan konten edukatif + panduan teknis + FAQ (static-prerender) |
| **Product Schema Enrichment** | mpn, color, size, weight, review + aggregateRating dari testimoni CMS |
| **LCP Optimization** | Preload `<link rel=preload as=image>` + `fetchPriority=high` + `decoding=sync` pada gambar hero |
| **Verifikasi Search Engine** | Tag Google/Bing/Yandex/Pinterest/Facebook/Naver + GA4 + GTM (env-driven) |
| **Category Pages di Sitemap** | 5 entri baru (`/kategori` + 4 landing page) |
| **Audit Checks Baru** | Redirect manager, landing page kategori, verifikasi search engine |

### Redirect Manager
```
CMS → Tab SEO & AI Settings → Redirect Manager
```
- Tambah rule: URL sumber → URL tujuan + status code
- Wildcard: `/produk-lama/*` → `/catalog` (meneruskan sisa path)
- Validasi: duplikat ditolak (409), rule invalid ditolak (400)
- Preview: tool "Uji Redirect" mengecek apakah sebuah path akan di-redirect
- Diterapkan di `src/middleware.ts` (edge runtime, cache 60 detik per instance)
- Audit trail: `SEO_REDIRECT_CREATED` / `SEO_REDIRECT_DELETED`

### Landing Page Kategori
| URL | Target search |
|---|---|
| `/kategori/kain-sportswear` | "kain sportswear sublimasi", "kain jersey jakarta" |
| `/kategori/kain-hijab-fashion` | "kain voal ultrafine", "kain satin polyester" |
| `/kategori/kain-home-living` | "kain canvas sublimasi", "kain tirai sublimasi" |
| `/kategori/kain-merchandise` | "kain banner sublimasi", "kain flag printing" |

Tiap halaman berisi: intro, 4 keunggulan, grid produk (SSR), 3 blok panduan
teknis, 3 FAQ, CTA. Dilirik dari katalog, footer, dan sitemap.

### Verifikasi Search Console
```env
GOOGLE_SITE_VERIFICATION="<dari Search Console>"
BING_SITE_VERIFICATION="<dari Bing Webmaster Tools>"
YANDEX_SITE_VERIFICATION="..."
PINTEREST_SITE_VERIFICATION="..."
FACEBOOK_DOMAIN_VERIFICATION="..."
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"
```
Tag dipasang otomatis di `<head>` setiap halaman (server-rendered).

---

## 📊 Ringkasan Hasil

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Metadata per halaman | 0 (cuma global, ditulis via JS) | 7 halaman + produk dinamis (server-side) |
| Canonical URL | 0 | Semua halaman publik |
| JSON-LD Schema | 1 (Organization) | 9 tipe: WebSite, LocalBusiness, Manufacturer, WholesaleStore, Product, AggregateOffer, FAQPage, BreadcrumbList, WebPage, ItemList, ContactPage, Service |
| Konten produk di HTML awal | Kosong (skeleton) | SSR lengkap (nama, harga, GSM, lebar, tier harga) |
| Breadcrumb | 0 | 5 halaman + schema |
| `llms.txt` | Tidak ada | `/llms.txt` + `/llms-full.txt` |
| AI Plugin Manifest | Tidak ada | `/.well-known/ai-plugin.json` + OpenAPI |
| AI crawler di robots.txt | 4 | 20 |
| Sitemap | 6 statis | Dinamis + produk + kategori + `<image:image>` |
| Heading hierarchy | h1 → h4 (skip) | h1 → h2 → h3 konsisten |
| Gambar | `<img>` polos | `next/image` (AVIF/WebP) + alt deskriptif |
| Halaman auth di-index | Ya (duplikat) | `noindex, nofollow` |
| SEO Health Score | — | **100 / Grade A** |

---

## 🗂️ File Penting

### Library & Infrastruktur
| File | Fungsi |
|---|---|
| `src/lib/seo-metadata.ts` | Builder `Metadata` + pembangun JSON-LD (semua schema.org) |
| `src/lib/storefront-data.ts` | Data fetching sisi server (produk, FAQ, hero, testimoni) |
| `src/lib/sanitize.ts` | Sanitizer HTML anti-XSS (whitelist tag) |
| `src/components/common/JsonLd.tsx` | Suntik JSON-LD statis ke HTML |
| `src/components/common/Breadcrumb.tsx` | Breadcrumb navigasi (UI + sumber data schema) |
| `src/components/common/ModuleDisabledNotice.tsx` | Tampilan modul nonaktif (SSR) |
| `src/components/common/SeoHealthPanel.tsx` | Panel audit SEO di dashboard CMS |

### Route AI & SEO
| Route | Isi |
|---|---|
| `/llms.txt` | Ringkasan terstruktur situs (standar llmstxt.org) |
| `/llms-full.txt` | Dokumentasi lengkap: profil, katalog + harga, layanan, FAQ |
| `/sitemap.xml` | Sitemap XML dengan `<image:image>` per produk |
| `/robots.txt` | Rules + allowlist 20 AI crawler |
| `/manifest.webmanifest` | PWA manifest (brand + shortcuts) |
| `/.well-known/ai-plugin.json` | Manifest AI Plugin (OpenAI/Bing ecosystem) |
| `/.well-known/ai-plugin-openapi.yaml` | OpenAPI spec endpoint katalog |
| `/api/seo/audit` | API health check (skor + temuan + saran perbaikan) |

### Halaman yang Di-Upgrade ke Server Component
```
src/app/(storefront)/page.tsx                    → SSR + WebSite/LocalBusiness/FAQPage
src/app/(storefront)/catalog/page.tsx            → SSR + BreadcrumbList/ItemList
src/app/(storefront)/catalog/[slug]/page.tsx     → SSR + Product/AggregateOffer + produk terkait
src/app/(storefront)/about/page.tsx              → SSR + AboutPage/LocalBusiness
src/app/(storefront)/contact/page.tsx            → SSR + ContactPage
src/app/(storefront)/custom-sublimation/page.tsx→ SSR + Service/FAQPage
src/app/(storefront)/track-order/page.tsx        → noindex
src/app/(storefront)/cart|checkout/page.tsx      → noindex
src/app/(auth)/layout.tsx                        → noindex global area auth
```

---

## 🧩 Schema.org yang Digunakan

| Schema | Halaman | Manfaat |
|---|---|---|
| `WebSite` + `SearchAction` | Global | Sitelinks searchbox di Google |
| `LocalBusiness` / `Manufacturer` / `WholesaleStore` | Global, About, Contact | Knowledge panel, jam operasional, koordinat |
| `Product` + `AggregateOffer` | Detail produk | Harga & ketersediaan di hasil pencarian |
| `FAQPage` | Home, Custom Sublimasi | "People Also Ask" |
| `BreadcrumbList` | Katalog, Produk, About, Contact | Jalur navigasi di SERP |
| `WebPage` | Semua halaman publik | Deskripsi entitas halaman |
| `ItemList` | Katalog | Struktur daftar produk |
| `ContactPage` | Contact | Entitas halaman kontak |
| `Service` | Custom Sublimasi | Layanan yang ditawarkan |

---

## 🔧 Cara Kerja

### 1. Metadata Server-Side
```tsx
// src/app/(storefront)/catalog/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getStorefrontProductBySlug(params.slug);
  return buildPageMetadata({
    path: `/catalog/${product.slug}`,
    title: `${product.name.slice(0, 40)} — Kain Sublimasi | Texora`,
    description: htmlToPlainText(product.description, 0),
    image: product.thumbnailUrl,
    schemaType: "product",
  });
}
```
`buildPageMetadata()` otomatis menghasilkan: title (≤62 char), description
(≤160 char, dipotong di batas kata), canonical, robots, OG, Twitter Card,
geo tags, dan keywords gabungan.

### 2. Konten SSR (anti "content hidden" untuk crawler)
```tsx
export default async function CatalogPage() {
  const products = await getStorefrontProducts();   // query Prisma langsung
  return <CatalogClient initialFabrics={products} />;
}
```
Client component tetap interaktif, tapi data sudah ada di HTML awal → tidak ada
skeleton, tidak ada CLS, dan crawler langsung membaca isi katalog.

### 3. Visibilitas Modul (satu sumber data)
Status aktif/nonaktif modul disimpan di `seo.pages[path].enabled` (tab SEO).
Efeknya otomatis di semua tempat:
- Navbar menyembunyikan menu
- Server component menampilkan "Halaman sedang tidak tersedia"
- `SeoHead` menambah `robots: noindex, nofollow`
- Sitemap & llms.txt mengecualikannya
- Modul aktif kembali → semua kembali normal

Kontrol: **CMS → Tab Halaman → Visibilitas Modul** (hanya Administrator).

---

## 📋 Checklist SEO (yang sudah diimplementasikan)

**Metadata**
- [x] Title unik per halaman (≤62 char)
- [x] Meta description unik (≤160 char)
- [x] Canonical URL absolut
- [x] Open Graph + Twitter Card per halaman
- [x] Geo tags (region, placename, position, ICBM)
- [x] `metadataBase` untuk URL absolut
- [x] Template title & `title.absolute` (hindari dobel suffix)

**Indexed & Crawl**
- [x] `robots: noindex` untuk halaman auth, cart, checkout, track-order
- [x] `robots.txt` memblokir area privat
- [x] Sitemap dinamis + `lastModified` dari DB
- [x] `lastmod` akurat (bukan `now()`)
- [x] Halaman kategori untuk long-tail search
- [x] `host` directive di robots.txt

**Structured Data**
- [x] JSON-LD statis di HTML awal (bukan `afterInteractive`)
- [x] Product + AggregateOffer + priceSpecification
- [x] FAQPage, BreadcrumbList, ItemList, WebPage, ContactPage, Service
- [x] `sameAs` profil media sosial
- [x] `openingHoursSpecification` & `areaServed`

**AI-Readiness**
- [x] `/llms.txt` (ringkasan) & `/llms-full.txt` (dokumentasi penuh)
- [x] 20 AI crawler diizinkan (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
      Claude-User, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User,
      Google-Extended, Applebot-Extended, meta-externalagent, FacebookBot, CCBot,
      Bytespider, Amazonbot, cohere-ai, Diffbot, MistralAI-User, YouBot)
- [x] AI Plugin manifest + OpenAPI spec
- [x] Excerpt per halaman (bahan kutipan AI)
- [x] Semantic HTML + heading hierarchy
- [x] Konten utama tersedia tanpa JS

**Technical**
- [x] `next/image` (AVIF/WebP, sizes, priority untuk LCP)
- [x] `remotePatterns` (ganti `domains` deprecated)
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- [x] `next/image` + `loading="lazy"` untuk gambar non-critical
- [x] Link katalog footer → halaman produk spesifik (internal linking)
- [x] Produk terkait di halaman detail (internal linking mesh)
- [x] PWA manifest

---

## 🧪 Testing

```bash
npm run test:sanitize   # 34 test anti-XSS sanitizer
npm run test:seo        # 250 test SEO (metadata, schema, heading, semantik, 12 halaman)
npm run test:redirects  # 7 test Redirect Manager
npm run test:smoke      # test login, 2FA, backup
npm run test:2fa        # test alur 2FA lengkap
npm run test:all        # semua test
```

Audit SEO juga bisa dijalankan manual:
```bash
node scripts/seo-audit.mjs
```

---

## 🎛️ Utilitas CLI

```bash
# Toggle status modul
node scripts/toggle-module.cjs /custom-sublimation false
node scripts/toggle-module.cjs /custom-sublimation true

# Set tipe schema halaman
node scripts/set-schema.cjs / faq

# Backup manual (untuk Windows Task Scheduler / cron)
npm run backup:manual
```

---

## 🚀 Rekomendasi Lanjutan (Next Step)

1. **Google Search Console** — daftarkan sitemap, pantau Core Web Vitals &Coverage.
2. **Google Business Profile** — daftarkan sebagai manufaktur (LocalBusiness sudah siap).
3. **Bing Webmaster Tools** — import sitemap + submit IndexNow.
4. **Schema Markup Validator** — validasi JSON-LD di search.google.com/schema.
5. **Monitoring berkala** — jalankan `npm run test:seo` setiap minggu setelah update konten.
6. **Backlink & PR** — daftarkan di direktori industri tekstil Indonesia.
7. **Content expansion** — tambah halaman kategori & panduan (panduan memilih GSM, panduan
   artwork, dsb) untuk menangkap long-tail search.

---

## 📌 Catatan Produksi

```env
NEXT_PUBLIC_SITE_URL="https://texora.co.id"   # WAJIB diset di produksi
BACKUP_AUTO_ENABLED="true"
CRON_SECRET="<random-string-minimal-32-karakter>"
JWT_2FA_SECRET="<random-string-minimal-32-karakter>"
```

- `NEXT_PUBLIC_SITE_URL` menentukan canonical, sitemap, OG image, dan llms.txt.
  **Jangan lupa diubah** saat deploy (default masih `https://texora.co.id`).
- Backup otomatis berjalan tiap 24 jam (retensi 14 file). Endpoint
  `/api/cron/backup` bisa dipicu cron eksternal dengan header `x-cron-secret`.
- `backups/` sudah masuk `.gitignore` (jangan di-commit).
