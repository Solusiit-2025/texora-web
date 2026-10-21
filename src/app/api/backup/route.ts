import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  createBackup,
  listBackupFiles,
  pruneOldBackups,
  BACKUP_DIR,
} from "@/lib/backup";

export const dynamic = "force-dynamic";

/**
 * GET /api/backup
 *  - (default)      daftar file backup + riwayat log
 *  - ?download=<filename>  unduh file backup (ADMINISTRATOR)
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
        { success: false, error: "Hanya Administrator yang dapat mengakses backup." },
        { status: 403 }
      );
    }

    const download = req.nextUrl.searchParams.get("download");

    if (download) {
      // Sanitasi nama file untuk mencegah path traversal
      const safeName = path.basename(download);
      const filepath = path.join(BACKUP_DIR, safeName);

      if (!fs.existsSync(filepath) || !safeName.endsWith(".json")) {
        return NextResponse.json(
          { success: false, error: "File backup tidak ditemukan." },
          { status: 404 }
        );
      }

      const buffer = fs.readFileSync(filepath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeName}"`,
        },
      });
    }

    const files = listBackupFiles();
    const logs = await prisma.backupLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({
      success: true,
      data: {
        files: files.map((f) => ({
          filename: f.filename,
          sizeBytes: f.sizeBytes,
          createdAt: f.createdAt.toISOString(),
        })),
        logs: logs.map((l) => ({
          id: l.id,
          filename: l.filename,
          sizeBytes: Number(l.sizeBytes),
          recordCount: l.recordCount,
          status: l.status,
          trigger: l.trigger,
          message: l.message,
          createdAt: l.createdAt.toISOString(),
        })),
        backupDir: BACKUP_DIR,
      },
    });
  } catch (error: any) {
    console.error("[backup] Gagal memuat daftar backup:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar backup." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup -> buat backup baru secara manual
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
        { success: false, error: "Hanya Administrator yang dapat membuat backup." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action || "create";

    if (action === "prune") {
      const removed = await pruneOldBackups(Number(body?.keep) || 7);
      return NextResponse.json({
        success: true,
        message: `${removed} file backup lama berhasil dihapus.`,
      });
    }

    const result = await createBackup({ trigger: "MANUAL", createdBy: user.id });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        recordCount: result.recordCount,
        tables: result.tables,
      },
    });
  } catch (error: any) {
    console.error("[backup] Gagal membuat backup:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membuat backup." },
      { status: 500 }
    );
  }
}
