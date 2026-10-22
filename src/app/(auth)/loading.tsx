/**
 * Loading skeleton untuk halaman login/register.
 *
 * Tanpa ini, saat pengguna menekan "Kembali ke Beranda" di halaman login,
 * form login (beserta menunya) tetap terlihat selama beberapa detik
 * sampai halaman baru selesai di-render di server.
 */
export default function AuthLoading() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-5">
        <div className="h-10 w-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 animate-pulse" />
        <div className="space-y-2.5">
          <div className="h-5 w-2/3 rounded bg-slate-900/80 animate-pulse" />
          <div className="h-3 w-full rounded bg-slate-900/60 animate-pulse" />
        </div>
        <div className="space-y-3 pt-1">
          <div className="h-11 w-full rounded-xl bg-slate-900/70 animate-pulse" />
          <div className="h-11 w-full rounded-xl bg-slate-900/70 animate-pulse" />
        </div>
        <div className="h-11 w-full rounded-xl bg-brand-500/20 animate-pulse" />
        <p className="sr-only">Memuat halaman…</p>
      </div>
    </div>
  );
}
