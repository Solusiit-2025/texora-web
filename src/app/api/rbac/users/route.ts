import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoleDefinitions, getUserRoleOverrides, assignUserRole, clearUserRoleOverride } from "@/lib/rbac/role-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/rbac/users -> daftar pengguna beserta perannya (ADMINISTRATOR)
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

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya Administrator yang dapat melihat daftar pengguna.",
        },
        { status: 403 }
      );
    }

    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(5, Number(req.nextUrl.searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          createdAt: true,
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    // Peran efektif: role custom disimpan sebagai override (tanpa migrasi enum DB)
    const overrides = await getUserRoleOverrides();
    const users = rows.map((u) => ({
      ...u,
      role: overrides[u.id] ?? u.role,
      baseRole: u.role,
    }));

    return NextResponse.json({
      success: true,
      data: { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("[rbac] Gagal memuat daftar pengguna:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pengguna." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rbac/users
 * Body: { userId, role }
 */
export async function PATCH(req: NextRequest) {
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
          error: "Hanya Administrator yang dapat mengubah peran pengguna.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const targetId = String(body?.userId || "");
    const nextRole = String(body?.role || "");

    const roles = await getRoleDefinitions();

    if (!targetId || !nextRole || !roles.some((r) => r.role === nextRole)) {
      return NextResponse.json(
        { success: false, error: "Data perubahan peran tidak valid." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const previousRole = target.role;

    // Role bawaan -> juga menulis kolom enum Prisma; role custom -> override saja
    await assignUserRole(targetId, nextRole, previousRole);

    const updated = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_USER_ROLE",
          userId: user.id,
          description: `Peran ${target.email} diubah dari ${previousRole} menjadi ${nextRole}.`,
        },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: true,
      message: `Peran ${updated?.email || target.email} berhasil diubah menjadi ${nextRole}.`,
      data: {
        user: {
          id: targetId,
          name: updated?.name ?? target.name,
          email: updated?.email ?? target.email,
          role: nextRole,
        },
      },
    });
  } catch (error) {
    console.error("[rbac] Gagal mengubah peran pengguna:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengubah peran pengguna." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac/users -> buat pengguna baru (ADMINISTRATOR)
 * Body: { name, email, password, role, companyName?, phoneNumber?, taxId? }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }
    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat menambah pengguna." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const role = String(body?.role || "CUSTOMER");
    const companyName = body?.companyName ? String(body.companyName).trim() : null;
    const phoneNumber = body?.phoneNumber ? String(body.phoneNumber).trim() : null;
    const taxId = body?.taxId ? String(body.taxId).trim() : null;

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: "Nama minimal 2 karakter." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Format email tidak valid." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }

    const roles = await getRoleDefinitions();
    if (!roles.some((r) => r.role === role)) {
      return NextResponse.json({ success: false, error: "Peran tidak valid." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email sudah terdaftar." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phoneNumber: phoneNumber || null,
        companyName,
        taxId,
        role: (["CUSTOMER","SALES_REP","WAREHOUSE_STAFF","ADMINISTRATOR"].includes(role)
          ? role
          : "CUSTOMER") as any,
      },
      select: { id: true, name: true, email: true, role: true, companyName: true, createdAt: true },
    });

    // Role custom -> simpan override
    if (!["CUSTOMER","SALES_REP","WAREHOUSE_STAFF","ADMINISTRATOR"].includes(role)) {
      await assignUserRole(created.id, role, created.role);
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_USER",
          userId: user.id,
          description: `Administrator membuat pengguna ${created.email} dengan peran ${role}.`,
        },
      });
    } catch {}

    const overrides = await getUserRoleOverrides();
    const effectiveRole = overrides[created.id] ?? created.role;

    return NextResponse.json({
      success: true,
      message: `Pengguna ${created.email} berhasil dibuat.`,
      data: { user: { ...created, role: effectiveRole } },
    });
  } catch (error: any) {
    console.error("[rbac] Gagal membuat pengguna:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal membuat pengguna." }, { status: 500 });
  }
}

/**
 * PUT /api/rbac/users -> edit pengguna (ADMINISTRATOR)
 * Body: { userId, name?, email?, password?, role?, companyName?, phoneNumber?, taxId? }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }
    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat mengedit pengguna." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const userId = String(body?.userId || "");
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId wajib diisi." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const data: any = {};
    if (body?.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2) return NextResponse.json({ success: false, error: "Nama minimal 2 karakter." }, { status: 400 });
      data.name = name;
    }
    if (body?.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return NextResponse.json({ success: false, error: "Format email tidak valid." }, { status: 400 });
      if (email !== target.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ success: false, error: "Email sudah digunakan." }, { status: 409 });
      }
      data.email = email;
    }
    if (body?.companyName !== undefined) data.companyName = body.companyName ? String(body.companyName).trim() : null;
    if (body?.phoneNumber !== undefined) data.phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : null;
    if (body?.taxId !== undefined) data.taxId = body.taxId ? String(body.taxId).trim() : null;
    if (body?.password) {
      const password = String(body.password);
      if (password.length < 8) return NextResponse.json({ success: false, error: "Kata sandi minimal 8 karakter." }, { status: 400 });
      data.passwordHash = await hashPassword(password);
    }

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: userId }, data });
    }

    if (body?.role) {
      const role = String(body.role);
      const roles = await getRoleDefinitions();
      if (!roles.some((r) => r.role === role)) {
        return NextResponse.json({ success: false, error: "Peran tidak valid." }, { status: 400 });
      }
      await assignUserRole(userId, role, target.role);
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, companyName: true, createdAt: true },
    });

    const overrides = await getUserRoleOverrides();
    const effectiveRole = overrides[userId] ?? updated?.role;

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_USER",
          userId: user.id,
          description: `Administrator mengedit pengguna ${updated?.email}.`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Pengguna ${updated?.email} berhasil diperbarui.`,
      data: { user: { ...updated, role: effectiveRole } },
    });
  } catch (error: any) {
    console.error("[rbac] Gagal mengedit pengguna:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal mengedit pengguna." }, { status: 500 });
  }
}

/**
 * DELETE /api/rbac/users -> hapus pengguna (ADMINISTRATOR)
 * Body: { userId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }
    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat menghapus pengguna." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const userId = String(body?.userId || "");
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId wajib diisi." }, { status: 400 });
    }
    if (userId === user.id) {
      return NextResponse.json({ success: false, error: "Tidak dapat menghapus akun sendiri." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Cegah hapus jika memiliki data terkait
    const orderCount = await prisma.order.count({ where: { customerId: userId } });
    if (orderCount > 0) {
      return NextResponse.json({ success: false, error: "Pengguna memiliki order terkait, tidak dapat dihapus." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    // Bersihkan override
    try {
      await clearUserRoleOverride(userId);
    } catch {}

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_USER",
          userId: user.id,
          description: `Administrator menghapus pengguna ${target.email}.`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: `Pengguna ${target.email} berhasil dihapus.` });
  } catch (error: any) {
    console.error("[rbac] Gagal menghapus pengguna:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal menghapus pengguna." }, { status: 500 });
  }
}
