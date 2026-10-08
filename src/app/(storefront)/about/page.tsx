"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  Layers,
  ShieldCheck,
  Truck,
  Cpu,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Flame,
  Eye,
  Barcode,
  Droplets,
  Ruler,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { v: "10.000 m", k: "Kapasitas produksi harian" },
  { v: "18 jenis", k: "Kain poliester siap sublim" },
  { v: "400+", k: "Mitra brand & garmen" },
  { v: "210°C", k: "Kalender rotary heatpress" },
];

const MACHINES = [
  {
    icon: Cpu,
    title: "Printer Sublimasi Digital 1440 DPI",
    desc: "Cetak kertas transfer resolusi tinggi dengan profil warna ICC terkalibrasi — gradasi tetap tajam tanpa banding.",
  },
  {
    icon: Flame,
    title: "Kalender Rotary Heatpress 200–215°C",
    desc: "Panas & tekanan mengubah tinta dispersi menjadi gas yang masuk ke serat poliester, bukan sekadar menempel di permukaan.",
  },
  {
    icon: Ruler,
    title: "Meja Inspeksi & Cutting Otomatis",
    desc: "Kontrol lebar efektif hingga 110 inci, pemotongan presisi per lot, dan pelabelan barcode untuk ketelusuran.",
  },
  {
    icon: Droplets,
    title: "Ruang Kalibrasi Warna ICC",
    desc: "Penyesuaian profil warna dari monitor ke transfer paper agar hasil cetak konsisten antar-lot produksi.",
  },
];

const CERTIFICATIONS = [
  {
    icon: Leaf,
    title: "Oeko-Tex Standard 100",
    desc: "Tinta dispersi ramah lingkungan, bebas zat berbahaya, aman untuk produk yang bersentuhan langsung dengan kulit.",
  },
  {
    icon: Eye,
    title: "Digital Proofing & QC",
    desc: "Proofing digital sebelum mesin berjalan, plus inspeksi visual per roll sebelum dikemas dan dikirim.",
  },
  {
    icon: Barcode,
    title: "Ketelusuran Barcode per Lot",
    desc: "Setiap gulungan diberi label barcode berisi batch lot, GSM, dan panjang agar mudah diaudit.",
  },
];

const INDUSTRIES = [
  {
    icon: Users,
    title: "Sportswear & Activewear",
    desc: "Jersey, jersey e-sport, kostum tim, dan activewear dengan warna neon vibrant & anti-luntur.",
  },
  {
    icon: Palette,
    title: "Busana Muslim & Hijab",
    desc: "Voal ultrafine, satin silk, dan chiffon syari dengan motif floral islami yang tembus dua sisi.",
  },
  {
    icon: Layers,
    title: "Home Living & Interior",
    desc: "Sarung bantal, gorden blackout, selimut, dan tapestry dengan detail botanical tajam.",
  },
  {
    icon: Truck,
    title: "Merchandise & Event",
    desc: "Totebag, bendera event, umbul-umbul, dan merchandise korporat skala partai besar.",
  },
];

const VALUES = [
  { icon: CheckCircle2, title: "Konsistensi Warna", desc: "Profil ICC terkunci agar warna batch pertama dan batch berikutnya sama persis." },
  { icon: ShieldCheck, title: "Harga Bertingkat", desc: "Semakin panjang pesanan, semakin ringan harga per meter — transparan sejak kalkulator." },
  { icon: Truck, title: "Kargo Khusus Roll", desc: "Kemasan plastik tebal & karton pelindung untuk pengiriman roll ke seluruh Indonesia." },
  { icon: Award, title: "PIC Sales Khusus", desc: "Kontrak B2B mendapat manajer akun, termin pembayaran, dan sampel swatch gratis." },
];

