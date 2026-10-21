import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ALL_MENU_ITEM_IDS,
  BASE_ROLE_DEFINITIONS,
  DEFAULT_ROLE_MENU,
  RoleDefinition,
  sanitizeMenuMap,
} from "@/config/portal-menu";
import { CUSTOM_ROLES_KEY, MENU_ACCESS_SETTING_KEY, USER_ROLE_KEY } from "./keys";

/** Kunci role bawaan = kolom enum Prisma `User.role`. */
export const SYSTEM_ROLE_KEYS: string[] = BASE_ROLE_DEFINITIONS.map((r) => r.role);

const VALID_TONES = ["rose", "emerald", "amber", "sky", "violet", "cyan"];

function readJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readSetting(
  key: string,
  fallback: string | null = null
): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch (error) {
    console.warn(`[rbac] Gagal membaca setting ${key}:`, error);
    return fallback;
  }
}

async function writeSetting(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

function isValidCustomRole(def: unknown): def is RoleDefinition {
  if (!def || typeof def !== "object") return false;
  const d = def as Record<string, unknown>;

  if (typeof d.role !== "string" || !d.role.trim()) return false;
  if (SYSTEM_ROLE_KEYS.includes(d.role)) return false;
  if (typeof d.label !== "string" || !d.label.trim()) return false;
  if (d.system === true) return false;
  if (d.locked === true) return false;

  return true;
}

function normalizeCustomRole(def: RoleDefinition): RoleDefinition {
  const short =
    typeof def.shortLabel === "string" && def.shortLabel.trim()
      ? def.shortLabel.trim().slice(0, 4).toUpperCase()
      : def.label.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "ROL";

  return {
    role: def.role,
    label: def.label,
    shortLabel: short,
    description:
      typeof def.description === "string" ? def.description : "",
    locked: false,
    tone: (VALID_TONES.includes(def.tone as string) ? def.tone : "violet") as RoleDefinition["tone"],
    system: false,
    defaultRoute:
      typeof def.defaultRoute === "string" && def.defaultRoute.startsWith("/")
        ? def.defaultRoute
        : "/portal/dashboard",
    defaultMenuIds: Array.isArray(def.defaultMenuIds)
      ? def.defaultMenuIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" && ALL_MENU_ITEM_IDS.includes(id)
        )
      : [],
  };
}

/**
 * Daftar role lengkap: bawaan sistem + role custom dari database.
 */
export async function getRoleDefinitions(): Promise<RoleDefinition[]> {
  const raw = await readSetting(CUSTOM_ROLES_KEY, "[]");
  const parsed = readJson<unknown[]>(raw, []);

  const custom = (Array.isArray(parsed) ? parsed : [])
    .filter(isValidCustomRole)
    .map(normalizeCustomRole);

  return [...BASE_ROLE_DEFINITIONS, ...custom];
}

/**
 * Cari satu role berdasarkan kunci (bawaan maupun custom).
 */
export async function getRoleDefinitionById(
  roleId?: string | null
): Promise<RoleDefinition | undefined> {
  if (!roleId) return undefined;
  const roles = await getRoleDefinitions();
  return roles.find((r) => r.role === roleId);
}

/**
 * Peta override peran pengguna: { userId: roleKey }.
 * Diperlukan agar role custom tidak perlu mengubah enum `Role` di Prisma.
 */
export async function getUserRoleOverrides(): Promise<Record<string, string>> {
  const raw = await readSetting(USER_ROLE_KEY, "{}");
  const parsed = readJson<Record<string, unknown>>(raw, {});

  const result: Record<string, string> = {};
  if (parsed && typeof parsed === "object") {
    for (const [userId, roleId] of Object.entries(parsed)) {
      if (typeof roleId === "string" && userId) result[userId] = roleId;
    }
  }
  return result;
}

/**
 * Peran efektif pengguna: override role custom > kolom enum Prisma.
 */
export async function resolveUserRoleId(
  userId: string | null | undefined,
  dbRole: string
): Promise<string> {
  if (!userId) return dbRole;

  try {
    const overrides = await getUserRoleOverrides();
    const override = overrides[userId];
    if (!override) return dbRole;

    const exists = (await getRoleDefinitions()).some((r) => r.role === override);
    return exists ? override : dbRole;
  } catch {
    return dbRole;
  }
}

/**
 * Simpan daftar role custom (tanpa menyentuh field `system`).
 */
export async function saveCustomRoles(custom: RoleDefinition[]): Promise<void> {
  await writeSetting(CUSTOM_ROLES_KEY, JSON.stringify(custom));
}

/**
 * Tambah role baru. Mengembalikan definisi role yang tersimpan.
 */
