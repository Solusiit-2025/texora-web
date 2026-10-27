# Upload Gambar / PDF Gagal di Produksi (413 Nginx)

Dokumen ini mencatat penyebab dan perbaikan masalah "upload gambar di portal
tidak muncul di preview" pada deployment produksi (`xoramateria.com`).

## Gejala

- Upload gambar dari portal (catalog-management, artikel) tidak memunculkan
  preview. Kadang hanya muncul pesan generik "Gagal mengunggah (periksa
  koneksi/sesi)".
- File kecil (< 1 MB) berhasil, file ≥ 1 MB selalu gagal walau masih di bawah
  batas 5 MB milik aplikasi.
- Upload katalog PDF (batas aplikasi 30 MB) juga selalu gagal.

## Penyebab 1 — Nginx `client_max_body_size` masih default 1 MB

VPS produksi memakai Nginx sistem (`nginx/1.28.3 Ubuntu`), bukan container
Docker. Konfigurasi Nginx VPS **tidak** memuat `client_max_body_size`, sehingga
memakai default **1 MB**. Request yang lebih besar dipotong di level Nginx dan
dibalas halaman HTML:

```
413 Request Entity Too Large
nginx/1.28.3 (Ubuntu)
```

Karena balasannya HTML (bukan JSON), kode klien lama gagal `res.json()` dan
menampilkan pesan generik — admin tidak tahu bahwa penyebabnya batas Nginx.
Batas 5 MB di `/api/upload` dan 30 MB di `/api/catalog/upload` tidak pernah
terpakai karena request sudah ditolak lebih dulu.

Verifikasi cepat (dari komputer lokal):

```bash
# siapkan file 2 MB
head -c 2000000 /dev/urandom > /tmp/probe.bin

# harapan setelah diperbaiki: 401 (belum login) — bukan 413
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST -H "Origin: https://xoramateria.com" \
  -F "file=@/tmp/probe.bin;type=image/png" \
  https://xoramateria.com/api/upload
```

## Perbaikan 1 — Naikkan limit body di Nginx VPS

```bash
# 1. cari file konfigurasi server block
grep -rn "server_name" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/
# contoh: /etc/nginx/sites-enabled/xoramateria.com

# 2. edit, lalu tambahkan baris berikut DI DALAM blok `server { ... }`
sudo nano /etc/nginx/sites-enabled/xoramateria.com
#    client_max_body_size 25M;

# 3. uji konfigurasi & reload (tanpa downtime)
sudo nginx -t && sudo systemctl reload nginx
```

Catatan:

- `25M` cukup untuk gambar dan katalog PDF. Samakan dengan batas aplikasi
  (gambar 5 MB, katalog PDF 30 MB) bila ingin longgar — mis. `35M`.
- Kalau ada Cloudflare di depan (seperti sekarang), batas Cloudflare free plan
  adalah 100 MB per request, jadi bukan penghalang.
- `client_max_body_size` harus berada di dalam `server { }` (atau `http { }`
  untuk semua situs).

## Penyebab 2 — File baru di `public/` tidak disajikan Next.js produksi

Di `next start`, Next.js memindai isi folder `public/` **sekali saat boot** dan
menyimpannya sebagai daftar statis. File yang ditulis setelah server berjalan
(hasil upload) tidak ada di daftar itu, sehingga `/uploads/<file-baru>` dibalas
**404** walau file-nya ada di disk — gambar tetap tidak tampil di preview.
Di `next dev` masalah ini tidak terlihat karena dev memeriksa disk tiap request.

Perbaikan: route handler `src/app/uploads/[...path]/route.ts` menyajikan file
dari `public/uploads` langsung dari disk per request, jadi:

- Upload baru langsung tampil tanpa restart/redeploy.
- URL lama `/uploads/...` yang sudah tersimpan di database tetap valid.
- Katalog PDF di `/uploads/catalog/...` ikut terlayani.

## Perbaikan 3 — Kompresi di browser + pesan error yang jelas

`src/lib/upload-client.ts`:

- `shrinkImageForUpload()` mengecilkan gambar > 900 KB di browser (sisi
  terpanjang maks. 1920 px, WebP kualitas bertahap) sebelum dikirim. Jadi
  gambar besar tetap berhasil walau limit proxy belum dinaikkan.
- `uploadImageFile()` menerjemahkan respons non-JSON/413/401/403 menjadi pesan
  Indonesia yang spesifik, bukan "periksa koneksi/sesi".

Dipakai oleh: `portal/catalog-management`, `portal/content-management`
(ArticleManager), dan komponen `ImageUpload`.

Catatan: kompresi browser tidak berlaku untuk katalog PDF — file PDF tetap
butuh perbaikan Nginx di atas.
