"use client";

import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Building2,
  Clock
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    fabricInterest: "Dryfit Milano",
    estimatedMeters: "500",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
          Layanan Pelanggan Korporat B2B
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Konsultasi Pengadaan Pabrik & Permintaan Sampel
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tim spesialis tekstil PT. Texora siap membantu pemilihan karakter kain, kalibrasi profil ICC printer, dan kontrak suplai jangka panjang.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Informasi Pabrik & Kantor Pusat
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Kantor Pusat & Workshop</div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Jl. Walang Baru VI Blok B1/2, RT 04 / RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Hotline & WhatsApp Resmi</div>
                  <a 
                    href="https://wa.me/6287889856066" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline mt-0.5 block font-semibold"
                  >
                    +62 878-8985-6066 (WhatsApp Fast Response)
                  </a>
                  <p className="text-slate-400 text-[11px] mt-0.5">Telepon & Konsultasi B2B</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-accent-cyan/10 text-accent-cyan shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Email Resmi Perusahaan</div>
                  <a 
                    href="mailto:admin@texoraprima.com" 
                    className="text-slate-300 hover:text-brand-300 transition-colors mt-0.5 block font-mono"
                  >
                    admin@texoraprima.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-accent-violet/10 text-accent-violet shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Jam Operasional Layanan</div>
                  <p className="text-slate-400 mt-0.5">Senin - Sabtu: 08:00 - 17:00 WIB</p>
                  <p className="text-slate-400">Pemesanan & konsultasi katalog aktif 24 jam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample swatch promotion */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/60 to-slate-900 border border-brand-500/30 text-xs space-y-2">
            <span className="font-bold text-accent-cyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Paket Swatch Sample Gratis
            </span>
            <p className="text-slate-300 leading-relaxed">
              Khusus brand garmen terverifikasi, kami menyediakan swatch book kain asli (Dryfit, Voal, Satin, Scuba) beserta contoh hasil cetak gradasi sublimasi secara cuma-cuma.
            </p>
          </div>

        </div>

        {/* Right Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 shadow-2xl">
            
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Inquiry Berhasil Terkirim!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Terima kasih, data kebutuhan kain Anda telah otomatis masuk ke Pipeline CRM Sales Texora. Tim kami akan menghubungi Anda melalui WhatsApp dalam 1-2 jam kerja.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Formulir Konsultasi & Permintaan Penawaran
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dimas Pratama"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Nama Perusahaan / Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT. Apparel Nusantara"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081298765432"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Alamat Email Perusahaan *</label>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: purchasing@brand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Bahan Kain yang Diminati</label>
                    <select
                      value={formData.fabricInterest}
                      onChange={(e) => setFormData({ ...formData, fabricInterest: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Dryfit Milano">Dryfit Milano (Jersey / Sport)</option>
                      <option value="Voal Ultrafine">Voal Ultrafine (Hijab Printing)</option>
                      <option value="Polyester Satin Silk">Polyester Satin Silk (Scarf & Gaun)</option>
                      <option value="Scuba Heavyweight">Scuba Heavyweight (Jaket)</option>
                      <option value="Canvas Poly">Canvas Poly 8oz (Totebag / Merchandise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Perkiraan Kebutuhan (Meter)</label>
                    <input
                      type="number"
                      placeholder="Misal: 1000"
                      value={formData.estimatedMeters}
                      onChange={(e) => setFormData({ ...formData, estimatedMeters: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Detail Kebutuhan / Pertanyaan Teknis</label>
                  <textarea
                    rows={3}
                    placeholder="Sebutkan detail deadline produksi, kebutuhan sample swatch, atau spesifikasi target warna pantone..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Permintaan Penawaran Resmi</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
