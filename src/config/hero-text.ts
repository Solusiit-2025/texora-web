/**
 * Teks hero homepage yang bisa dikelola dari CMS.
 *
 * Disimpan sebagai SATU baris `SiteContent` (key `homepage.hero`) berisi JSON,
 * mengikuti pola yang sudah dipakai `homepage.stats` dan `homepage.cta_b2b`.
 * Dengan begitu:
 *  - marketing bisa mengubah copy hero tanpa deploy ulang,
 *  - pipeline terjemahan AI (`SITE_CONTENT_JSON_FIELDS` di content-translator.ts)
 *    otomatis menerjemahkan ke 5 bahasa lain,
 *  - storefront tetap aman karena `DEFAULT_HERO_TEXT` dipakai sebagai fallback
 *    kalau baris database belum ada / value kosong.
 *
 * PENTING: judul hero sengaja dipecah 3 bagian (title1/2/3) karena `title2`
 * dirender dengan styling `animated-gradient-text` di HomeClient.tsx.
 */

export const HERO_TEXT_KEY = "homepage.hero";

export interface HeroText {
  /** Badge kecil di kiri atas, mis. "Pabrik". */
  badge: string;
  /** Eyebrow/lokasi, mis. "Jakarta Utara · Sublimasi Industri". */
  eyebrow: string;
  /** Baris 1 judul. */
  title1: string;
  /** Baris 2 judul — satu-satunya bagian dengan efek gradient animasi. */
  title2: string;
  /** Baris 3 judul. */
  title3: string;
  /** Paragraf pengantar di bawah judul. */
  lead: string;
  /** Tiga poin keunggulan singkat. */
  badge1: string;
  badge2: string;
  badge3: string;
  /** Label tombol utama. */
  ctaPrint: string;
  /** Label tombol sekunder. */
  ctaCatalog: string;
}

/** Field yang ikut diterjemahkan otomatis oleh AI (urutan = urutan form). */
export const HERO_TEXT_FIELDS = [
  "badge",
  "eyebrow",
  "title1",
  "title2",
  "title3",
  "lead",
  "badge1",
  "badge2",
  "badge3",
  "ctaPrint",
  "ctaCatalog",
] as const;

/**
 * Nilai bawaan — sengaja identik dengan kamus i18n Bahasa Indonesia supaya
 * tidak ada perubahan tampilan saat fitur ini pertama kali aktif.
 */
export const DEFAULT_HERO_TEXT: HeroText = {
  badge: "Pabrik",
  eyebrow: "Jakarta Utara · Sublimasi Industri",
  title1: "Warna yang menyatu",
  title2: "dengan serat,",
  title3: "bukan sekadar menempel.",
  lead: "XoraMateria memproduksi kain poliester siap sublimasi dan jasa cetak skala roll untuk brand sportswear, busana muslim, dan merchandise — dengan harga bertingkat dan proofing sebelum mesin berjalan.",
  badge1: "Proofing digital gratis",
  badge2: "Min. order fleksibel",
  badge3: "Termin 30/60 hari",
  ctaPrint: "Mulai cetak motif",
  ctaCatalog: "Lihat katalog kain",
};

/** Metadata form CMS: label, hint, dan apakah memakai textarea. */
export const HERO_TEXT_FIELD_META: Array<{
  key: keyof HeroText;
  label: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}> = [
  { key: "badge", label: "Badge kecil", hint: "Teks pada pill kecil di atas eyebrow. Contoh: Pabrik" },
  {
    key: "eyebrow",
    label: "Eyebrow / lokasi",
    hint: "Baris kapital di bawah badge. Contoh: Jakarta Utara · Sublimasi Industri",
  },
  { key: "title1", label: "Judul — baris 1", hint: "Baris pertama headline." },
  {
    key: "title2",
    label: "Judul — baris 2 (gradient)",
    hint: "Baris kedua headline. Bagian ini otomatis diberi efek gradien animasi.",
  },
  { key: "title3", label: "Judul — baris 3", hint: "Baris ketiga headline." },
  {
    key: "lead",
    label: "Paragraf pengantar",
    hint: "Deskripsi singkat di bawah judul (maks. disarankan 2–3 baris).",
    multiline: true,
    rows: 4,
  },
  { key: "badge1", label: "Poin keunggulan #1", hint: "Contoh: Proofing digital gratis" },
  { key: "badge2", label: "Poin keunggulan #2", hint: "Contoh: Min. order fleksibel" },
  { key: "badge3", label: "Poin keunggulan #3", hint: "Contoh: Termin 30/60 hari" },
  { key: "ctaPrint", label: "Tombol utama", hint: "Label tombol yang mengarah ke studio sublimasi." },
  {
    key: "ctaCatalog",
    label: "Tombol sekunder",
    hint: "Label tombol yang mengarah ke katalog kain.",
  },
];

/**
 * Gabungkan value dari database dengan default. Field yang kosong / tidak
 * valid otomatis memakai default supaya hero tidak pernah tampil bolong.
 */
export function normalizeHeroText(value: unknown): HeroText {
  const source =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const out = { ...DEFAULT_HERO_TEXT };

  for (const key of HERO_TEXT_FIELDS) {
    const raw = source[key];
    if (typeof raw === "string" && raw.trim().length > 0) {
      out[key] = raw;
    }
  }

  return out;
}
