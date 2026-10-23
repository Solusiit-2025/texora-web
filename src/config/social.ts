/**
 * Central social media links for XoraMateria.
 *
 * SUMBER TUNGGAL default (fallback bila DB kosong / offline).
 * Nilai AKTIF dibaca dari database via SiteContent key "social.links"
 * (GET /api/social-links) — JANGAN hardcode URL di komponen.
 * Format https:// (bukan deep-link apps://) supaya di HP otomatis
 * membuka aplikasi TikTok/IG/FB/YT/LinkedIn, dan di desktop membuka browser.
 */

export type SocialId =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "youtube"
  | "whatsapp"
  | "linkedin";

export interface SocialLink {
  id: SocialId;
  label: string;
  href: string;
  /** Handle / nama akun untuk ditampilkan di UI (opsional) */
  handle?: string;
  /** Tampilkan di storefront */
  isActive?: boolean;
  order?: number;
}

export const SOCIAL_LINKS_KEY = "social.links";

/** Default resmi — dipakai sebagai fallback + seed awal DB. */
export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "tiktok",
    label: "TikTok Xora Materia",
    href: "https://www.tiktok.com/@xoramateria",
    handle: "@xoramateria",
    isActive: true,
    order: 1,
  },
  {
    id: "instagram",
    label: "Instagram Xora Hijab",
    href: "https://www.instagram.com/xora_hijab",
    handle: "@xora_hijab",
    isActive: true,
    order: 2,
  },
  {
    id: "facebook",
    label: "Facebook Xora Materia",
    href: "https://www.facebook.com/profile.php?id=61595062856326",
    handle: "Xora Materia",
    isActive: true,
    order: 3,
  },
  {
    id: "linkedin",
    label: "LinkedIn Xora Materia",
    href: "https://www.linkedin.com/in/xora-materia-9b7517440",
    handle: "xora-materia",
    isActive: true,
    order: 4,
  },
  {
    id: "youtube",
    label: "YouTube XoraMateria",
    href: "https://www.youtube.com/@xoramateriavisiprima",
    handle: "XoraMateria Official",
    isActive: true,
    order: 5,
  },
  {
    id: "whatsapp",
    label: "WhatsApp Sales",
    href: "https://wa.me/6285810646157?text=Halo%20XoraMateria%2C%20saya%20ingin%20bertanya%20tentang%20kain%20sublimasi.",
    handle: "+62 858-1064-6157",
    isActive: true,
    order: 6,
  },
];

/** Alias kompatibilitas — komponen lama mengimpor SOCIAL_LINKS. */
export const SOCIAL_LINKS: SocialLink[] = DEFAULT_SOCIAL_LINKS;

/** Normalisasi data DB -> bentuk SocialLink yang aman dirender. */
export function normalizeSocialLinks(input: unknown): SocialLink[] {
  if (!Array.isArray(input)) return DEFAULT_SOCIAL_LINKS;
  const byId = new Map(DEFAULT_SOCIAL_LINKS.map((s) => [s.id, s]));
  const out: SocialLink[] = [];
  for (const raw of input as any[]) {
    if (!raw || typeof raw.id !== "string" || !byId.has(raw.id as SocialId))
      continue;
    const def = byId.get(raw.id as SocialId)!;
    const href =
      typeof raw.href === "string" && raw.href.trim() ? raw.href.trim() : def.href;
    out.push({
      id: raw.id as SocialId,
      label: typeof raw.label === "string" && raw.label ? raw.label : def.label,
      href,
      handle: typeof raw.handle === "string" && raw.handle ? raw.handle : def.handle,
      isActive: raw.isActive === false ? false : true,
      order: typeof raw.order === "number" ? raw.order : def.order,
    });
  }
  // Tambahkan default yang belum ada di DB (mis. linkedin baru)
  for (const def of DEFAULT_SOCIAL_LINKS) {
    if (!out.some((s) => s.id === def.id)) out.push(def);
  }
  return out
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
