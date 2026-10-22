import { prisma } from "@/lib/prisma";
import {
  DEFAULT_ROLE_MENU,
  RoleDefinition,
  sanitizeMenuMap,
} from "@/config/portal-menu";
import { getRoleDefinitions } from "@/lib/rbac/role-store";
import { MENU_ACCESS_SETTING_KEY } from "@/lib/rbac/keys";
import { invalidateCache } from "@/lib/cache";

export { MENU_ACCESS_SETTING_KEY };

export type MenuAccessMap = Record<string, string[]>;

/**
 * Ambil peta hak akses menu per role dari database.
 * Jika record tidak ada atau database bermasalah, jatuh ke default sistem.
 */
export async function getMenuAccessMap(): Promise<MenuAccessMap> {
  try {
    const roles = await getRoleDefinitions();
    const row = await prisma.systemSetting.findUnique({
      where: { key: MENU_ACCESS_SETTING_KEY },
    });

    if (!row?.value) {
      return sanitizeMenuMap(DEFAULT_ROLE_MENU, roles);
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(row.value);
    } catch {
      parsed = null;
    }

    return sanitizeMenuMap(parsed as Record<string, unknown> | null, roles);
  } catch (error) {
    console.warn(
      "[rbac] Gagal membaca peta hak akses menu, memakai default:",
      error
    );
    return sanitizeMenuMap(DEFAULT_ROLE_MENU);
  }
}

/**
 * Simpan peta hak akses menu per role ke database.
 */
export async function saveMenuAccessMap(
  map: Record<string, unknown> | null | undefined
): Promise<MenuAccessMap> {
  const roles = await getRoleDefinitions();
  const sanitized = sanitizeMenuMap(map, roles);

  try {
    await prisma.systemSetting.upsert({
      where: { key: MENU_ACCESS_SETTING_KEY },
      create: {
        key: MENU_ACCESS_SETTING_KEY,
        value: JSON.stringify(sanitized),
      },
      update: {
        value: JSON.stringify(sanitized),
      },
    });
  } catch (error) {
    console.error("[rbac] Gagal menyimpan peta hak akses menu:", error);
    throw error;
  }

  // Buang cache otorisasi supaya perubahan hak akses langsung berlaku.
  invalidateCache("rbac:");

  return sanitized;
}

/**
 * Daftar id menu yang boleh diakses oleh sebuah role.
 */
export async function getMenuIdsForRole(
  role: string | null | undefined
): Promise<string[]> {
  const map = await getMenuAccessMap();
  if (!role) return [];
  return map[role] ?? [];
}

/**
 * Daftar role lengkap (bawaan + custom) - dipakai oleh API agar satu tempat saja.
 */
export async function listRoles(): Promise<RoleDefinition[]> {
  return getRoleDefinitions();
}
