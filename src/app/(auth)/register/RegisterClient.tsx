"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = searchParams.get("redirect") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    businessType: "SPORTSWEAR",
    email: "",
    phone: "",
    taxId: "",
    password: "",
    acceptTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const businessCategories = [
    { id: "SPORTSWEAR", label: "Sportswear & Jersey Sublimasi" },
    { id: "HIJAB", label: "Hijab & Scarves (Voal Ultrafine)" },
    { id: "FASHION", label: "Fashion Brand & Ready-to-Wear" },
    { id: "MERCHANDISE", label: "Event Merchandise & Bendera/Banner" },
    { id: "DECOR", label: "Home Decor & Kanvas Sublimasi" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal mendaftarkan akun. Periksa kembali kelengkapan data.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      const targetUrl = redirectQuery || data.redirectTo || "/customer/dashboard";
      setTimeout(() => {
        router.push(targetUrl);
        router.refresh();
      }, 1200);
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server pendaftaran. Pastikan jaringan internet aktif.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-textile-pattern flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all">
            <img
              src="/icons/xoramateria-mark.png"
              alt="XoraMateria"
              className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
            />
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white tracking-wider block">XORAMATERIA</span>
            <span className="text-[10px] text-brand-400 uppercase tracking-widest block font-medium">Registrasi Akun Kemitraan</span>
          </div>
        </Link>
        <Link 
          href={redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : "/login"} 
          className="text-xs text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-1.5"
        >
          <span>Sudah punya akun? Masuk</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-3xl mx-auto w-full my-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-brand-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Akun Bisnis Berhasil Didaftarkan!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Selamat datang di ekosistem kemitraan XoraMateria. Anda akan dialihkan secara otomatis ke portal layanan mandiri.
              </p>
              <div className="pt-2">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Program Kemitraan Industri Tekstil B2B</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                  Daftarkan Perusahaan / Brand Anda
                </h1>
                <h2 className="sr-only">
                  Formulir pendaftaran akun mitra B2B XoraMateria
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dapatkan akses ke harga bertingkat pabrik (tiered pricing), fasilitas upload digital proof resolusi tinggi, dan pengiriman kargo roll bergaransi.
                </p>
              </div>

              {/* Context notification if redirected */}
              {redirectQuery && (
                <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold block">Registrasi Diperlukan</span>
                    <span className="text-[11px] text-amber-200/80 leading-relaxed block mt-0.5">
                      Daftarkan akun kemitraan Anda untuk melanjutkan proses transaksi atau studio custom sublimasi yang sedang Anda akses.
                    </span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Lengkap Penanggung Jawab *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Contoh: Rian Pratama"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Perusahaan / Brand Konveksi *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Contoh: CV. Pratama Sportswear"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Bisnis / Kantor *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@perusahaan.com"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nomor WhatsApp Aktif *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0812XXXXXXXX"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kategori Bisnis Utama
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-all"
                    >
                      {businessCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      NPWP Perusahaan (Opsional untuk Faktur Pajak PPN)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="00.000.000.0-000.000"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi Keamanan *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 8 karakter"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-[11px] text-slate-400 leading-normal">
                      Saya menyetujui{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-300 hover:text-brand-200 underline underline-offset-2"
                      >
                        Ketentuan Layanan Sublimasi Industri
                      </a>{" "}
                      dan{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-300 hover:text-brand-200 underline underline-offset-2"
                      >
                        Kebijakan Privasi
                      </a>{" "}
                      XoraMateria, termasuk prosedur toleransi susut kain standar pabrik (±2-3%).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.acceptTerms}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Mendaftarkan Akun Kemitraan...</span>
                  ) : (
                    <>
                      <span>Daftarkan Akun Kemitraan B2B</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto w-full text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} XoraMateria. CS & WhatsApp: +62 878-8985-6066 / admin@texoraprima.com
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
