import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  createCustomRole,
  deleteCustomRole,
  getRoleDefinitions,
} from "@/lib/rbac/role-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/rbac/roles -> daftar role (bawaan + custom)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const roles = await getRoleDefinitions();

    return NextResponse.json({
      success: true,
      data: { roles },
    });
  } catch (error) {
    console.error("[rbac] Gagal memuat daftar role:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar role." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac/roles -> buat role baru (ADMINISTRATOR)
 */
export async function POST(req: NextRequest) {
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
        { success: false, error: "Hanya Administrator yang dapat menambah peran." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const label = String(body?.label || "").trim();
    const shortLabel = String(body?.shortLabel || "").trim();
    const description = String(body?.description || "").trim();
    const tone = String(body?.tone || "violet");
    const defaultRoute = String(body?.defaultRoute || "/portal/dashboard");
    const preset = String(body?.preset || "empty");
    const copyFrom = String(body?.copyFrom || "");

    if (label.length < 3 || label.length > 60) {
      return NextResponse.json(
        { success: false, error: "Nama role minimal 3 dan maksimal 60 karakter." },
        { status: 400 }
      );
    }

    const roles = await getRoleDefinitions();

    let defaultMenuIds: string[] = [];

    if (preset === "all") {
      defaultMenuIds = roles.find((r) => r.role === "ADMINISTRATOR")?.defaultMenuIds ?? [];
    } else if (preset === "copy" && copyFrom) {
      const source = roles.find((r) => r.role === copyFrom);
      defaultMenuIds = source?.defaultMenuIds ?? [];
    } else if (preset === "dashboard") {
      defaultMenuIds = ["dashboard"];
    }

    if (
      !defaultRoute.startsWith("/") ||
      defaultRoute.startsWith("//") ||
      defaultRoute.length > 120
    ) {
      return NextResponse.json(
        { success: false, error: "Halaman awal tidak valid." },
        { status: 400 }
      );
    }

    const { role, roles: updated } = await createCustomRole({
      label,
      shortLabel,
      description,
      tone: tone as never,
      defaultRoute,
      defaultMenuIds,
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_CUSTOM_ROLE",
          userId: user.id,
          description: `Administrator membuat role baru "${role.label}" (${role.role}) dengan ${defaultMenuIds.length} menu awal.`,
        },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: true,
      message: `Role "${role.label}" berhasil dibuat.`,
      data: { role, roles: updated },
    });
  } catch (error: any) {
    console.error("[rbac] Gagal membuat role:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Gagal membuat role baru.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rbac/roles  body: { role }
 */
export async function DELETE(req: NextRequest) {
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
        { success: false, error: "Hanya Administrator yang dapat menghapus peran." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const roleKey = String(body?.role || "");

    if (!roleKey) {
      return NextResponse.json(
        { success: false, error: "Role yang akan dihapus tidak ditentukan." },
        { status: 400 }
      );
    }

    const { roles: updated } = await deleteCustomRole(roleKey);

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_CUSTOM_ROLE",
          userId: user.id,
          description: `Administrator menghapus role ${roleKey}. Pengguna dengan role ini kembali ke peran dasarnya.`,
        },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: true,
      message: `Role ${roleKey} dihapus.`,
      data: { roles: updated },
    });
  } catch (error: any) {
    console.error("[rbac] Gagal menghapus role:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghapus role." },
      { status: 400 }
    );
  }
}
