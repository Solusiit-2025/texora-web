import Link from "next/link";
import { Layers, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-accent-cyan flex items-center justify-center mx-auto shadow-lg">
          <Layers className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-accent-cyan uppercase tracking-widest px-2.5 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20">
            Error 404
          </span>
          <h1 className="text-3xl font-black text-white font-display pt-1">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, diganti tautannya, atau belum terdaftar di sistem Texora.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Beranda Toko</span>
          </Link>

          <Link
            href="/catalog"
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Katalog Kain</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          PT. Texora Visi Prima • Industrial Textile & Sublimation
        </div>

      </div>
    </div>
  );
}
