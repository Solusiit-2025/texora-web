/**
 * Loading skeleton untuk seluruh halaman storefront.
 *
 * FUNGSI: di Next.js App Router, `loading.tsx` membuat batas Suspense.
 * Saat pindah halaman (mis. dari /login ke beranda), boundary ini LANGSUNG
 * dirender - jadi pengguna langsung melihat skeleton, bukan halaman lama
 * yang masih nempel beberapa detik.
 *
 * CATATAN PENTING: pemblokiran halaman nonaktif (status 404) dilakukan di
 * ROOT LAYOUT (src/app/layout.tsx), BUKAN di sini. Kalau diletakkan di
 * dalam boundary ini, respons sudah ter-flush dengan status 200 sehingga
 * notFound() tidak bisa lagi mengubahnya -> "soft 404" (rusak untuk SEO).
 */
export default function StorefrontLoading() {
  return (
    <div className="texora-container py-10 space-y-8" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="h-3 w-32 rounded bg-slate-900/80 animate-pulse" />
        <div className="h-9 w-3/4 max-w-xl rounded-lg bg-slate-900/80 animate-pulse" />
        <div className="h-3 w-full max-w-2xl rounded bg-slate-900/60 animate-pulse" />
        <div className="h-3 w-2/3 max-w-lg rounded bg-slate-900/60 animate-pulse" />
      </div>

      {/* Konten skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40"
          >
            <div className="aspect-[16/10] bg-slate-900/70 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 rounded bg-slate-900/80 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-900/80 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-slate-900/60 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-slate-900/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <p className="sr-only">Memuat halaman…</p>
    </div>
  );
}
