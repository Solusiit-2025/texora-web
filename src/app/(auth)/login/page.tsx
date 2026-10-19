"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Autentikasi berhasil! Mengarahkan ke dashboard...");

      // Determine redirect URL
      const targetUrl = redirectQuery || data.redirectTo || "/portal/dashboard";

      setTimeout(() => {
        router.push(targetUrl);
        router.refresh();
      }, 500);
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server autentikasi. Pastikan koneksi internet aktif.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-textile-pattern flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all">
            <img
              src="/icons/texora-logo.png"
              alt="PT. Texora Visi Prima"
              className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
            />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white tracking-wider block">TEXORA</span>
            <span className="text-[10px] text-brand-400 uppercase tracking-widest block font-medium">Visi Prima • B2B Sublimation</span>
          </div>
        </Link>
        <Link 
          href="/" 
          className="text-xs text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-1.5"
        >
          <span>Kembali ke Beranda</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card - Clean, Secure & Professional for Public */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel p-7 sm:p-9 rounded-3xl border border-brand-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-slate-900/90 border border-brand-500/30 text-brand-400 shadow-inner mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                Masuk ke Portal Texora
              </h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Katalog digital, persetujuan proofing sublimasi, dan portal manajemen terpadu.
              </p>
            </div>

            {/* Context Alert when redirected from cart, checkout, custom-sublimation or track-order */}
            {(redirectQuery.includes("/custom-sublimation") || redirectQuery.includes("/checkout") || redirectQuery.includes("/cart") || redirectQuery.includes("/track-order")) && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold block">Autentikasi Akun Diperlukan</span>
                  <span className="text-[11px] text-amber-200/80 leading-relaxed block mt-0.5">
                    {redirectQuery.includes("/custom-sublimation")
                      ? "Silakan masuk ke akun Anda terlebih dahulu untuk mengakses Visualizer Kustom Sublimasi dan memproses pesanan."
                      : redirectQuery.includes("/cart")
                      ? "Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan mengelola keranjang belanja."
                      : redirectQuery.includes("/track-order")
                      ? "Silakan masuk ke akun Anda terlebih dahulu untuk melacak progres Surat Perintah Kerja (SPK) dan nomor resi pengiriman kargo."
                      : "Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan proses transaksi pemesanan."}
                  </span>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="nama@perusahaan.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400">Ingat sesi saya</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Keamanan...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-800/80 mt-6 text-center">
              <p className="text-xs text-slate-400">
                Belum memiliki akun kemitraan B2B?{" "}
                <Link href="/register" className="text-brand-400 font-semibold hover:underline">
                  Daftar Kemitraan Baru
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-7xl mx-auto w-full text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} PT. Texora Visi Prima. All Rights Reserved. Terdaftar di Kemenperin RI.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Memuat form login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
