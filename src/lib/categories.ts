import { prisma } from "@/lib/prisma";

/**
 * MASTER KATEGORI KAIN
 *
 * Kategori bersifat dinamis — dikelola lewat tabel `Category` di database:
 *  1. Admin dapat menambah dan menghapus kategori secara bebas.
 *  2. Anti-duplikat: "Sportswear" vs "sportswear" vs "Sportswears" divalidasi.
 *  3. Aman: Kategori yang masih dipakai oleh produk tidak bisa dihapus tanpa
 *     memindahkan produk tersebut terlebih dahulu.
 */

export const DEFAULT_CATEGORIES = [
  "Sportswear",
  "Fashion & Hijab",
  "Merchandise & Flag",
  "Home Living",
];

export interface CategoryDetail {
  id: string;
  name: string;
  productCount: number;
  createdAt?: string;
}

/** Inisialisasi awal ke tabel `master_categories` jika tabel masih kosong */
export async function ensureDefaultCategories(): Promise<void> {
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      const used = await prisma.fabricProduct.findMany({
        select: { category: true },
        distinct: ["category"],
      });
      const initial = Array.from(
        new Set([
          ...DEFAULT_CATEGORIES,
          ...used.map((u) => u.category).filter(Boolean),
        ])
      );
      await prisma.category.createMany({
        data: initial.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }
  } catch {
    // Database tidak terjangkau / mode offline
  }
}

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

/** Ambil seluruh daftar nama kategori dinamis dari database */
export async function allCategories(): Promise<string[]> {
  try {
    await ensureDefaultCategories();
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
    if (rows.length > 0) {
      return rows.map((r) => r.name);
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_CATEGORIES];
}

/** Alias untuk allCategories() */
export const getCategories = allCategories;

/** Ambil detail kategori beserta jumlah kain/produk yang menggunakannya */
export async function getCategoriesWithDetails(): Promise<CategoryDetail[]> {
  try {
    await ensureDefaultCategories();
    const [rows, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.fabricProduct.findMany({ select: { category: true } }),
    ]);

    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }

    if (rows.length === 0) {
      return DEFAULT_CATEGORIES.map((name, i) => ({
        id: `default-${i}`,
        name,
        productCount: counts[name] || 0,
      }));
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      productCount: counts[r.name] || 0,
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
    }));
  } catch {
    return DEFAULT_CATEGORIES.map((name, i) => ({
      id: `default-${i}`,
      name,
      productCount: 0,
    }));
  }
}

/** Hapus kategori dari database (dicek ke produk aktif) */
export async function deleteCategory(nameOrId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: nameOrId }, { name: nameOrId }],
      },
    });

    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan." };
    }

    const count = await prisma.fabricProduct.count({
      where: { category: category.name },
    });

    if (count > 0) {
      return {
        success: false,
        error: `Kategori "${category.name}" masih digunakan oleh ${count} kain di katalog. Silakan ubah kategori kain tersebut terlebih dahulu sebelum menghapus.`,
      };
    }

    await prisma.category.delete({
      where: { id: category.id },
    });

    return { success: true };
  } catch (err) {
    console.error("[categories] Gagal menghapus kategori:", err);
    return { success: false, error: "Gagal menghapus kategori dari database." };
  }
}
