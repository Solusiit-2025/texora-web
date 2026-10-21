import Link from "next/link";
import { EyeOff } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";

/**
 * Tampilan standar untuk modul yang dinonaktifkan dari CMS.
 *
 * Ini adalah SERVER component sehingga pesan "tidak tersedia" langsung
 * muncul di HTML awal (crawler & AI tahu modul ini tidak aktif) tanpa
 * perlu menunggu JavaScript.
 */
export function ModuleDisabledNotice({ path }: { path: string }) {
  return (
    <article className="texora-container py-24">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "Tidak tersedia" }]} />
      </div>

      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <EyeOff className="w-6 h-6 text-slate-500" />
        </div>
        <h1 className="text-xl font-bold text-white">Halaman sedang tidak tersedia</h1>
        <h2 className="sr-only">
          Modul {path} sedang dinonaktifkan sementara
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Modul <code className="font-mono text-brand-400">{path}</code> untuk sementara
          dinonaktifkan. Silakan hubungi tim kami untuk informasi lebih lanjut.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Lihat Katalog
          </Link>
        </div>
      </div>
    </article>
  );
}
