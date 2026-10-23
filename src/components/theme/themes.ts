export type ThemeId = "xora" | "brass" | "emerald" | "sapphire" | "crimson";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  /** Swatch dot color shown in the dropdown (500 shade of the theme). */
  swatch: string;
}

// v2: brand refresh — tema Xora Blue menjadi default. Key lama sengaja
// tidak dipakai lagi agar pengunjung existing melihat identitas baru.
export const STORAGE_KEY = "texora-theme-v2";

export const DEFAULT_THEME: ThemeId = "xora";

export const THEMES: ThemeDef[] = [
  {
    id: "xora",
    label: "Xora Blue",
    description: "Xora Blue, Soft Blue, Sage & Warm Gold",
    swatch: "#4F6B8D",
  },
  {
    id: "brass",
    label: "Antique Brass",
    description: "Identitas default PRD V3",
    swatch: "#C29B38",
  },
  {
    id: "emerald",
    label: "Factory Emerald",
    description: "Hijau manufaktur modern",
    swatch: "#10B981",
  },
  {
    id: "sapphire",
    label: "Industrial Sapphire",
    description: "Biru korporat B2B",
    swatch: "#3B82F6",
  },
  {
    id: "crimson",
    label: "Crimson Weave",
    description: "Merah marun berani",
    swatch: "#F43F5E",
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}
