/**
 * Registry tab CMS (Content Management System).
 *
 * Dipakai oleh dua tempat sekaligus supaya tidak ada duplikasi:
 *  1. Submenu di sidebar portal (`src/app/portal/layout.tsx`)
 *  2. Tab bar horizontal di atas halaman CMS (`CmsTabBar`)
 */

export const CMS_TABS = [
  { key: "hero", label: "Hero Slider", hint: "Banner utama homepage" },
  { key: "hero-text", label: "Teks Hero", hint: "Judul & copy header homepage" },
  { key: "testimonials", label: "Testimoni", hint: "Ulasan mitra bisnis" },
  { key: "faqs", label: "FAQ", hint: "Pertanyaan umum" },
  { key: "content", label: "Statistik & Banner", hint: "Angka & CTA" },
  { key: "social", label: "Media Sosial", hint: "Tautan akun" },
  { key: "pricing", label: "Tarif & Jasa", hint: "Harga jasa cetak" },
  { key: "pages", label: "Halaman Statis", hint: "Teks halaman profil" },
  { key: "artikel", label: "Artikel", hint: "Pusat panduan tekstil" },
  { key: "seo", label: "SEO & AI", hint: "Metadata & crawler" },
  { key: "translations", label: "Terjemahan", hint: "6 bahasa" },
] as const;

export type CmsTabKey = (typeof CMS_TABS)[number]["key"];

export const CMS_TAB_KEYS: string[] = CMS_TABS.map((t) => t.key);

export function getCmsTab(key: string | null | undefined) {
  return CMS_TABS.find((t) => t.key === key) ?? null;
}
