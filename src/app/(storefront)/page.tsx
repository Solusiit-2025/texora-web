"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { FabricSpecCard } from "@/components/storefront/FabricSpecCard";
import { ArrowRight, ArrowUpRight, ChevronDown, Percent } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Organic wave divider between charcoal and alabaster sections (PRD V3 §4). */
function OrganicDivider({ flip = false, fill }: { flip?: boolean; fill: string }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full h-12 sm:h-20 ${flip ? "rotate-180" : ""}`}
    >
      <path d="M0,48 C240,88 420,8 720,36 C1010,64 1200,14 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  );
}

const CRAFT_STEPS = [
  {
    no: "I",
    title: "Pemeriksaan Artwork",
    body: "Setiap file diperiksa operator pra-cetak: resolusi, profil warna, dan arah repeat motif terhadap lebar kain sebelum masuk antrean.",
  },
  {
    no: "II",
    title: "Cetak Kertas Transfer",
    body: "Motif dicetak terbalik pada kertas transfer dengan tinta dispersi. Pada tahap ini warna masih tampak kusam — itu normal.",
  },
  {
    no: "III",
    title: "Kalender Rotary 200–215°C",
    body: "Panas dan tekanan mengubah tinta menjadi gas yang masuk ke serat poliester. Warna menyatu dengan benang, bukan menempel di permukaan.",
  },
  {
    no: "IV",
    title: "Inspeksi & Penggulungan",
    body: "Kain diperiksa di meja inspeksi, digulung ulang, diberi label barcode per lot, lalu dikemas plastik tebal untuk kargo.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Warna neon Dryfit Milano konsisten antar-lot. Untuk order turnamen 3.000 meter, kami tidak perlu sortir ulang.",
    name: "Budi Kurniawan",
    org: "Apex Athletic Apparel, Bandung",
  },
  {
    quote:
      "Voal-nya jatuh lembut dan tembusnya bagus. Tier harga membuat ongkos koleksi Raya kami lebih terkendali.",
    name: "Nadira Al-Habsyi",
    org: "Zavira Signature Scarf, Jakarta",
  },
  {
    quote:
      "Proofing digital dan pelacakan SPK memudahkan tim pengadaan memantau 800 meter canvas tanpa telepon bolak-balik.",
    name: "Rian Pramono",
    org: "CV. Rekanindo Event Kreasi",
  },
];

const FAQS = [
  {
    q: "Berapa resolusi minimal file untuk sublimasi?",
    a: "Kami menyarankan 150–300 DPI pada ukuran cetak sebenarnya. Visualizer akan memberi peringatan bila resolusi file di bawah ambang tersebut.",
  },
  {
    q: "Bagaimana harga bertingkat dihitung?",
    a: "Harga per meter turun sesuai total panjang pesanan per jenis kain. Tier yang berlaku langsung terlihat di kalkulator dan keranjang.",
  },
  {
    q: "Apakah bisa proofing fisik sebelum produksi massal?",
    a: "Bisa. Selain proofing digital, kami menyediakan cetak sampel 1 yard agar warna dapat dicek di bawah pencahayaan standar Anda.",
  },
  {
    q: "Bagaimana pengiriman ke luar kota?",
    a: "Melalui kargo spesialis roll (Dakota Cargo, JNE Trucking) atau armada sendiri untuk Bandung dan Jabodetabek. Gulungan dikemas plastik tebal dan karton pelindung.",
  },
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [calcFabricId, setCalcFabricId] = useState(MOCK_FABRICS[0].id);
  const [calcMeters, setCalcMeters] = useState(150);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fabric = MOCK_FABRICS.find((f) => f.id === calcFabricId) || MOCK_FABRICS[0];
  const tier =
    fabric.priceTiers.find((t) =>
      t.maxMeters ? calcMeters >= t.minMeters && calcMeters <= t.maxMeters : calcMeters >= t.minMeters
    ) || fabric.priceTiers[0];
  const baseTotal = fabric.basePricePerMeter * calcMeters;
  const tierTotal = tier.unitPrice * calcMeters;
  const savings = baseTotal - tierTotal;
  const discountPct = Math.round((savings / baseTotal) * 100);

  const fabrics = category === "All" ? MOCK_FABRICS : MOCK_FABRICS.filter((f) => f.category === category);
  const container = "texora-container";

  return (
    <div className="overflow-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={`${container} pt-4 pb-8 lg:pt-6 lg:pb-10 xl:pt-10 xl:pb-14`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="lg:col-span-6 xl:col-span-5"
          >
            <p className="text-[10px] xl:text-[11px] uppercase tracking-[0.28em] text-brand-400 font-semibold">
              Jakarta Utara · Manufaktur Cetak Sublimasi Industri
            </p>
            <h1 className="mt-3 lg:mt-4 font-display text-fluid-hero font-bold text-alabaster tracking-tight">
              Warna yang menyatu
              <br />
              <em className="animated-gradient-text not-italic font-extrabold">dengan serat,</em>
              <br />
              bukan sekadar menempel.
            </h1>
            <p className="mt-3.5 lg:mt-4 max-w-lg text-xs sm:text-sm lg:text-[0.92rem] xl:text-base text-slate-300 leading-relaxed">
              PT. Texora Visi Prima memproduksi kain poliester siap sublimasi dan jasa cetak skala roll untuk
              brand sportswear, busana muslim, dan merchandise — dengan harga bertingkat dan proofing sebelum
              mesin berjalan.
            </p>

            <div className="mt-5 lg:mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/custom-sublimation"
                className="group inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink px-6 py-3 text-xs sm:text-sm font-semibold transition-colors rounded-sm"
              >
                Mulai cetak motif
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 border border-brand-500/40 hover:border-brand-500 text-alabaster px-6 py-3 text-xs sm:text-sm font-medium transition-colors rounded-sm"
              >
                Lihat katalog kain
              </Link>
            </div>

            <dl className="mt-6 lg:mt-8 grid grid-cols-3 border-t border-brand-500/20 pt-4 lg:pt-5">
              {[
                { v: "10.000 m", k: "Kapasitas harian" },
                { v: "6 jenis", k: "Kain siap sublim" },
                { v: "400+", k: "Mitra garmen" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-lg sm:text-xl xl:text-2xl text-alabaster">{s.v}</dt>
                  <dd className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-500">{s.k}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Asymmetric image composition with offset brass frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
            className="lg:col-span-6 xl:col-span-7 relative"
          >
            <div className="absolute -top-4 -right-4 lg:-right-6 w-3/4 h-full border border-brand-500/35 pointer-events-none" />
            <div className="relative grid grid-cols-5 gap-2.5 max-w-xl mx-auto lg:max-w-none">
              <div className="col-span-3 aspect-[4/5] max-h-[320px] sm:max-h-[360px] lg:max-h-[400px] xl:max-h-[460px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
                  alt="Makro tekstur kain poliester hasil sublimasi"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-[1200ms]"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2.5 pt-10 sm:pt-14 lg:pt-10">
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80"
                    alt="Detail anyaman kain"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-[1200ms]"
                  />
                </div>
                <div className="bg-ink/90 border border-brand-500/30 p-3.5 backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-brand-400">Catatan pabrik</p>
                  <p className="mt-1 font-display text-xs sm:text-sm lg:text-base italic text-alabaster leading-snug">
                    “Tinta dispersi menguap pada 210°C dan mengunci di dalam benang.”
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="border-y border-brand-500/20 py-3.5 overflow-hidden" aria-hidden="true">
        <div className="marquee-track gap-8 items-center text-[10px] xl:text-[11px] uppercase tracking-[0.25em] text-slate-400">
          {[...Array(2)].flatMap((_, r) =>
            ["Dryfit Milano", "Voal Ultrafine", "Satin Silk", "Scuba Neoprene", "Spandex Lycra", "Canvas 8oz", "Oeko-Tex Standard 100", "Rotary Heatpress"].map(
              (item, i) => (
                <span key={`${r}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                  {item}
                  <span className="text-brand-500">◆</span>
                </span>
              )
            )
          )}
        </div>
      </div>

      {/* ── CRAFTSMANSHIP & HERITAGE (PRD V3 §4) ─────────────────────────── */}
      <div className="mt-14 lg:mt-20">
        <OrganicDivider fill="#F9FAFB" />
        <section className="surface-alabaster">
          <div className={`${container} section-pad`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-brand-700">Keahlian &amp; Warisan</p>
                <h2 className="mt-4 font-display text-fluid-h2 font-medium text-ink">
                  Bagaimana selembar kain putih menjadi motif yang tahan cuci.
                </h2>
                <p className="mt-6 text-sm text-slate-600 leading-relaxed max-w-sm">
                  Sublimasi bukan sablon. Tidak ada lapisan tinta di atas kain — pigmen berubah menjadi gas dan
                  masuk ke dalam serat poliester. Empat tahap berikut kami jalankan di lantai produksi setiap hari.
                </p>
              </div>

              <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
                {CRAFT_STEPS.map((s, i) => (
                  <motion.li
                    key={s.no}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease }}
                    className={`border-t border-ink/15 pt-6 ${i % 2 === 1 ? "sm:mt-12" : ""}`}
                  >
                    <span className="font-display text-4xl xl:text-5xl text-brand-600">{s.no}</span>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <OrganicDivider fill="#F9FAFB" flip />
      </div>

      {/* ── CATALOG ──────────────────────────────────────────────────────── */}
      <section className={`${container} section-pad`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Katalog</p>
            <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">Kain siap sublimasi</h2>
            <p className="mt-3 text-sm text-slate-400">Arahkan kursor ke kain untuk melihat spesifikasi teknis.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori kain">
            {["All", "Sportswear", "Fashion & Hijab", "Home Living", "Merchandise & Flag"].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-xs transition-colors border ${
                  category === c
                    ? "border-brand-500 bg-brand-500 text-ink font-semibold"
                    : "border-brand-500/25 text-slate-300 hover:border-brand-500/60"
                }`}
              >
                {c === "All" ? "Semua" : c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {fabrics.map((f, i) => (
            <FabricSpecCard key={f.id} fabric={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── TIER PRICING CALCULATOR ──────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20 xl:pb-24`}>
        <div className="brass-rule mb-14 text-xs">◆</div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Harga bertingkat</p>
              <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">
                Semakin panjang pesanan, semakin ringan harga per meter.
              </h2>
            </div>

            <fieldset>
              <legend className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-3">Jenis kain</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1.5 scrollbar-thin">
                {MOCK_FABRICS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCalcFabricId(f.id)}
                    className={`text-left px-4 py-3 border text-xs transition-colors ${
                      calcFabricId === f.id
                        ? "border-brand-500 bg-brand-500/10 text-alabaster"
                        : "border-slate-800 text-slate-400 hover:border-brand-500/40"
                    }`}
                  >
                    <span className="block font-semibold truncate">{f.name}</span>
                    <span className="text-[11px] text-slate-500">{f.variants[0]?.gsm} GSM</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="meters" className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Panjang (meter)
                </label>
                <input
                  id="meters"
                  type="number"
                  min={1}
                  max={5000}
                  value={calcMeters}
                  onChange={(e) => setCalcMeters(Math.max(1, Number(e.target.value)))}
                  className="w-28 bg-transparent border-b border-brand-500/50 text-right font-display text-2xl text-alabaster focus:outline-none focus:border-brand-400"
                />
              </div>
              <input
                type="range"
                min={1}
                max={2000}
                step={5}
                value={calcMeters}
                onChange={(e) => setCalcMeters(Number(e.target.value))}
                className="w-full accent-brand-500"
                aria-label="Geser panjang kain"
              />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
                {fabric.priceTiers.map((t) => {
                  const active = t.id === tier.id;
                  return (
                    <div key={t.id} className={`px-4 py-3 ${active ? "bg-brand-500 text-ink" : "bg-ink text-slate-400"}`}>
                      <div className="text-[10px] uppercase tracking-[0.14em]">
                        {t.maxMeters ? `${t.minMeters}–${t.maxMeters} m` : `≥ ${t.minMeters} m`}
                      </div>
                      <div className={`mt-1 text-sm font-semibold ${active ? "text-ink" : "text-alabaster"}`}>
                        {formatRupiah(t.unitPrice)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 lg:pl-10 lg:border-l border-brand-500/20 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimasi sebelum PPN &amp; kargo</p>
            <motion.p
              key={tierTotal}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-3 font-display text-fluid-price text-alabaster"
            >
              {formatRupiah(tierTotal)}
            </motion.p>
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <dt className="text-slate-400">Kain</dt>
                <dd className="text-alabaster">{fabric.name}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <dt className="text-slate-400">Volume</dt>
                <dd className="text-alabaster">{formatNumber(calcMeters)} m</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <dt className="text-slate-400">Harga terkunci</dt>
                <dd className="text-brand-300">{formatRupiah(tier.unitPrice)} / m</dd>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-brand-300">
                  <dt className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Hemat</dt>
                  <dd>{discountPct}% · {formatRupiah(savings)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/custom-sublimation?fabric=${fabric.id}&meters=${calcMeters}`}
                className="flex-1 inline-flex justify-center items-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink px-5 py-3.5 text-sm font-semibold transition-colors"
              >
                Cetak dengan kain ini <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/catalog/${fabric.slug}`}
                className="flex-1 inline-flex justify-center items-center border border-brand-500/40 hover:border-brand-500 text-alabaster px-5 py-3.5 text-sm transition-colors"
              >
                Beli kain polos
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── TESTIMONIALS (alabaster) ─────────────────────────────────────── */}
      <OrganicDivider fill="#F9FAFB" />
      <section className="surface-alabaster">
        <div className={`${container} section-pad`}>
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-700">Dari mitra kami</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="border-l-2 border-brand-500 pl-6"
              >
                <blockquote className="font-display text-xl xl:text-2xl italic text-ink leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className="block text-slate-500 text-xs mt-0.5">{t.org}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
      <OrganicDivider fill="#F9FAFB" flip />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${container} section-pad`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Pertanyaan umum</p>
            <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">Sebelum Anda memesan.</h2>
          </div>
          <div className="lg:col-span-8 divide-y divide-brand-500/15 border-y border-brand-500/15">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-xl text-alabaster">{f.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-brand-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-10 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-24 3xl:pb-28`}>
        <div className="relative border border-brand-500/40 px-8 py-14 sm:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="absolute -bottom-3 -left-3 w-24 h-24 border-l border-b border-brand-500 pointer-events-none" />
          <div className="lg:col-span-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-400">Kontrak B2B</p>
            <h2 className="mt-3 font-display text-fluid-h2 font-medium text-alabaster">
              Butuh pasokan rutin di atas 5.000 meter per bulan?
            </h2>
            <p className="mt-4 text-sm text-slate-400 max-w-xl">
              Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.
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
