/**
 * Metadata per halaman publik (title + description).
 *
 * Dipakai oleh:
 *  1. Halaman (`buildPageMetadata`) -> sumber tunggal agar title/description
 *     konsisten antara SSR & pre-translate (tidak ada duplikasi string).
 *  2. `translateAllContent()` -> pre-warm cache terjemahan untuk metadata
 *     setiap bahasa (agar halaman /en/ etc. langsung menampilkan title
 *     diterjemahkan, bukan Bahasa Indonesia).
 *
 * String ditulis dalam Bahasa Indonesia sebagai sumber kebenaran.
 */

export interface SeoPageMetaEntry {
  title: string;
  description: string;
}

export const SEO_PAGES: Record<string, SeoPageMetaEntry> = {
  "/": {
    title: "Pabrik Kain Sublimasi & Tekstil Industri | XoraMateria",
    description: "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain siap sublimasi, harga grosir bertingkat, visualizer motif kustom, dan portal B2B terintegrasi.",
  },
  "/catalog": {
    title: "Katalog Kain Sublimasi & Tekstil Industri | XoraMateria",
    description: "Katalog lengkap kain poliester siap sublimasi: Dryfit Milano, Voal Ultrafine, Canvas, Scuba, Oxford, dan lainnya. Spesifikasi GSM, lebar kain, harga grosir bertingkat, dan kontrol kualitas OEKO-TEX.",
  },
  "/about": {
    title: "Tentang Kami \u2014 Pabrik Sublimasi Jakarta | XoraMateria",
    description: "Profil XoraMateria: pabrik sublimasi dan manufaktur kain poliester di Tugu Utara, Jakarta Utara. Satu atap dari bahan mentah, proofing digital, hingga gulungan siap kargo untuk brand sportswear, hijab, dan merchandise.",
  },
  "/contact": {
    title: "Hubungi Kami \u2014 Konsultasi Kain Sublimasi B2B | XoraMateria",
    description: "Konsultasi pengadaan kain sublimasi B2B, permintaan sampel swatch gratis, dan penawaran harga grosir dari XoraMateria, Jakarta Utara. Tim sales membalas via WhatsApp dalam 1-2 jam kerja.",
  },
  "/custom-sublimation": {
    title: "Studio Kustom Sublimasi \u2014 Visualizer Motif | XoraMateria",
    description: "Unggah file desain, lihat simulasi cetak sublimasi 3D, dan hitung harga jasa desain custom. Mendukung resolusi 150\u2013300 DPI dengan proofing digital dan sampel cetak 1 yard. Pabrik sublimasi di Jakarta Utara.",
  },
};
