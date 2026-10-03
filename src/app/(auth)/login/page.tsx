"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Layers, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  UserCheck, 
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("hendra@garmentkreatif.com");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "SALES_REP" | "WAREHOUSE_STAFF" | "ADMINISTRATOR">("CUSTOMER");
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      role: "CUSTOMER" as const,
      name: "Hendra Wijaya",
      email: "hendra@garmentkreatif.com",
      company: "PT. Garment Kreatif Nusantara (B2B)",
      badge: "Customer B2B",
      redirect: "/customer/dashboard",
    },
    {
      role: "SALES_REP" as const,
      name: "Dian Permata",
      email: "sales@texora.co.id",
      company: "Internal Sales & CRM Team",
      badge: "Sales Executive",
      redirect: "/portal/crm/leads",
    },
    {
      role: "WAREHOUSE_STAFF" as const,
      name: "Agus Santoso",
      email: "logistik@texora.co.id",
      company: "Fulfillment & Roll Cutting Hub",
      badge: "Warehouse Hub",
      redirect: "/portal/warehouse/inventory",
    },
    {
      role: "ADMINISTRATOR" as const,
      name: "Ir. Gunawan Setiadi",
      email: "admin@texora.co.id",
      company: "Management & Finance (2FA Required)",
      badge: "Super Admin",
      redirect: "/portal/dashboard",
    },
  ];

  const handleSelectAccount = (account: typeof demoAccounts[number]) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    if (account.role === "ADMINISTRATOR") {
      setShow2FA(true);
    } else {
      setShow2FA(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const target = demoAccounts.find((a) => a.role === selectedRole);
      router.push(target?.redirect || "/portal/dashboard");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-textile-pattern flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all">
            <img
              src="/icons/texora-logo.png"
              alt="PT. Texora Visi Prima"
              className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
            />
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white tracking-wider block">TEXORA</span>
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

      {/* Main Login Card */}
      <div className="max-w-4xl mx-auto w-full my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Quick Role Switcher for Demo */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/20 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RBAC Demo Switcher</span>
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Pilih Profil Akses</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Pilih peran di bawah ini untuk menguji hak akses otentikasi role-based access control (RBAC).
            </p>

            <div className="space-y-3">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-brand-500/15 border-brand-500/60 shadow-lg shadow-brand-500/10"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{acc.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? "bg-brand-500 text-slate-950" 
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {acc.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{acc.company}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Enkripsi 256-bit TLS & HTTP-only cookies session</span>
            </div>
          </div>
        </div>

        {/* Right Column: Credential Form */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/20 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                Masuk ke Portal Texora
              </h1>
              <p className="text-xs text-slate-400">
                Akses katalog B2B, persetujuan proofing sublimasi, dan dashboard terpusat.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Email Perusahaan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="nama@perusahaan.co.id"
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
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* 2FA Input for Administrator */}
              {show2FA && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Otentikasi Dua Faktor (2FA PRD 3.3)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Akun Administrator memerlukan 6-digit kode OTP dari Google Authenticator.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Contoh: 849201"
                    className="w-full bg-slate-900/90 border border-amber-500/40 rounded-xl py-2 px-3 text-sm text-center tracking-widest text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Mengautentikasi Sesi...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard ({selectedRole})</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6 text-center">
            <p className="text-xs text-slate-400">
              Belum memiliki akun kemitraan B2B?{" "}
              <Link href="/register" className="text-brand-400 font-semibold hover:underline">
                Daftar Akun Bisnis Baru
              </Link>
            </p>
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
