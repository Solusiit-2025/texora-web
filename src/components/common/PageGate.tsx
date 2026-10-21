"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { EyeOff } from "lucide-react";

export function PageGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "enabled" | "disabled">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seo")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const pages = json?.data?.pages || {};
        const p = pages[pathname];
        setStatus(p && p.enabled === false ? "disabled" : "enabled");
      })
      .catch(() => {
        if (!cancelled) setStatus("enabled");
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="texora-container py-20 space-y-6">
        <div className="h-8 w-1/3 rounded-lg bg-slate-900/60 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-900/60 animate-pulse" />
      </div>
    );
  }

  if (status === "disabled") {
    return (
      <div className="texora-container py-24 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <EyeOff className="w-6 h-6 text-slate-500" />
        </div>
        <h1 className="text-xl font-bold text-white">Halaman sedang tidak tersedia</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Modul ini untuk sementara dinonaktifkan. Silakan hubungi tim kami untuk informasi lebih lanjut.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
