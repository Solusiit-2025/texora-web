/**
 * Entry point scheduler untuk Node.js runtime saja.
 *
 * File ini TIDAK pernah di-bundle untuk edge runtime karena
 * `src/instrumentation.ts` meng-import-nya secara dinamis di dalam cabang
 * `process.env.NEXT_RUNTIME === "nodejs"`.
 *
 * Di sini kita aman menggunakan modul Node.js (fs/path via @/lib/backup).
 */

import { ensureSchedulerStarted } from "@/lib/backup-scheduler";

export function startBackupScheduler(): void {
  ensureSchedulerStarted();
}
