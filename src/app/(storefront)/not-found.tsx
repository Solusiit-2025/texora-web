import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff, ArrowLeft, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Halaman Tidak Tersedia | Texora",
  description:
    "Halaman ini sedang dinonaktifkan sementara atau tidak tersedia.",
  robots: { index: false, follow: false },
};

/**
 * 404 untuk halaman storefront yang dinonaktifkan dari CMS
 * (fitur "Visibilitas Modul" di tab SEO & AI Settings).
 *
 * Dipanggil dari layout storefront via notFound() -> status HTTP 404 yang
 * benar (bukan 200), sehingga Google tidak mengindeks halaman yang
 * seharusnya tidak muncul di hasil pencarian.
 */
export default function StorefrontNotFound() {
  return (
    <div className="texora-container py-20 md:py-28">
      <div className="max-w-lg mx-auto text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
          <EyeOff className="w-7 h-7 text-slate-500" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400 mb-3">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight">
          Halaman sedang tidak tersedia
        </h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Modul ini sedang dinonaktifkan sementara oleh tim kami. Silakan jelajahi
          katalog kain atau hubungi tim sales untuk informasi lebih lanjut.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-brand-500/50 font-bold text-xs transition-colors"
          >
            <Search className="w-4 h-4 text-brand-400" />
            Lihat Katalog Kain
          </Link>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 mt-6 text-xs text-slate-500 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Hubungi tim sales
        </Link>
      </div>
    </div>
  );
}
