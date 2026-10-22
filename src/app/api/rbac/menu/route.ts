import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  getMenuAccessMap,
  listRoles,
  saveMenuAccessMap,
} from "@/lib/rbac/menu-store";
import { prisma } from "@/lib/prisma";
import {
  ALL_MENU_ITEM_IDS,
  DEFAULT_ROLE_MENU,
  PORTAL_MENU_GROUPS,
  resolveMenuItems,
} from "@/config/portal-menu";

export const dynamic = "force-dynamic";

/**
 * GET /api/rbac/menu?scope=me  -> menu yang boleh diakses oleh pengguna aktif
 * GET /api/rbac/menu             -> registry + peta hak akses (khusus ADMINISTRATOR)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    // ---------------------------------------------------------------
    // Mode publik (dipakai middleware edge untuk guarding route portal):
    // hanya mengembalikan ID menu milik satu role. Tidak ada data sensitif
    // (nama/deskripsi menu tidak ditampilkan), dan di-cache CDN 60 detik.
    // ---------------------------------------------------------------
    const params = req.nextUrl.searchParams;
    if (params.get("public") === "1") {
      const role = params.get("role");
      if (!role) {
        return NextResponse.json(
          { success: false, error: "Parameter role wajib diisi." },
          { status: 400 }
        );
      }
      const map = await getMenuAccessMap();
      const menuIds = map[role] ?? [];
      return NextResponse.json(
        { success: true, data: { role, menuIds } },
        {
          headers: {
            "Cache-Control":
              "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const scope = req.nextUrl.searchParams.get("scope");
    const map = await getMenuAccessMap();

    if (scope === "me") {
      const allowedIds = map[user.role] ?? [];
      const allowedSet = new Set(allowedIds);

      const groups = PORTAL_MENU_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => allowedSet.has(item.id)),
      })).filter((group) => group.items.length > 0);

      return NextResponse.json({
        success: true,
        data: {
          role: user.role,
          menuIds: allowedIds,
          groups,
          items: resolveMenuItems(allowedIds),
        },
      });
    }

    if (user.role !== "ADMINISTRATOR") {
      const allowedIds = map[user.role] ?? [];
      if (!allowedIds.includes("users-rbac")) {
        return NextResponse.json(
          {
            success: false,
            error: "Hanya Administrator yang dapat melihat konfigurasi hak akses.",
          },
          { status: 403 }
        );
      }
    }

    const roleList = await listRoles();

    // Default per role: kunci terkunci = semua menu, sisanya default saat dibuat
    const defaults: Record<string, string[]> = {};
    for (const r of roleList) {
      defaults[r.role] = r.locked
        ? [...ALL_MENU_ITEM_IDS]
        : (r.defaultMenuIds ?? DEFAULT_ROLE_MENU[r.role] ?? []);
    }

    return NextResponse.json({
      success: true,
      data: {
        groups: PORTAL_MENU_GROUPS,
        roles: roleList,
        defaults,
        map,
      },
    });
  } catch (error) {
    console.error("[rbac] Gagal memuat konfigurasi menu:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat konfigurasi menu." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rbac/menu
 * Body: { map: { SALES_REP: ["crm.leads", ...], ... } }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya Administrator yang dapat mengubah hak akses menu.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const incomingMap = body?.map ?? body;

    if (!incomingMap || typeof incomingMap !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload peta hak akses tidak valid." },
        { status: 400 }
      );
    }

    const saved = await saveMenuAccessMap(incomingMap);

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_ROLE_MENU_ACCESS",
          userId: user.id,
          description: `Administrator memperbarui hak akses menu portal: ${Object.entries(
            saved
          )
            .map(([role, ids]) => `${role}=${ids.length}`)
            .join(", ")}`,
        },
      });
    } catch {
      // Audit log bersifat best-effort
    }

    return NextResponse.json({
      success: true,
      message: "Hak akses menu berhasil disimpan.",
      data: { map: saved },
    });
  } catch (error) {
    console.error("[rbac] Gagal menyimpan konfigurasi menu:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan konfigurasi menu." },
      { status: 500 }
    );
  }
}
