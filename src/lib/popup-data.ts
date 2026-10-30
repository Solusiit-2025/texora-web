/**
 * Pengambilan data popup storefront di sisi SERVER.
 *
 * Sumber utama: baris SiteContent `storefront.popup` (dikelola dari CMS).
 * Fallback: daftar poster statis di `src/config/promo.ts` — dipakai saat
 * admin belum pernah menyimpan pengaturan popup (atau DB tidak terjangkau).
 */

import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { PROMO_POSTERS, PROMO_POSTER_VERSION } from "@/config/promo";
import {
  DEFAULT_POPUP_SETTINGS,
  POPUP_CONTENT_KEY,
  getLivePopupBanners,
  getPopupStorageKey,
  normalizePopupSettings,
  type PopupBanner,
  type PopupSettings,
} from "@/config/popup";

export interface StorefrontPopupData {
  settings: PopupSettings;
  banners: PopupBanner[];
  storageKey: string;
  /** true = memakai poster statis karena CMS belum diisi. */
  usingFallback: boolean;
}

function staticFallback(): StorefrontPopupData {
  const banners: PopupBanner[] = PROMO_POSTERS.map((poster, index) => ({
    id: `static-${index + 1}`,
    title: "",
    imageUrl: `${poster.src}?v=${PROMO_POSTER_VERSION}`,
    alt: poster.alt,
    linkUrl: "",
    ctaLabel: "",
    startAt: null,
    endAt: null,
    isActive: true,
    order: index + 1,
  }));

  const settings: PopupSettings = { ...DEFAULT_POPUP_SETTINGS, banners };
  return {
    settings,
    banners,
    storageKey: getPopupStorageKey(settings),
    usingFallback: true,
  };
}

export async function getStorefrontPopup(): Promise<StorefrontPopupData> {
  return cached(
    "storefront.popup",
    async () => {
      try {
        const row = await prisma.siteContent.findUnique({
          where: { key: POPUP_CONTENT_KEY },
        });
        if (row?.value) {
          const settings = normalizePopupSettings(JSON.parse(row.value));
          return {
            settings,
            banners: getLivePopupBanners(settings),
            storageKey: getPopupStorageKey(settings),
            usingFallback: false,
          };
        }
      } catch {
        /* DB belum siap / JSON rusak -> fallback statis */
      }
      return staticFallback();
    },
    { ttl: 60_000, stale: 600_000 }
  );
}
