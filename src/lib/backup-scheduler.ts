/**
 * Scheduler backup database untuk PT. Texora Visi Prima.
 *
 * PENTING: modul ini HANYA boleh di-import dari kode yang berjalan di
 * Node.js runtime (route handler / server action), BUKAN dari middleware
 * (edge runtime) dan BUKAN dari client component.
 *
 * Cara kerja:
 *  - `ensureSchedulerStarted()` dipanggil sekali dari route handler Node runtime.
 *  - Modul memakai `globalThis` sebagai penanda supaya interval tidak dibuat
 *    dua kali meski modul di-reload oleh Next.js dev server.
 *  - Backup berjalan otomatis setiap 24 jam + sekali pada startup (dengan
 *    jeda agar server tidak terbebani saat masih warm-up).
 *
 * Untuk environment production, scheduler juga dapat dipicu dari luar
 * (Vercel Cron / Windows Task Scheduler) melalui endpoint:
 *   GET /api/cron/backup
 */

import { runScheduledBackup } from "@/lib/backup";

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 jam
const FIRST_RUN_DELAY_MS = 60 * 1000; // jeda 60 detik setelah server start

declare global {
  // eslint-disable-next-line no-var
  var __texoraBackupTimer: NodeJS.Timeout | undefined;
}

/**
 * Pastikan scheduler backup otomatis berjalan (idempotent).
 * Aman dipanggil berulang kali dari route handler mana pun.
 */
export function ensureSchedulerStarted(): void {
  if (globalThis.__texoraBackupTimer) return;

  const enabled = process.env.BACKUP_AUTO_ENABLED !== "false";
  if (!enabled) {
    console.log("[backup] Backup otomatis dinonaktifkan (BACKUP_AUTO_ENABLED=false).");
    return;
  }

  const runBackup = async () => {
    try {
      await runScheduledBackup();
    } catch (err) {
      console.error("[backup] Error pada scheduler backup:", err);
    }
  };

  // Backup pertama dijalankan setelah server stabil
  const firstRun = setTimeout(runBackup, FIRST_RUN_DELAY_MS);

  // Backup berikutnya setiap 24 jam
  const interval = setInterval(runBackup, BACKUP_INTERVAL_MS);

  // Jangan tahan proses Node tetap hidup hanya karena timer ini
  if (typeof firstRun.unref === "function") firstRun.unref();
  if (typeof interval.unref === "function") interval.unref();

  globalThis.__texoraBackupTimer = interval;

  console.log(
    "[backup] Scheduler backup otomatis aktif (interval 24 jam, retensi 14 file terbaru)."
  );
}
