/**
 * Next.js Instrumentation Hook.
 *
 * Dijalankan sekali saat server Next.js start. Mengaktifkan scheduler backup
 * database otomatis (harian) tanpa Cron eksternal.
 *
 * Diaktifkan lewat `experimental.instrumentationHook` pada next.config.mjs.
 *
 * CATATAN PENTING — kenapa memakai dynamic import:
 * Next.js meng-compile instrumentation.ts untuk runtime EDGE terlebih dahulu.
 * Edge runtime tidak memiliki modul Node.js bawaan (`fs`, `path`, `net`, ...).
 * Karena itu, seluruh kode Node.js-only HARUS berada di file terpisah
 * (`instrumentation-node.ts`) dan di-import secara DINAMIS di dalam cabang
 * `process.env.NEXT_RUNTIME === "nodejs"`. Dengan begitu, bundler dapat
 * dead-code-eliminate cabang tersebut untuk build edge sehingga modul
 * `fs`/`path` tidak pernah ikut ter-bundle di sana.
 *
 * Referensi: https://nextjs.org/docs/app/building-your-application/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBackupScheduler } = await import("./instrumentation-node");
    startBackupScheduler();
  }
}
