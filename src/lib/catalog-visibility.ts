import { getSetting, setSetting } from "@/lib/settings";

/**
 * VISIBILITAS HARGA KATALOG (terpusat)
 *
 * Toggle "Sembunyikan Harga" di portal catalog-management menyimpan status
 * di SystemSetting (database) — bukan localStorage — sehingga berlaku untuk
 * SEMUA orang: admin portal maupun pengunjung storefront.
 *
 * Key: "catalog.hide_prices" → "1" (sembunyi) / "0" (tampil)
 */

export const CATALOG_HIDE_PRICE_KEY = "catalog.hide_prices";

export async function isPriceHidden(): Promise<boolean> {
  try {
    return (await getSetting(CATALOG_HIDE_PRICE_KEY, "0")) === "1";
  } catch {
    return false;
  }
}

export async function setPriceHidden(value: boolean): Promise<void> {
  await setSetting(CATALOG_HIDE_PRICE_KEY, value ? "1" : "0");
}

/** Hapus field harga dari produk storefront (SSR ditolak menyajikan harga). */
export function stripProductPrices<T extends { basePricePerMeter?: number | null; priceTiers?: unknown[] }>(
  products: T[]
): T[] {
  return products.map((p) => ({
    ...p,
    basePricePerMeter: 0,
    priceTiers: [],
  }));
}
