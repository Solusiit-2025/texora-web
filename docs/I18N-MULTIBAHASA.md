# 🌍 Multi-Bahasa (i18n) — Texora Visi Prima

Situs kini melayani pengunjung dalam **6 bahasa**:

| Kode | Bahasa | Catatan |
|---|---|---|
| `id` | Bahasa Indonesia | **Default & kanonik** (yang dilihat Google/AI crawler) |
| `en` | English | |
| `zh` | 简体中文 | |
| `ja` | 日本語 | |
| `de` | Deutsch | |
| `ar` | العربية | Otomatis **RTL** (`dir="rtl"`) |

---

## 🧠 Arsitektur: 2 Lapis

### Lapis 1 — UI Chrome (kamus statis)
Teks antarmuka yang di-hardcode di kode (navbar, tombol, label filter, heading
section, footer) diterjemahkan dari **kamus statis**:
- `src/lib/i18n/dictionary.ts` — ±70 kunci × 6 bahasa
- `src/lib/i18n/LanguageContext.tsx` — provider + hook `useI18n()` (`t()`, `locale`, `<T>`)
- `src/components/i18n/LanguageSwitcher.tsx` — dropdown 🌐 di navbar (desktop & mobile)

Preferensi disimpan di `localStorage` + cookie `texora-locale`; `<html lang>` dan
`<html dir>` ikut berubah.

### Lapis 2 — Konten CMS/Database (Cache-First + AI CMS / Manual)
Konten yang dikelola dari dashboard (FAQ, hero slide, testimoni, deskripsi
produk, teks About, tarif layanan) disimpan di tabel database `content_translations`.

```
Pengunjung Web (Storefront / SSR / Client):
   └→ MURNI membaca dari cache database (100% cepat, $0, TANPA kena limit AI).
   └→ Jika belum ada cache -> fallback ke bahasa Indonesia secara aman.

Admin Portal / CMS (http://localhost:3000/portal/content-management?tab=translations):
   ├─ Terjemahkan Semua Konten (AI massal di latar belakang)
   ├─ Terjemahkan Per-Baris (AI per item yang dipilih)
   ├─ Edit Terjemahan Langsung di CMS
   └─ Tambah Terjemahan Manual (+ Tambah Manual)
```

- Engine: `src/lib/content-translator.ts`
- Tabel cache: `content_translations` (unik per `entity + entityId + field + locale`,
  menyimpan `source` untuk deteksi basi otomatis)
- AI Engine: Mendukung **9Router AI Gateway** (OpenAI-compatible) dan **Google Gemini SDK**.

---

## ⚙️ Konfigurasi AI Provider (Gemini / 9Router)

Anda dapat memilih menggunakan **9Router** atau **Google Gemini**:

### Opsi A: 9Router AI Gateway (Sangat Direkomendasikan jika Gemini Limit)
9Router adalah AI gateway lokal/cloud yang kompatibel dengan protokol OpenAI, memiliki auto-fallback 3-tier, dan hemat kuota:
```env
NINEROUTER_API_KEY="sk-9router-..."
# Default endpoint lokal 9Router:
NINEROUTER_BASE_URL="http://localhost:20128/v1/chat/completions"
# Model yang dipanggil via 9Router:
NINEROUTER_MODEL="google/gemini-2.5-flash"
```

### Opsi B: Google Gemini SDK Langsung
```env
GEMINI_API_KEY="AIza..."
GEMINI_MIN_CALL_GAP_MS="5000"
```

*Catatan:* Jika `NINEROUTER_API_KEY` diisi, sistem otomatis memprioritaskan 9Router.


---

## 🧪 Testing

```bash
npm run test:i18n          # 16 tes browser: switch 6 bahasa, RTL, persistensi
npm run test:content-i18n  # 11 tes jalur cache API: hit/miss/stale/fallback
npm run test:locale-urls   # 22 tes Tahap 2: SSR per bahasa, hreflang, sitemap
npm run test:seo           # 250 tes SEO (memastikan kanonik Indonesia tidak berubah)
npm run test:all
```

---

## 🌍 Tahap 2 — URL per bahasa + hreflang (SUDAH TERPASANG ✅)

Situs kini menyediakan **URL berprefik bahasa** agar Google dapat mengindeks
konten terjemahan di negaranya masing-masing:

```
texora.co.id/           → Bahasa Indonesia (default + x-default)
texora.co.id/en         → English        · /en/catalog · /en/about ...
texora.co.id/zh         → 简体中文
texora.co.id/ja         → 日本語
texora.co.id/de         → Deutsch
texora.co.id/ar         → العربية (RTL)
```

**Mekanisme:**
- **Middleware** (`src/middleware.ts`) deteksi prefix `/en|zh|ja|de|ar/` →
  rewrite ke path asli + kirim header `x-locale`. Halaman privat/noindex
  (`login`, `register`, `cart`, `checkout`, `track-order`, `portal`,
  `customer`) TIDAK dilokalkan (prefix tsb 404 alami).
- **Server component** baca `x-locale` (via `src/lib/server-locale.ts`) →
  chrome UI + metadata + konten DB dirender dalam bahasa tsb saat SSR.
- **`<html lang/dir>`** ikut diset server-side (sinyal bahasa untuk Google).
- **hreflang**: tiap halaman indexable menulis `<link rel="alternate"
  hreflang="...">` utk 5 bahasa + `x-default` (lewat `alternates.languages`).
