import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { ensureSchedulerStarted } from "@/lib/backup-scheduler";
import { runScheduledBackup, listBackupFiles } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/cron/backup
 *
 * Endpoint untuk memicu backup database terjadwal dari luar aplikasi:
 *  - Vercel Cron / cron job Linux:  curl https://domain/api/cron/backup
 *  - Windows Task Scheduler         :  curl.exe https://domain/api/cron/backup
 *
 * Header `x-cron-secret` dapat ditambahkan bila `CRON_SECRET` diset di environment.
 *
 * Jika dipanggil tanpa secret (dan CRON_SECRET tidak diset), endpoint tetap
 * terbuka namun hanya dapat dieksekusi oleh Administrator yang sudah login
 * (via cookie sesi).
 */
export async function GET(req: NextRequest) {
  try {
    // Pastikan scheduler in-process ikut aktif saat route ini diakses
    ensureSchedulerStarted();

    const cronSecret = process.env.CRON_SECRET;
    const provided = req.headers.get("x-cron-secret");

    const authorizedBySecret = Boolean(cronSecret) && provided === cronSecret;

    if (!authorizedBySecret) {
      // Fallback: izinkan Administrator yang sudah login
      const user = await getAuthenticatedUser(req);
      if (!user || user.role !== "ADMINISTRATOR") {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized. Provide header x-cron-secret yang benar atau login sebagai Administrator.",
          },
          { status: 401 }
        );
      }
    }

    const result = await runScheduledBackup();

    if (!result.success) {
      await prisma.backupLog.create({
        data: {
          filename: result.filename,
          sizeBytes: BigInt(0),
          tables: "[]",
          recordCount: 0,
          status: "FAILED",
          trigger: "SCHEDULED",
          message: result.message,
        },
      }).catch(() => {});

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
        totalFiles: listBackupFiles().length,
      },
    });
  } catch (error: any) {
    console.error("[cron/backup] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menjalankan backup terjadwal." },
      { status: 500 }
    );
  }
}
