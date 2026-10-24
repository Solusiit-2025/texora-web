/**
 * Daftar poster popup storefront.
 *
 * Sengaja STATIS (bukan scan folder saat runtime) supaya tetap bekerja di
 * hosting serverless seperti Vercel/Netlify, di mana folder `public` tidak
 * selalu ada di filesystem function.
 *
 * Cara menambah/mengganti poster:
 *  1. Taruh file di `public/images/promo/`.
 *  2. Daftarkan path-nya di array ini (urutan = urutan slide).
 *  3. Jika mengganti file dengan NAMA SAMA, ubah PROMO_POSTER_VERSION agar
 *     cache optimizer gambar tidak menyajikan versi lama.
 */
export const PROMO_POSTERS: Array<{ src: string; alt: string }> = [
  {
    src: "/images/promo/grand-opening-raya-2026.jpg",
    alt: "Grand Opening Showroom Tour XoraMateria — Raya Ready Deals",
  },
  {
    src: "/images/promo/price-list-raya-2026.jpg",
    alt: "Price List & Panduan Ukuran Pashmina dan Khimar XoraMateria",
  },
];

/** Naikkan nilai ini setiap mengganti isi file poster. */
export const PROMO_POSTER_VERSION = "2026-10-24-a";