export default function AboutPage() {
  const container = "texora-container";

  return (
    <div className="overflow-hidden">
      {/* ── HERO / HEADER ─────────────────────────────────────────────── */}
      <section className={`${container} pt-10 pb-6 lg:pt-14 lg:pb-8 xl:pt-16`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-7"
          >
            <p className="text-[10px] xl:text-[11px] uppercase tracking-[0.28em] text-brand-400 font-semibold">
              Tentang Kami · PT. Texora Visi Prima
            </p>
            <h1 className="mt-3 font-display text-fluid-hero font-bold text-alabaster tracking-tight">
              Pabrik sublimasi yang menyerahkan
              <br />
              <em className="animated-gradient-text not-italic font-extrabold">warna, bukan sekadar tinta.</em>
            </h1>
            <p className="mt-4 max-w-2xl text-sm lg:text-[0.92rem] text-slate-300 leading-relaxed">
              Kami memproduksi kain poliester siap sublimasi dan jasa cetak skala roll untuk brand sportswear,
              busana muslim, dan merchandise. Dari pemeriksaan artwork hingga penggulungan berlabel barcode,
              seluruh proses berjalan di satu lantai produksi di Jakarta Utara.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/custom-sublimation"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink px-6 py-3 text-xs sm:text-sm font-semibold transition-colors rounded-sm"
              >
                Mulai cetak motif <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-brand-500/40 hover:border-brand-500 text-alabaster px-6 py-3 text-xs sm:text-sm font-medium transition-colors rounded-sm"
              >
                Minta penawaran
              </Link>
            </div>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="lg:col-span-5 grid grid-cols-2 gap-px bg-slate-800 border border-slate-800"
          >
            {STATS.map((s) => (
              <div key={s.k} className="p-5 lg:p-6 bg-ink">
                <dt className="font-display text-2xl xl:text-3xl text-alabaster">{s.v}</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">{s.k}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ── PROFIL PERUSAHAAN ─────────────────────────────────────────── */}
      <section className={`${container} section-pad`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center">
                <img src="/icons/texora-logo.png" alt="PT. Texora Visi Prima" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-display font-bold text-alabaster">PT. TEXORA VISI PRIMA</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Industrial Textile & Sublimation</div>
              </div>
            </div>
            <h2 className="font-display text-fluid-h2 font-medium text-alabaster">
              Satu atap, dari bahan mentah hingga gulungan siap kargo.
            </h2>
            <p className="mt-5 text-sm text-slate-400 leading-relaxed">
              Berpusat di Tugu Utara, Tanjung Priok, Jakarta Utara, kami menggabungkan penyediaan kain poliester
              siap sublimasi dengan jasa cetak roll-ke-roll. Sublimasi bukan sablon — pigmen berubah menjadi gas
              dan menyatu ke dalam serat, sehingga warna tidak luntur, tidak retak, dan tetap tajam setelah dicuci
              berkali-kali.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {[
                "Stok kain poliester siap cetak dengan variasi GSM",
                "Jasa cetak roll untuk partai kecil hingga kontrak bulanan",
                "Digital proofing sebelum produksi massal",
                "Konsultasi pemilihan kain & profil warna",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-brand-500/20 shadow-2xl">
              <img
                src="/images/hero/hero-rotary.jpg"
                alt="Mesin kalender rotary heat press sublimasi"
                className="w-full aspect-[16/10] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                <p className="text-[9px] uppercase tracking-[0.18em] text-brand-400 font-semibold">Catatan pabrik</p>
                <p className="mt-1 font-display text-sm lg:text-base italic text-alabaster leading-snug max-w-xl">
                  “Kalender rotary 210°C mengunci tinta dispersi ke dalam serat benang, menghasilkan warna yang
                  menyatu — bukan menempel di permukaan kain.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KAPASITAS & MESIN ─────────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20`}>
        <div className="brass-rule mb-10 text-xs">◆</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Kapasitas Produksi</p>
            <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">
              Mesin & alur kerja di lantai produksi.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-slate-400">
            Empat tahap inti dari pemeriksaan artwork sampai penggulungan berlabel barcode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MACHINES.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="glass-panel rounded-2xl p-6 flex gap-4"
            >
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 h-fit shrink-0">
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-alabaster">{m.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SERTIFIKASI & JAMINAN ─────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CERTIFICATIONS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="border border-brand-500/20 rounded-2xl p-6 space-y-3"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-alabaster">{c.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INDUSTRI YANG DILAYANI ────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20`}>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Pasar yang Kami Layani</p>
          <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">
            Satu mesin, empat kategori produk.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="glass-panel rounded-2xl p-6 space-y-3"
            >
              <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan w-fit">
                <ind.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-alabaster">{ind.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{ind.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── NILAI KAMI ────────────────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20`}>
        <div className="brass-rule mb-10 text-xs">◆</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {VALUES.map((val, i) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="border-l-2 border-brand-500 pl-5"
            >
              <val.icon className="w-5 h-5 text-brand-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-alabaster">{val.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-24`}>
        <div className="relative border border-brand-500/40 px-8 py-14 sm:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="absolute -bottom-3 -left-3 w-24 h-24 border-l border-b border-brand-500 pointer-events-none" />
          <div className="lg:col-span-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Kerja Sama B2B</p>
            <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">
              Ingin lihat hasilnya di kain Anda sendiri?
            </h2>
            <p className="mt-4 text-sm text-slate-400 max-w-xl">
              Kirimkan artwork atau minta sampel swatch gratis. Tim kami akan bantu kalibrasi warna dan estimasi
              kebutuhan meter lari sebelum Anda berkomitmen.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink px-7 py-4 text-sm font-semibold transition-colors"
            >
              Minta penawaran <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
