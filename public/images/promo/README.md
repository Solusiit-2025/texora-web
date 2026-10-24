# Poster Popup Storefront

Letakkan file poster di folder ini. Popup akan otomatis menampilkannya
sebagai carousel (maksimal **4 file**).

## Penamaan file (disarankan)

| Urutan | Pola nama | Contoh |
|---|---|---|
| 1 | mengandung `grand opening` | `grand-opening-raya-2026.jpg` |
| 2 | mengandung `price list` | `price-list-raya-2026.jpg` |
| 3+ | nama lain (urut alfabet) | `poster-tambahan.jpg` |

Urutan tampil: file dengan "grand opening" → "price list" → sisanya (A–Z).

## Format yang didukung

`.jpg`, `.jpeg`, `.png`, `.webp` (disarankan JPG/WebP, lebar ±900–1080 px,
rasio portrait 9:16, ukuran < 500 KB agar cepat).

## Cara pakai

1. Salin file ke folder ini.
2. Dev: otomatis terbaca (tidak perlu restart).
3. Produksi: commit + push, lalu deploy seperti biasa.

## Catatan

- Popup tampil **sekali per 7 hari** per browser (localStorage).
- Untuk mengetes paksa: buka `/?popup=1` (tanpa mengubah data pengunjung).
- Mode `?preview=1` / `?fresh=1` tidak menampilkan popup.
- Jika folder ini kosong, popup memakai versi teks (fallback) yang tetap rapi.
