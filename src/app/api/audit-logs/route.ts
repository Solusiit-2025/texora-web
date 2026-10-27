import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { SYSTEM_ADMIN_ROLE } from "@/lib/rbac/authorize";
import { AUDIT_CATEGORIES } from "@/lib/audit-categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/audit-logs
 *
 * Menampilkan jejak audit sistem (login, perubahan konten/katalog, RBAC,
 * backup). Hanya untuk role ADMINISTRATOR — sama dengan guard halaman
 * /portal/audit-logs di src/proxy.ts.
 *
 * Query:
 *  - page       (default 1)
 *  - pageSize   (default 25, maks 100)
 *  - q          pencarian teks (aksi, deskripsi, nama/email user)
 *  - category   security | access | content | system | sales | all
 *  - from, to   ISO date (createdAt)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }
    // Sesuai permintaan: hanya Administrator (super admin) yang boleh melihat.
    if (user.role !== SYSTEM_ADMIN_ROLE) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat melihat log audit." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 25)
    );
    const q = (searchParams.get("q") || "").trim().slice(0, 120);
    const category = (searchParams.get("category") || "all").toLowerCase();
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");

    const conditions: any[] = [];

    if (q) {
      conditions.push({
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { user: { is: { name: { contains: q, mode: "insensitive" } } } },
          { user: { is: { email: { contains: q, mode: "insensitive" } } } },
        ],
      });
    }

    const prefixes = AUDIT_CATEGORIES[category];
    if (prefixes?.length) {
      conditions.push({
        OR: prefixes.map((prefix) => ({ action: { startsWith: prefix } })),
      });
    }

    const createdAt: any = {};
    if (fromRaw) {
      const from = new Date(fromRaw);
      if (!Number.isNaN(from.getTime())) createdAt.gte = from;
    }
    if (toRaw) {
      const to = new Date(toRaw);
      if (!Number.isNaN(to.getTime())) {
        // Inklusif sampai akhir hari bila yang dikirim hanya tanggal.
        to.setHours(23, 59, 59, 999);
        createdAt.lte = to;
      }
    }
    if (Object.keys(createdAt).length) conditions.push({ createdAt });

    const where: any = conditions.length ? { AND: conditions } : {};

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    ]);

    // Statistik ringkas 7 hari terakhir untuk kartu di atas tabel.
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [loginSuccess, loginFailed, contentChanges, securityEvents] =
      await Promise.all([
        prisma.auditLog.count({
          where: { createdAt: { gte: since }, action: "LOGIN_SUCCESS" },
        }),
        prisma.auditLog.count({
          where: { createdAt: { gte: since }, action: "LOGIN_FAILED" },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: { gte: since },
            OR: AUDIT_CATEGORIES.content.map((prefix) => ({
              action: { startsWith: prefix },
            })),
          },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: { gte: since },
            OR: AUDIT_CATEGORIES.security.map((prefix) => ({
              action: { startsWith: prefix },
            })),
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: log.user
          ? {
              id: log.user.id,
              name: log.user.name,
              email: log.user.email,
              role: log.user.role,
            }
          : null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      stats: { loginSuccess, loginFailed, contentChanges, securityEvents },
    });
  } catch (error) {
    console.error("[audit-logs] Gagal memuat log:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat log audit." },
      { status: 500 }
    );
  }
}
