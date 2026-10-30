/**
 * Konfigurasi Popup Banner Storefront (dikelola dari CMS).
 *
 * Semua pengaturan disimpan sebagai SATU baris `SiteContent` dengan key
 * `storefront.popup` (JSON). Pola ini sama dengan `homepage.stats`,
 * `homepage.cta_b2b`, dan `homepage.hero`, sehingga tidak perlu migrasi
 * database baru dan perubahan langsung tayang setelah disimpan.
 *
 * Bentuk data:
 * {
 *   enabled: boolean,          // master switch popup
 *   delaySeconds: number,      // jeda sebelum popup muncul
 *   frequencyDays: number,     // 0 = setiap kunjungan, 7 = sekali per 7 hari
 *   showOnMobile: boolean,     // tampil di layar < 640px
 *   banners: PopupBanner[]
 * }
 */

export const POPUP_CONTENT_KEY = "storefront.popup";

export interface PopupBanner {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  linkUrl: string;
  ctaLabel: string;
  /** ISO string atau null = langsung tayang. */
  startAt: string | null;
  /** ISO string atau null = tanpa batas akhir. */
  endAt: string | null;
  isActive: boolean;
  order: number;
  updatedAt?: string;
}

export interface PopupSettings {
  enabled: boolean;
  delaySeconds: number;
  frequencyDays: number;
  showOnMobile: boolean;
  banners: PopupBanner[];
  updatedAt?: string;
}

export const DEFAULT_POPUP_SETTINGS: PopupSettings = {
  enabled: true,
  delaySeconds: 1.5,
  frequencyDays: 7,
  showOnMobile: true,
  banners: [],
};

export type PopupBannerStatus = "live" | "scheduled" | "expired" | "inactive";

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function normalizePopupBanner(raw: any, index = 0): PopupBanner {
  const order = Number(raw?.order);
  return {
    id: normalizeString(raw?.id) || `promo-${index + 1}`,
    title: normalizeString(raw?.title),
    imageUrl: normalizeString(raw?.imageUrl || raw?.src),
    alt: normalizeString(raw?.alt),
    linkUrl: normalizeString(raw?.linkUrl || raw?.href),
    ctaLabel: normalizeString(raw?.ctaLabel),
    startAt: normalizeDate(raw?.startAt),
    endAt: normalizeDate(raw?.endAt),
    isActive: raw?.isActive !== false,
    order: Number.isFinite(order) ? order : index + 1,
    updatedAt: normalizeString(raw?.updatedAt) || undefined,
  };
}

export function normalizePopupSettings(raw: any): PopupSettings {
  const banners = Array.isArray(raw?.banners)
    ? raw.banners
        .map((banner: any, index: number) => normalizePopupBanner(banner, index))
        .filter((banner: PopupBanner) => Boolean(banner.imageUrl))
        .sort((a: PopupBanner, b: PopupBanner) => a.order - b.order)
    : [];

  return {
    enabled: raw?.enabled !== false,
    delaySeconds: clampNumber(raw?.delaySeconds, 0, 30, 1.5),
    frequencyDays: clampNumber(raw?.frequencyDays, 0, 365, 7),
    showOnMobile: raw?.showOnMobile !== false,
    banners,
    updatedAt: normalizeString(raw?.updatedAt) || undefined,
  };
}

export function isPopupBannerLive(banner: PopupBanner, now = Date.now()): boolean {
  if (!banner.isActive || !banner.imageUrl) return false;
  const start = banner.startAt ? new Date(banner.startAt).getTime() : 0;
  const end = banner.endAt ? new Date(banner.endAt).getTime() : Number.POSITIVE_INFINITY;
  return start <= now && end >= now;
}

export function getPopupBannerStatus(
  banner: PopupBanner,
  now = Date.now()
): PopupBannerStatus {
  if (!banner.isActive) return "inactive";
  const start = banner.startAt ? new Date(banner.startAt).getTime() : 0;
  const end = banner.endAt ? new Date(banner.endAt).getTime() : Number.POSITIVE_INFINITY;
  if (start > now) return "scheduled";
  if (end < now) return "expired";
  return "live";
}

export function getLivePopupBanners(settings: PopupSettings, now = Date.now()): PopupBanner[] {
  return settings.banners
    .filter((banner) => isPopupBannerLive(banner, now))
    .sort((a, b) => a.order - b.order);
}

/**
 * Kunci localStorage diturunkan dari isi kampanye. Saat admin mengganti
 * banner/jadwal, pengunjung lama otomatis melihat popup baru tanpa harus
 * menunggu 7 hari.
 */
export function getPopupStorageKey(settings: PopupSettings): string {
  const fingerprint = settings.banners
    .map(
      (banner) =>
        `${banner.id}:${banner.imageUrl}:${banner.startAt || ""}:${banner.endAt || ""}:${
          banner.isActive ? 1 : 0
        }`
    )
    .join("|");

  let hash = 5381;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = (hash * 33) ^ fingerprint.charCodeAt(i);
  }
  return `texora-welcome-popup-${(hash >>> 0).toString(36)}`;
}

/** Format tanggal untuk badge CMS (Bahasa Indonesia). */
export function formatPopupDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