export async function createCustomRole(input: {
  label: string;
  shortLabel?: string;
  description?: string;
  tone?: RoleDefinition["tone"];
  defaultRoute?: string;
  defaultMenuIds?: string[];
}): Promise<{ role: RoleDefinition; roles: RoleDefinition[] }> {
  const roles = await getRoleDefinitions();
  const customRoles = roles.filter((r) => !r.system);

  let baseKey = (input.label || "role")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);

  if (!baseKey) baseKey = "role";

  let roleKey = baseKey.toUpperCase();
  let counter = 2;
  const taken = new Set(roles.map((r) => r.role));
  while (taken.has(roleKey)) {
    roleKey = `${baseKey}_${counter}`.toUpperCase();
    counter += 1;
  }

  const created = normalizeCustomRole({
    role: roleKey,
    label: input.label,
    shortLabel: input.shortLabel || "",
    description: input.description || "",
    locked: false,
    tone: input.tone || "violet",
    system: false,
    defaultRoute: input.defaultRoute || "/portal/dashboard",
    defaultMenuIds: input.defaultMenuIds || [],
  });

  await saveCustomRoles([...customRoles, created]);

  // Inisialisasi entri peta hak akses menu
  try {
    const menuRaw = await readSetting(MENU_ACCESS_SETTING_KEY, "{}");
    const menuMap = readJson<Record<string, unknown>>(menuRaw, {});
    menuMap[created.role] = created.defaultMenuIds ?? [];
    await writeSetting(MENU_ACCESS_SETTING_KEY, JSON.stringify(menuMap));
  } catch (error) {
    console.warn("[rbac] Gagal menginisialisasi peta menu role baru:", error);
  }

  return { role: created, roles: await getRoleDefinitions() };
}

/**
 * Hapus role custom. Override peran pengguna menuju role ini ikut dibersihkan
 * sehingga pengguna jatuh kembali ke peran dasar mereka.
 */
export async function deleteCustomRole(roleKey: string): Promise<{ roles: RoleDefinition[] }> {
  if (SYSTEM_ROLE_KEYS.includes(roleKey)) {
    throw new Error("Peran bawaan sistem tidak dapat dihapus.");
  }

  const roles = await getRoleDefinitions();
  const customRoles = roles.filter((r) => !r.system && r.role !== roleKey);
  await saveCustomRoles(customRoles);

  // Bersihkan dari peta hak akses menu
  try {
    const menuRaw = await readSetting(MENU_ACCESS_SETTING_KEY, "{}");
    const menuMap = readJson<Record<string, unknown>>(menuRaw, {});
    delete menuMap[roleKey];
    await writeSetting(
      "rbac.menu_access",
      JSON.stringify(sanitizeMenuMap(menuMap, await getRoleDefinitions()))
    );
  } catch (error) {
    console.warn("[rbac] Gagal membersihkan peta menu role terhapus:", error);
  }

  // Bersihkan override pengguna ke role ini
  try {
    const overrides = await getUserRoleOverrides();
    const cleaned = Object.entries(overrides).filter(([, v]) => v !== roleKey);
    if (cleaned.length !== Object.keys(overrides).length) {
      await writeSetting(USER_ROLE_KEY, JSON.stringify(Object.fromEntries(cleaned)));
    }
  } catch (error) {
    console.warn("[rbac] Gagal membersihkan override peran:", error);
  }

  return { roles: await getRoleDefinitions() };
}

/**
 * Tetapkan peran untuk satu pengguna.
 * - Role bawaan: ditulis juga ke kolom enum `User.role`.
 * - Role custom: hanya disimpan sebagai override (tanpa migrasi DB).
 */
export async function assignUserRole(
  userId: string,
  roleId: string,
  dbRole?: string | null
): Promise<void> {
  const roles = await getRoleDefinitions();
  const exists = roles.some((r) => r.role === roleId);

  if (!exists) {
    throw new Error("Peran tidak ditemukan.");
  }

  if (SYSTEM_ROLE_KEYS.includes(roleId)) {
    // Role bawaan: kolom enum Prisma menjadi sumber kebenaran, override dibersihkan
    await prisma.user.update({
      where: { id: userId },
      data: { role: roleId as Role },
    });
    await clearUserRoleOverride(userId);
    return;
  }

  // Role custom: disimpan sebagai override agar tidak perlu migrasi enum DB
  const overrides = await getUserRoleOverrides();
  overrides[userId] = roleId;
  await writeSetting(USER_ROLE_KEY, JSON.stringify(overrides));
}

/**
 * Hapus override pengguna (kembali ke peran dasar kolom `role`).
 */
export async function clearUserRoleOverride(userId: string): Promise<void> {
  const overrides = await getUserRoleOverrides();
  if (!(userId in overrides)) return;
  delete overrides[userId];
  await writeSetting(USER_ROLE_KEY, JSON.stringify(overrides));
}

export function getDefaultMenuIds(role: RoleDefinition): string[] {
  return (
    role.defaultMenuIds ??
    DEFAULT_ROLE_MENU[role.role] ??
    (role.locked ? [...ALL_MENU_ITEM_IDS] : [])
  );
}
