"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Layers } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
            System Notice
          </span>
          <h2 className="text-2xl font-black text-white font-display pt-1">
            Terjadi Kendala Teknis
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error?.message || "Halaman mengalami kesalahan sementara saat memuat komponen antarmuka."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          PT. Texora Visi Prima • Next.js Enterprise Error Boundary
        </div>

      </div>
    </div>
  );
}
