/**
 * Sumber tunggal domain publik situs.
 *
 * Nilai diambil dari `NEXT_PUBLIC_SITE_URL`; kalau kosong, fallback memakai
 * domain produksi yang benar (`https://xoramateria.com`) supaya sitemap,
 * robots.txt, llms.txt, manifest, dan JSON-LD tidak pernah menunjuk domain
 * lama lagi.
 *
 * CATATAN PENTING: variabel `NEXT_PUBLIC_*` di-inline saat BUILD. Setelah
 * mengubah `NEXT_PUBLIC_SITE_URL` di `.env`, jalankan `npm run build` ulang
 * (restart PM2 saja tidak cukup).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://xoramateria.com"
).replace(/\/+$/, "");

/** Host tanpa skema, mis. untuk teks tampilan ("xoramateria.com"). */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
