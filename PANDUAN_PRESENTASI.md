# Panduan Demo & Presentasi — PT. Texora Visi Prima

> Panduan cepat untuk demo ke customer. Baca ini sebelum meeting biar tidak lupa alur & poin penting.

---

## 1. Cara Menjalankan

```bash
npm run dev
```

Lalu buka: **http://localhost:3000**

> ⚠️ Jangan jalankan `npm run build` bersamaan dengan `npm run dev` — keduanya memakai folder `.next` yang sama dan akan bentrok (muncul error "Cannot find module"). Untuk demo cukup `npm run dev`.

---

## 2. Alur Demo yang Disarankan

### A. Storefront (halaman publik — tunjukkan ke customer)

1. **Landing page (`/`)** — hero slider, marquee, alur produksi sublimasi 4 tahap, katalog kain, kalkulator harga bertingkat, testimoni, FAQ, CTA B2B.
2. **Tentang Kami (`/about`)** — profil, kapasitas pabrik, mesin, sertifikasi Oeko-Tex, industri yang dilayani.
3. **Katalog Kain (`/catalog`)** — filter, cari, detail kain + spesifikasi & harga tier.
4. **Kustom Sublimasi (`/custom-sublimation`)** — visualizer motif, upload artwork, cek DPI, kalkulasi biaya.
5. **Keranjang (`/cart`)** → **Checkout (`/checkout`)** — alur 4 langkah (data pembeli → kargo → pembayaran → SPK terbit).
6. **Lacak Pesanan (`/track-order`)** — timeline status produksi 6 tahap.
7. **Konsultasi B2B (`/contact`)** — form inquiry + info pabrik.

### B. Portal Internal (tunjukkan via role switcher di navbar)

Buka **"Portal CRM & OMS"** (tombol di navbar) atau pakai dropdown **role switcher**:

1. **Dashboard** — KPI omzet, antrean produksi, pipeline CRM.
2. **CRM → Social Listening & Prospek** — analisa sentimen komentar + AI reply + **tombol Balas** + Jadikan Lead.
3. **CRM → Pipeline Leads** — kanban prospek (geser antar tahap).
4. **CRM → Database Pelanggan 360°** — **klik pelanggan** untuk lihat detail lengkap (profil, riwayat order, timeline interaksi, dokumen).
5. **CRM → Rekap Penjualan & Sales Order** — KPI + chart tren omzet + breakdown + tabel SO.
6. **OMS** — antrean pesanan/SPK, approval proofing, faktur CoreTax.
7. **Warehouse** — stok roll barcode, pemotongan & ekspedisi.

---

## 3. CATATAN PENTING (jangan lupa)

### Fitur "Balas" di Social Media
- Tiap komentar punya tombol **"Balas"** → muncul **dialog** berisi:
  - komentar netizen (konteks),
  - **balasan rekomendasi AI yang bisa diedit**,
  - tombol **"Kirim Balasan"**.
- Setelah klik "Kirim Balasan" → status berubah jadi **"Terkirim ✓"** + muncul toast.
- **Ini SIMULASI.** Belum terhubung API platform asli. Jelaskan dengan tenang kalau ditanya:
  - **Instagram & Facebook**: BISA balas langsung via **Meta Graph API** (butuh akun bisnis + izin `instagram_manage_comments`).
  - **TikTok**: API balas komentar **terbatas** (akses partner khusus) — biasanya pakai deep-link ke aplikasi TikTok.
  - Sekarang AI Reply (Gemini) juga masih pakai **data statis** karena `GEMINI_API_KEY` belum diisi.

### Semua data masih SAMPLE / MOCK
- Angka omzet, pelanggan, order, komentar — semua **data contoh**, bukan data produksi asli.
- Kalau customer tanya: "ini tampilan & alurnya, data tinggal dihubungkan ke database asli."

### Akun / data demo
- Login mock: `admin@texora.co.id` (role Administrator), atau pakai role switcher tanpa login.
- Sales rep di semua data contoh: **Rian Pratama**.

### Data mengalir (sudah berfungsi)
- Pilih kain di **Kustom Sublimasi** → masuk **Keranjang** → **Checkout** → nomor SPK generate otomatis → bisa **dilacak** di Track Order. (Sudah konsisten, tidak berubah-ubah.)

### Responsif
- Semua halaman sudah **fullwidth** dan **responsif** (mobile/tablet). Bisa ditunjukkan dengan resize jendela / buka di HP.

---

## 4. Poin Jualan yang Bisa Ditekankan

- **Visualizer sublimasi** = fitur unggulan (customer lihat motif di kain + tahu harga tanpa telepon).
- **Harga bertingkat (tier pricing)** = transparan, makin banyak makin murah per meter.
- **Digital proofing** sebelum produksi massal (persetujuan SPK).
- **Satu platform terintegrasi**: E-commerce + CRM + OMS + Warehouse + Social Listening + Rekap Penjualan.
