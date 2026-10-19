"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Suspense } from "react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/portal";
  const role = searchParams.get("role") || "USER";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold uppercase tracking-wider">
            Akses Ditolak (RBAC 403)
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Otoritas Tidak Mencukupi
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Peran Anda (<strong className="text-white">{role}</strong>) tidak memiliki hak akses administratif untuk membuka modul <code className="text-rose-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{from}</code>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Lock className="w-4 h-4 text-brand-400" />
            <span>Kebijakan Keamanan Texora:</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Halaman ini dilindungi enkripsi JWT dengan kebijakan Role-Based Access Control (RBAC). Jika Anda memerlukan akses modul ini, silakan hubungi Administrator Sistem.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/portal/dashboard"
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Ke Dashboard Saya</span>
          </Link>
          <Link
            href="/login"
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ganti Akun</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Memverifikasi otorisasi...
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
