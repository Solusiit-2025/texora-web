import { cached } from "@/lib/cache";
import { getMenuIdsForRole } from "./menu-store";

/** Kunci role bawaan dengan akses penuh. */
export const SYSTEM_ADMIN_ROLE = "ADMINISTRATOR";

/**
 * Cek apakah sebuah role punya akses ke salah satu menu portal.
 *
 * Kenapa perlu helper ini:
 * RBAC mendukung role CUSTOM (mis. "ADMIN" — "Admin Web CMS") yang disimpan
 * sebagai override per user, bukan di kolom enum `User.role`. Akibatnya,
 * pengecekan lama `user.role !== "ADMINISTRATOR"` menolak admin custom
 * (403) walaupun di matriks menu mereka sudah diberi akses.
 *
 * Hak akses custom role diatur di `/portal/settings/users-rbac`
 * (`rbac.menu_access`), jadi helper ini membaca sumber yang sama.
 */
export async function hasMenuAccess(
  role: string | null | undefined,
  menuIds: string | string[]
): Promise<boolean> {
  if (!role) return false;
  if (role === SYSTEM_ADMIN_ROLE) return true;

  const wanted = Array.isArray(menuIds) ? menuIds : [menuIds];

  const granted = await cached(
    `rbac:menu:${role}`,
    () => getMenuIdsForRole(role),
    { ttl: 30_000, stale: 120_000 }
  );

  return wanted.some((id) => granted.includes(id));
}

/**
 * Admin konten = role bawaan Administrator ATAU role custom yang diberi
 * akses menu "CMS Konten Website" (`content`).
 *
 * Dipakai oleh endpoint CMS, SEO, dan terjemahan supaya role custom seperti
 * "ADMIN" bisa bekerja penuh tanpa harus mengubah enum Prisma.
 */
export function canManageContent(role: string | null | undefined): Promise<boolean> {
  return hasMenuAccess(role, ["content"]);
}

/** Admin katalog (menu "catalog"). */
export function canManageCatalog(role: string | null | undefined): Promise<boolean> {
  return hasMenuAccess(role, ["catalog"]);
}