- **Sitemap** menulis `<xhtml:link rel="alternate" hreflang="...">` per varian.
- **Switcher** kini navigasi ke URL berprefik bahasa (bukan hanya cookie).

**Keamanan SEO:** URL non-prefik selalu Indonesia (yang dilihat Googlebot
tanpa cookie), URL berprefik = versi bahasa tsb; `canonical` + hreflang
saling menunjuk benar → tidak ada duplikasi antar-bahasa.

---

## 🛠️ Tahap 3 — Panel Admin Terjemahan (SUDAH TERPASANG ✅)

**Lokasi:** `/portal/content-management?tab=translations` (submenu sidebar → *Terjemahan*)

Fitur:
- **Status AI** — menampilkan apakah `GEMINI_API_KEY` terisi & jumlah cache per bahasa.
- **Terjemahkan Semua Konten** — menerjemahkan seluruh konten (produk, FAQ, hero,
  testimoni, metadata halaman, konten kategori, statistik, tarif) ke 5 bahasa.
- **Perbaiki Terjemahan Bermasalah** — membersihkan baris cache yang gagal
  (terjemahan == sumber) lalu dibuat ulang.
- **Override manual** — edit teks terjemahan per baris, simpan, atau hapus cache
  (otomatis diterjemahkan ulang saat diminta).
- **Job background** — proses berjalan di background (tidak memblokir UI),
  progres dipantau via polling, dan **otomatis melanjutkan** bila kuota
  Gemini free tier habis.

**Pre-translate otomatis:** setiap kali admin menyimpan konten (hero, testimoni,
FAQ, produk, tarif), teks langsung dijadwalkan diterjemahkan ke 5 bahasa di
background (fire-and-forget) — tidak menambah waktu tunggu simpan.

### CatatanKuota Gemini (penting)
Free tier `gemini-2.5-flash` = **20 request/menit**. Implementasi ini:
- mengirim **1 batch per bahasa** (semua teks digabung, dipecah 40/batch)
  → hanya ~5 panggilan per bahasa, bukan satu per field;
-erialize dengan jeda minimal (`GEMINI_MIN_CALL_GAP_MS`, default 5 detik);
- menghormati `retryDelay` dari server (jika kuota habis, job menunggu
  ~40 menit lalu **otomatis melanjutkan**);
- hasil yang gagal (terjemahan == sumber) **tidak dicache**, sehingga
  otomatis dicoba lagi di request berikutnya.

### Endpoint API
| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/i18n/translations` | daftar cache + statistik per bahasa |
| `GET` | `/api/i18n/translations?job=1` | status job background |
| `POST` | `/api/i18n/translations` `{action:"translate-all"\|"repair"}` | mulai/stop proses |
| `PUT` | `/api/i18n/translations` | override manual 1 baris |
| `DELETE` | `/api/i18n/translations?id=` | hapus cache (diterjemahkan ulang) |

### ⚙️ Provider AI: 9Router (disarankan) atau Gemini langsung

| Provider | Env | Catatan |
|---|---|---|
| **9Router** (gateway lokal) | `NINEROUTER_API_KEY` + `NINEROUTER_BASE_URL` | Otomatis fallback 3-tier antar provider → **tidak dead-end saat satu provider kena kuota** |
| **Gemini langsung** | `GEMINI_API_KEY` (format `AIza...`) | Kuota free tier 20 request/menit |

Kode **mendeteksi otomatis**: kalau `GEMINI_API_KEY` berisi key berformat 9Router
(`AQ.Ab...`, bukan `AIza...`), permintaan otomatis dialihkan ke 9Router. Jadi
setting cukup satu key.

### 🛡️ Kalau kuota habis, web tetap normal

| Skenario | Dampak ke website |
|---|---|
| `GEMINI_API_KEY` kosong | Tidak ada panggilan API. Semua konten tampil Bahasa Indonesia (canonical). |
| Provider kena 429 / kuota habis | **Cooldown aktif** → request berikutnya tidak memanggil API, langsung pakai teks asli. Halaman tetap 200 & cepat. |
| Render halaman (on-demand) | **Tidak pernah memanggil AI** — hanya membaca cache DB (0ms latency). Kuota tidak terkuras traffic. |
| Job terjemahan background | Menunggu kuota pulih (bisa di-retry otomatis 40 menit), lalu melanjutkan. |

Jadi: **kuota habis ≠ website mati.** Yang affected cuma isi multibahasa (fallback ke Indonesia) sampai kuota pulih.

### 📐 Arsitektur saat ini

```
Halaman /de/about
   └→ server baca tabel content_translations (cache)   ← TIDAK panggil AI
        ├─ ada & source masih sama  -> tampil terjemahan
        └─ tidak ada / source berubah -> tampil teks asli (Indonesia)
                 └─ (isi dibuat oleh: job background / tombol "Terjemahkan" / pre-translate saat simpan)
```

Dengan begitu:
- Kuota AI **tidak** terkuras oleh pengunjung (hanya oleh admin saat trigger).
- Halaman selalu cepat (tidak ada latency AI).
- Konten **konsisten** antar pengunjung (semua lihat hasil terjemahan yang sama).

### Testing
```bash
npm run test:translations  # 9 tes: stats, override, filter, delete, job status
```

---

## 🔜 Lanjutan yang Masih Mungkin (Tahap 4)

- Halaman Statistik Terjemahan (cakupan per bahasa: berapa % konten yang sudah
  diterjemahkan).
- Ekspor terjemahan ke CSV untuk review offline atau penerjemah manusia.
