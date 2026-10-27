import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/client-ip";

/**
 * Penulis log audit terpusat.
 *
 * Semua aksi penting (login, perubahan konten, perubahan katalog, RBAC, backup)
 * ditulis ke tabel `audit_logs` lengkap dengan IP + user agent supaya bisa
 * dipertanggungjawabkan di halaman /portal/audit-logs.
 *
 * Fungsi ini TIDAK PERNAH melempar error: kegagalan menulis log tidak boleh
 * menggagalkan aksi bisnis yang sedang dilakukan.
 */
export interface WriteAuditLogInput {
  action: string;
  description: string;
  userId?: string | null;
  /** Request asal (untuk mengambil IP + user agent). */
  request?: Pick<Request, "headers"> | null;
  /** Override IP bila request tidak tersedia. */
  ipAddress?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    const ipAddress = input.ipAddress ?? (input.request ? getClientIp(input.request) : null);
    const userAgent =
      input.request?.headers.get("user-agent")?.slice(0, 500) || null;

    await prisma.auditLog.create({
      data: {
        action: input.action,
        description: input.description.slice(0, 2000),
        userId: input.userId || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.warn("[audit] Gagal menulis log audit:", error);
  }
}

/** Kategori log untuk filter di UI (prefix `action`). */
export { AUDIT_CATEGORIES, auditCategoryOf } from "./audit-categories";
