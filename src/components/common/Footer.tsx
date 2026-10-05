import Link from "next/link";
import { Layers, ShieldCheck, Award, Truck, Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 pt-12 lg:pt-14 3xl:pt-16 pb-10 lg:pb-12 mt-auto">
      <div className="texora-container">
        
        {/* Top Feature Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-brand-500/10 text-brand-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Standar Oeko-Tex</h4>
              <p className="text-xs text-slate-400">Tinta ramah lingkungan & anti-alergi</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">1440 DPI Precision</h4>
              <p className="text-xs text-slate-400">Hasil warna pekat & gradasi tajam</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-violet/10 text-accent-violet">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Volume Tier Pricing</h4>
              <p className="text-xs text-slate-400">Diskon otomatis per rol & partai besar</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-amber/10 text-accent-amber">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Kargo Khusus Roll</h4>
              <p className="text-xs text-slate-400">Kemasan anti-lembab & ekspedisi kargo</p>
            </div>
          </div>
        </div>

        {/* Links & Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 xl:w-11 xl:h-11 3xl:w-12 3xl:h-12 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40">
                <img
                  src="/icons/texora-logo.png"
                  alt="PT. Texora Visi Prima"
                  className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-display">
                PT. TEXORA VISI PRIMA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Pabrik & manufaktur cetak sublimasi kain industri terintegrasi. Menyuplai kebutuhan bahan kain poliester khusus jersey olahraga, hijab voal, gaun satin, dan merchandise komersial untuk ratusan brand garmen di Indonesia.
            </p>
            <div className="flex items-start gap-2 pt-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Jl. Walang Baru VI Blok B1/2, RT 04 / RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara
              </span>
            </div>
            <div className="pt-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2.5">
                Ikuti Kami
              </p>
              <SocialLinks />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Katalog Kain</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/catalog" className="hover:text-brand-300">Dryfit Milano (Sportswear)</Link></li>
              <li><Link href="/catalog" className="hover:text-brand-300">Voal Ultrafine (Hijab)</Link></li>
              <li><Link href="/catalog" className="hover:text-brand-300">Polyester Silk Satin</Link></li>
              <li><Link href="/catalog" className="hover:text-brand-300">Scuba Neoprene Stretch</Link></li>
              <li><Link href="/catalog" className="hover:text-brand-300">Spandex Lycra Athletic</Link></li>
              <li><Link href="/catalog" className="hover:text-brand-300">Canvas Poly 8oz</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Layanan & Fitur</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/custom-sublimation" className="hover:text-accent-cyan font-medium">Unggah Desain & Visualizer</Link></li>
              <li><Link href="/track-order" className="hover:text-brand-300">Lacak Status Pesanan (SPK)</Link></li>
              <li><Link href="/contact" className="hover:text-brand-300">Permintaan Sampel Kain</Link></li>
              <li><Link href="/contact" className="hover:text-brand-300">Kontrak Suplai Pabrik B2B</Link></li>
              <li><Link href="/portal/dashboard" className="hover:text-accent-magenta">Portal Manajemen Karyawan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Hubungi Sales & CS</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <a
                href="https://wa.me/6287889856066"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-300">+62 878-8985-6066 (WhatsApp)</span>
              </a>
              <a
                href="mailto:admin@texoraprima.com"
                className="flex items-center gap-2 hover:text-brand-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>admin@texoraprima.com</span>
              </a>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mt-2">
                <span className="font-semibold text-white block mb-0.5">Layanan Kantor & CS:</span>
                Senin – Sabtu: 08:00 – 17:00 WIB
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PT. Texora Visi Prima. All Rights Reserved. Platform E-Commerce & CRM Suite.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-slate-500">Next.js App Router</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">Prisma ORM</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">PostgreSQL</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">Docker & Nginx</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
