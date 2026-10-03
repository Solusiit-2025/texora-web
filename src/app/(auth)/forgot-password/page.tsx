"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  Mail, 
  ArrowRight, 
  ChevronLeft, 
  CheckCircle2,
  KeyRound
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-textile-pattern flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
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
            <span className="text-[10px] text-brand-400 uppercase tracking-widest block font-medium">Pemulihan Akun</span>
          </div>
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/20 shadow-2xl">
          {isSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">Tautan Terkirim!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kami telah mengirimkan instruksi pengaturan ulang kata sandi ke <strong className="text-white">{email}</strong>. Silakan periksa folder kotak masuk atau spam Anda.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">Lupa Kata Sandi?</h1>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Masukkan email bisnis yang terdaftar untuk menerima tautan pemulihan kata sandi akun Texora Anda.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@perusahaan.co.id"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Mengirimkan Tautan...</span>
                  ) : (
                    <>
                      <span>Kirim Tautan Pemulihan</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-6 border-t border-slate-800/80 mt-6 text-center">
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} PT. Texora Visi Prima.
      </div>
    </div>
  );
}
