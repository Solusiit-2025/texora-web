import { prisma } from "@/lib/prisma";

/**
 * MASTER KATEGORI KAIN
 *
 * Kategori bukan lagi free-text — dikelola lewat tabel `Category` supaya:
 *  1. Dropdown di portal selalu konsisten (tidak muncul kategori liar).
 *  2. Anti-duplikat: "Sportswear" vs "Sportswear" vs "Sportswears" ditolak.
 *
 * Helper ini dipakai oleh /api/categories (GET/POST).
 */

export const DEFAULT_CATEGORIES = [
  "Sportswear",
  "Fashion & Hijab",
  "Merchandise & Flag",
  "Home Living",
];

/** Kunci perbandingan: huruf kecil, hanya alfanumerik → "Fashion & Hijab" = "fashion hijab" */
export function categoryKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Kunci bentuk jamak: buang akhiran "s"/"es" → "sportswears" = "sportswear" */
export function pluralKey(name: string): string {
  return categoryKey(name).replace(/(es|s)$/, "");
}

/** Cek kemiripan dua nama kategori (include kunci jamak). */
export function isSimilarCategory(a: string, b: string): boolean {
  return categoryKey(a) === categoryKey(b) || pluralKey(a) === pluralKey(b);
}

/** Gabungan kategori dari tabel master + yang sudah terpakai di produk + default. */
export async function allCategories(): Promise<string[]> {
  const [rows, used] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.fabricProduct.findMany({
      select: { category: true },
      distinct: ["category"],
    }),
  ]);
  const set = new Set<string>([
    ...DEFAULT_CATEGORIES,
    ...rows.map((r) => r.name),
    ...used.map((u) => u.category).filter(Boolean),
  ]);
  return Array.from(set)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "id"));
}
