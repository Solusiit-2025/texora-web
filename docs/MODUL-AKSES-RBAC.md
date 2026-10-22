# Visibilitas Modul & Akses Menu Portal — PT. Texora Visi Prima

Cara mengatur modul mana yang **aktif** untuk tim, tanpa mengubah kode.
Cocok untuk mode website **"Web Publish + CMS"** (website publik + CMS saja).

---

## 1. Dua lapis kontrol

| Lapis | Kelola di | Efek |
|---|---|---|
| **A. Modul halaman website** | Tab **SEO & AI Settings** → status "Aktif" per halaman | Halaman nonaktif → **404** (tidak ter-index, tidak bisa dibuka) + link menu hilang |
| **B. Modul portal** | Tab **Role & Menu Management** | Menu portal disembunyikan + **akses URL langsung ditutup** (redirect `/unauthorized`) |

Keduanya tersimpan di `SystemSetting` dan langsung berlaku tanpa deploy.

---

## 2. Lapis A — halaman website

Tab **CMS Konten → SEO & AI Settings** (atau menu "Pengaturan Modul"):

| Path | Nama |
|---|---|
| `/` | Homepage |
| `/catalog` | Katalog Kain |
| `/kategori/*` | Landing kategori |
| `/about` | Tentang Kami |
| `/contact` | Hubungi Kami |
| `/custom-sublimation` | Studio Kustom Sublimasi |
| `/request-quote` | Minta Penawaran |
| `/track-order` | Lacak Pesanan |
| `/artikel` | Pusat Panduan Tekstil |

### Perilaku setelah dimatikan
- Halaman balas **HTTP 404** (bukan 200) → Google menghaNFT-nya, bukan mengindeks
- Konten **tidak pernah dirender** di HTML (aman untuk crawler & AI crawler)
- Link menu di navbar/footer **hilang** (SSR, jadi tidak ada "flash" saat load)
- Versi bahasa lain (`/en/custom-sublimation`) juga tertutup
- Halaman 404-nya punya `robots: noindex, follow` + tombol kembali ke beranda/katalog

>Bug lama: halaman nonaktif masih balas **200** dengan konten lengkap — hanya
> menu-nya yang disembunyikan (client-side). Sekarang diblokir di **server**
> lewat `notFound()` di layout storefront.

---

## 3. Lapis B — modul portal

**Role & Menu Management** (`/portal/settings/users-rbac`):

- Pilih peran → centang/matikan menu per grup (tombol "Aktifkan/Nonaktifkan Semua")
- Menu yang dimatikan juga **menutup akses URL langsung** (tidak bisa accessed
  dengan mengetik URL)
- Sumber kebenaran untuk guard route: **peta menu fresh dari DB** (di-cache 60
  detik), bukan klaim di JWT → perubahan berlaku maksimal 1 menit, tidak perlu
  user login ulang

### Preset cepat (tombol baru)
| Preset | Isi | Cocok untuk |
|---|---|---|
| **Web Publish + CMS** | Dashboard, Katalog, CMS, Audit, Pengaturan, RBAC, **Pipeline Leads**, **Permintaan Penawaran** | Mode web publish + CMS (default yang disarankan) |
| **Publish + CMS + Sales** | Preset di atas + Database Pelanggan + Rekap Penjualan | Tim sales juga butuh data pelanggan |
| **Semua Modul** | Semua 20 menu aktif | Kembalikan seperti semula |

> **Jangan dimatikan:** *Pipeline Leads* dan *Permintaan Penawaran* — setiap form
> "Minta Penawaran" otomatis jadi Lead di pipeline sales. Kalau dimatikan, RFQ
> jadi mailbox tanpa follow-up.

Modul yang biasanya tidak dipakai untuk mode publish+CMS: OMS & Digital
Proofing, Finance, Purchasing, Gudang & Logistik, Social Listening, WhatsApp
Inbox, Webmail Sales, Rekap Penjualan.

---

## 4. Dampak ke performa website publik

**Hampir nol.** Modul portal tidak dieksekusi saat pengunjung membuka halaman
publik:

| Yang diukur | Nilai |
|---|---|
| Bundle JS portal | 712 KB (terpisah, tidak pernah dimuat halaman publik) |
| Query tabel portal dari halaman publik | **0** |
| Route portal | 22 route = 22 serverless function, tidak dieksekusi |
| Middleware | tanpa query DB (JWT verify + fetch rules yg di-cache CDN) |

Yang benar-benar memengaruhi kecepatan: cache aplikasi, jumlah query per
request, prefetch `<Link>`, dan lookup terjemahan per bahasa — semuanya sudah
di optimasi (lihat `docs/PERFORMANCE.md`).

---

## 5. Checklist verifikasi

```bash
# 1. Halaman nonaktif harus 404
curl -I http://localhost:3000/custom-sublimation      # -> 404
curl -I http://localhost:3000/en/track-order           # -> 404

# 2. Halaman aktif tetap 200
curl -I http://localhost:3000/catalog                   # -> 200

# 3. Menu portal ikut menyesuaikan (pakai akun admin)
curl -s http://localhost:3000/api/rbac/menu?scope=me -H "Cookie: ..." | jq '.data.menuIds'
```

Otomatis dicek oleh test suite:
- `npm run test:seo` → halaman nonaktif wajib 404
- `npm run test:browser` → halaman nonaktif dilewati (404 memang diharapkan)
