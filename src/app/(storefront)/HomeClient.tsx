"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { yardsToMeters, metersToYards, pricePerYard } from "@/lib/units";
import { FabricSpecCard } from "@/components/storefront/FabricSpecCard";
import { RichContent } from "@/components/common/RichContent";
import { Breadcrumb } from "@/components/common/Breadcrumb";
// Peta interaktif ada jauh di bawah fold: muat JS-nya hanya saat dibutuhkan.
const CompanyLocationMap = dynamic(
  () => import("@/components/common/CompanyLocationMap").then((m) => m.CompanyLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] w-full animate-pulse rounded-3xl bg-slate-900/60" />
    ),
  }
);
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import { HERO_TEXT_KEY, type HeroText } from "@/config/hero-text";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Percent,
  ShieldCheck,
  Truck,
  Palette,
  Layers,
  Sparkles,
  Star,
  Quote,
  Check,
  MessageCircle,
  Factory,
  Gauge,
  BadgeCheck,
  Calculator,
  FileText,
  MapPin,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Hero Slider Slides */
const HERO_SLIDES = [
  {
    id: 1,
    mainImage: "/images/hero/hero-printer.jpg",
    secondaryImage: "/images/hero/hero-printer-sub.jpg",
    alt: "Proses cetak kertas transfer sublimasi digital skala industri",
    tag: "Mesin Cetak Sublim Digital",
    caption: "“Operator mengalibrasi profil warna ICC pada panel kontrol mesin cetak sublimasi digital.”",
  },
  {
    id: 2,
    mainImage: "/images/hero/hero-hijab.jpg",
    secondaryImage: "/images/hero/hero-hijab-sub.jpg",
    alt: "Kain Voal Ultrafine hasil cetak sublimasi motif batik & floral modern",
    tag: "Hijab & Fashion Voal",
    caption: "“Kain Voal Ultrafine cetak motif kustom dengan tekstur lembut & tembus warna presisi.”",
  },
  {
    id: 3,
    mainImage: "/images/hero/hero-sportswear.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    alt: "Bahan kain Dryfit Milano dengan cetak sublimasi warna neon vibrant",
    tag: "Sportswear & Dryfit Milano",
    caption: "“Bahan Dryfit Milano & Poly Spandex anti-luntur untuk kostum tim, jersey, dan activewear.”",
  },
  {
    id: 4,
    mainImage: "/images/hero/hero-rotary.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80",
    alt: "Mesin kalender rotary heat press sublimasi rol-ke-rol dengan silinder drum pemanas 210°C",
    tag: "Kalender Rotary Press 210°C",
    caption: "“Kalender rotary 210°C mengubah tinta dispersi menjadi gas yang mengunci sempurna di dalam serat benang.”",
  },
];

const CRAFT_STEPS = [
  {
    no: "01",
    key: "craft1",
    title: "Pemeriksaan Artwork",
    body: "Setiap file diperiksa operator pra-cetak: resolusi, profil warna, dan arah repeat motif terhadap lebar kain sebelum masuk antrean.",
  },
  {
    no: "02",
    key: "craft2",
    title: "Cetak Kertas Transfer",
    body: "Motif dicetak terbalik pada kertas transfer dengan tinta dispersi. Pada tahap ini warna masih tampak kusam — itu normal.",
  },
  {
    no: "03",
    key: "craft3",
    title: "Kalender Rotary 200–215°C",
    body: "Panas dan tekanan mengubah tinta menjadi gas yang masuk ke serat poliester. Warna menyatu dengan benang, bukan menempel di permukaan.",
  },
  {
    no: "04",
    key: "craft4",
    title: "Inspeksi & Penggulungan",
    body: "Kain diperiksa di meja inspeksi, digulung ulang, diberi label barcode per lot, lalu dikemas plastik tebal untuk kargo.",
  },
];

const VALUE_PROPS = [
  {
    key: "val1",
    icon: Percent,
    title: "Harga Bertingkat Transparan",
    body: "Harga per meter otomatis turun sesuai volume. Tidak ada biaya tersembunyi.",
  },
  {
    key: "val2",
    icon: Palette,
    title: "Proofing Sebelum Produksi",
    body: "Proof digital & sampel 1 yard untuk memastikan warna sesuai harapan.",
  },
  {
    key: "val3",
    icon: ShieldCheck,
    title: "Standar Oeko-Tex 100",
    body: "Tinta dispersi aman kulit, anti-luntur, dan tahan cuci berulang.",
  },
  {
    key: "val4",
    icon: Truck,
    title: "Kirim ke Seluruh Indonesia",
    body: "Kargo spesialis roll & armada sendiri untuk Jabodetabek dan Bandung.",
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

/** Reusable section heading (eyebrow + title + description). */
function SectionHeading({
  eyebrow,
  title,
  desc,
  light = false,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.22em] border ${
          light
            ? "bg-brand-500/10 text-brand-700 border-brand-600/25"
            : "bg-brand-500/10 text-brand-300 border-brand-500/25"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${light ? "bg-brand-600" : "bg-brand-400"}`} />
        {eyebrow}
      </span>
      <h2 className={`mt-4 font-display text-fluid-h2 font-bold tracking-tight ${light ? "text-ink" : "text-alabaster"}`}>
        {title}
      </h2>
      {desc && (
        <p className={`mt-3 text-sm leading-relaxed ${light ? "text-slate-600" : "text-slate-400"} ${center ? "mx-auto" : ""} max-w-xl`}>
          {desc}
        </p>
      )}
    </div>
  );
}

interface HomeClientProps {
  /** Data SSR dari server: produk katalog, FAQ, slide hero, testimoni, statistik. */
  initialData?: {
    fabrics?: any[];
    faqs?: Array<{ question: string; answer: string }>;
    heroSlides?: any[];
    testimonials?: any[];
    stats?: Array<{ v: string; k: string }>;
    b2bCta?: { title: string; description: string; actionText: string; actionLink: string };
    /** Copy hero dari CMS (sudah diterjemahkan sesuai locale oleh server). */
    heroText?: Partial<HeroText>;
  };
}

export default function HomePage({ initialData }: HomeClientProps) {
  const { t, locale } = useI18n();
  const localePath = useLocalePath();
  const [category, setCategory] = useState("All");
  const [fabricsList, setFabricsList] = useState<any[]>(
    initialData?.fabrics?.length ? initialData.fabrics : MOCK_FABRICS
  );
  const [heroSlides, setHeroSlides] = useState<any[]>(
    initialData?.heroSlides?.length ? initialData.heroSlides : HERO_SLIDES
  );
  const [testimonials, setTestimonials] = useState<any[]>(
    initialData?.testimonials?.length ? initialData.testimonials : TESTIMONIALS
  );
  const [faqs, setFaqs] = useState<any[]>(
    initialData?.faqs?.length ? initialData.faqs : FAQS
  );
  const [stats, setStats] = useState<Array<{ v: string; k: string }>>(
    initialData?.stats?.length
      ? initialData.stats
      : [
          { v: "10.000 m", k: "Kapasitas harian" },
          { v: "18 jenis", k: "Kain siap sublim" },
          { v: "400+", k: "Mitra garmen" },
        ]
  );
  const [b2bCta, setB2bCta] = useState(
    initialData?.b2bCta || {
      title: "Butuh pasokan rutin di atas 5.000 meter per bulan?",
      description: "Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.",
      actionText: "Minta penawaran",
      actionLink: "/contact",
    }
  );
  // Copy hero dari CMS. Kalau kosong, tiap field jatuh ke kamus i18n (t()).
  const [heroText, setHeroText] = useState<Partial<HeroText>>(
    initialData?.heroText || {}
  );

  const [calcFabricId, setCalcFabricId] = useState(
    initialData?.fabrics?.[0]?.id || MOCK_FABRICS[0].id
  );
  // Simulator memakai YARD di UI; seluruh perhitungan harga tetap dalam METER.
  const [calcYards, setCalcYards] = useState(165);
  const calcMeters = yardsToMeters(calcYards) || 1;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Load live data from CMS & Products API (refresh ringan; konten utama sudah SSR)
  useEffect(() => {
    async function loadLiveData() {
      try {
        const [prodRes, cmsRes] = await Promise.all([
          fetch(`/api/products?lang=${locale}`).then((r) => r.json()).catch(() => null),
          fetch(`/api/cms?lang=${locale}`).then((r) => r.json()).catch(() => null),
        ]);

        if (prodRes?.success && prodRes.data?.length > 0) {
          setFabricsList(prodRes.data);
          if (!prodRes.data.some((f: any) => f.id === calcFabricId)) {
            setCalcFabricId(prodRes.data[0].id);
          }
        }

        if (cmsRes?.success && cmsRes.data) {
          if (cmsRes.data.heroSlides?.length > 0) {
            setHeroSlides(cmsRes.data.heroSlides.filter((s: any) => s.isActive !== false));
          }
          if (cmsRes.data.testimonials?.length > 0) {
            setTestimonials(cmsRes.data.testimonials.filter((t: any) => t.isActive !== false));
          }
          if (cmsRes.data.faqs?.length > 0) {
            setFaqs(cmsRes.data.faqs.filter((f: any) => f.isActive !== false));
          }
          const statsRow = cmsRes.data.siteContent?.find((s: any) => s.key === "homepage.stats");
          if (statsRow?.value) {
            try {
              setStats(JSON.parse(statsRow.value));
            } catch {}
          }
          const b2bRow = cmsRes.data.siteContent?.find((s: any) => s.key === "homepage.cta_b2b");
          if (b2bRow?.value) {
            try {
              setB2bCta(JSON.parse(b2bRow.value));
            } catch {}
          }
          const heroRow = cmsRes.data.siteContent?.find((s: any) => s.key === HERO_TEXT_KEY);
          if (heroRow?.value) {
            try {
              const parsed = JSON.parse(heroRow.value);
              if (parsed && typeof parsed === "object") setHeroText(parsed);
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Using default CMS fallbacks:", err);
      }
    }
    loadLiveData();
    // Ulang-fetch konten saat pengguna berganti bahasa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Auto-rotating Hero Image Slider (per-7.5 detik)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (isHeroPaused || heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [isHeroPaused, heroSlides.length]);

  const activeHero = heroSlides[currentHeroIndex] || heroSlides[0] || HERO_SLIDES[0];

  const fabric = fabricsList.find((f) => f.id === calcFabricId) || fabricsList[0] || MOCK_FABRICS[0];
  // Harga disembunyikan (setting terpusat dari portal) — priceTiers dikosongkan
  // oleh server; UI kalkulator menampilkan kalimat RFQ alih-alih angka harga.
  const priceHidden = !fabric.priceTiers || fabric.priceTiers.length === 0;
  const tier: any = priceHidden
    ? null
    : fabric.priceTiers.find((t: any) =>
          t.maxMeters ? calcMeters >= t.minMeters && calcMeters <= t.maxMeters : calcMeters >= t.minMeters
        ) || fabric.priceTiers[0];
  const baseTotal = tier ? fabric.basePricePerMeter * calcMeters : 0;
  const tierTotal = tier ? tier.unitPrice * calcMeters : 0;
  const savings = tier ? baseTotal - tierTotal : 0;
  const discountPct = tier && baseTotal > 0 ? Math.round((savings / baseTotal) * 100) : 0;

  const fabrics = category === "All" ? fabricsList : fabricsList.filter((f) => f.category === category);
  const container = "texora-container";
  const pad2 = (n: number) => String(n).padStart(2, "0");

  // Copy hero: utamakan nilai CMS, fallback ke kamus i18n per field.
  // (Trim supaya field yang dikosongkan admin tidak meninggalkan ruang kosong.)
  const heroCopy = (key: keyof HeroText, i18nKey: string) => {
    const value = heroText[key];
    return typeof value === "string" && value.trim() ? value : t(i18nKey);
  };
  const heroBadge = heroCopy("badge", "hero.badge");
  const heroEyebrow = heroCopy("eyebrow", "hero.eyebrow");
  const heroTitle1 = heroCopy("title1", "hero.t1a");
  const heroTitle2 = heroCopy("title2", "hero.t1b");
  const heroTitle3 = heroCopy("title3", "hero.t1c");
  const heroLead = heroCopy("lead", "hero.lead");
  const heroPoints = [
    heroCopy("badge1", "hero.b1"),
    heroCopy("badge2", "hero.b2"),
    heroCopy("badge3", "hero.b3"),
  ];
  const heroCtaPrint = heroCopy("ctaPrint", "hero.ctaPrint");
  const heroCtaCatalog = heroCopy("ctaCatalog", "hero.ctaCatalog");

  return (
    <div className="overflow-hidden">
      {/* Breadcrumb - membantu navigasi & menghasilkan BreadcrumbList schema */}
      <div className={`${container} pt-5`}>
        <Breadcrumb items={[{ label: t("nav.home") }]} />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Ambient background glows */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/15 blur-[120px]" />
          <div className="absolute top-20 right-0 h-[24rem] w-[24rem] rounded-full bg-amber-600/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgb(var(--brand-400)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--brand-400)) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse at 30% 30%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 30%, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className={`${container} relative pt-6 pb-12 lg:pt-10 lg:pb-16 xl:pt-14 xl:pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="lg:col-span-6 xl:col-span-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 pl-1.5 pr-3.5 py-1 backdrop-blur">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink">
                  <Factory className="h-3 w-3" /> {heroBadge}
                </span>
                <span className="text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-200">
                  {heroEyebrow}
                </span>
              </span>

              <h1 className="mt-5 font-display text-fluid-hero font-bold text-alabaster tracking-tight">
                {heroTitle1}
                <br />
                <em className="animated-gradient-text not-italic font-extrabold">{heroTitle2}</em>
                <br />
                {heroTitle3}
              </h1>
              <p className="mt-4 max-w-lg text-xs sm:text-sm lg:text-[0.92rem] xl:text-base text-slate-300 leading-relaxed">
                {heroLead}
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-300">
                {heroPoints.map((tb, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <Check className="h-3 w-3" />
                    </span>
                    {tb}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href={localePath("/custom-sublimation")}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-3.5 text-xs sm:text-sm font-bold text-ink shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {heroCtaPrint}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={localePath("/catalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-xs sm:text-sm font-semibold text-alabaster backdrop-blur transition-all hover:border-brand-500/60 hover:bg-slate-900"
                >
                  <Layers className="h-4 w-4 text-brand-400" />
                  {heroCtaCatalog}
                </Link>
                <Link
                  href={localePath("/request-quote")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/10 px-6 py-3.5 text-xs sm:text-sm font-bold text-brand-200 transition-all hover:border-brand-300/70 hover:bg-brand-500/20 hover:text-white"
                >
                  <FileText className="h-4 w-4 text-brand-300" />
                  {t("nav.requestQuote")}
                </Link>
              </div>

              <dl className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-3">
                {stats.map((s) => (
                  <div
                    key={s.k}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-3 sm:px-4 sm:py-3.5 backdrop-blur transition-colors hover:border-brand-500/40"
                  >
                    <dt className="font-display text-lg sm:text-xl xl:text-2xl font-bold text-alabaster">{s.v}</dt>
                    <dd className="mt-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-slate-500 leading-tight">{s.k}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            {/* Hero slider composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.15 }}
              className="lg:col-span-6 xl:col-span-7 relative"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
            >
              <div className="relative grid grid-cols-5 gap-3 sm:gap-4 items-start">
                {/* Main image */}
                <div className="col-span-3 relative aspect-[4/5] max-h-[380px] sm:max-h-[460px] lg:max-h-[520px] xl:max-h-[580px] overflow-hidden rounded-3xl border border-white/10 bg-ink/80 shadow-2xl shadow-black/50 ring-1 ring-brand-500/20">
                  {heroSlides.map((slide, idx) => {
                    const isActive = idx === currentHeroIndex;
                    const isFirst = idx === 0;
                    return (
                      <Image
                        key={slide.id || idx}
                        src={slide.mainImage}
                        alt={slide.alt}
                        // Slide pertama = elemen LCP. `priority` membuat Next
                        // mempreload versi teroptimasi (AVIF/WebP, ukuran layar).
                        fill
                        priority={isFirst}
                        sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 36vw, 55vw"
                        quality={80}
                        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-[1400ms] ease-out ${
                          isActive
                            ? "pointer-events-auto z-10 scale-100 opacity-100 blur-0"
                            : "pointer-events-none z-0 scale-105 opacity-0 blur-[6px]"
                        }`}
                      />
                    );
                  })}

                  {/* Gradient & tag overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                      {activeHero.tag}
                    </span>
                  </div>

                  {/* Slider controls */}
                  <div className="absolute inset-x-3 bottom-4 sm:inset-x-4 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((slide, idx) => (
                        <button
                          key={slide.id || idx}
                          onClick={() => setCurrentHeroIndex(idx)}
                          aria-label={`Lihat gambar ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentHeroIndex ? "w-7 bg-brand-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/50 p-0.5 backdrop-blur-md">
                      <button
                        onClick={() =>
                          setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                        }
                        className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Gambar sebelumnya"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-1 font-mono text-[10px] text-white/70">
                        {pad2(currentHeroIndex + 1)}/{pad2(heroSlides.length)}
                      </span>
                      <button
                        onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                        className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Gambar berikutnya"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-white/10 overflow-hidden">
                    <motion.div
                      key={`progress-${currentHeroIndex}-${isHeroPaused}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: isHeroPaused ? 0 : 7.5, ease: "linear" }}
                      className={`h-full ${isHeroPaused ? "bg-amber-400" : "bg-brand-400"}`}
                    />
                  </div>
                </div>

                {/* Secondary column */}
                <div className="col-span-2 flex flex-col gap-3 sm:gap-4 pt-8 sm:pt-12">
                  <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-ink/80 shadow-xl shadow-black/40">
                    {heroSlides.map((slide, idx) => {
                      const isActive = idx === currentHeroIndex;
                      return (
                        <Image
                          key={slide.id || idx}
                          src={slide.secondaryImage}
                          alt="Detail anyaman & tekstur kain"
                          fill
                          sizes="(min-width: 1024px) 17vw, 36vw"
                          quality={75}
                          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-[1400ms] ease-out ${
                            isActive
                              ? "pointer-events-auto z-10 scale-100 opacity-100 blur-0"
                              : "pointer-events-none z-0 scale-105 opacity-0 blur-[6px]"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHero.caption}
                      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
                      className="rounded-2xl border border-brand-500/25 bg-slate-900/80 p-3.5 sm:p-4 shadow-lg backdrop-blur-md"
                    >
                      <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-400">
                        <Quote className="h-3 w-3" /> Catatan pabrik
                      </p>
                      <p className="mt-1.5 font-display text-xs sm:text-sm lg:text-[0.95rem] italic leading-snug text-alabaster">
                        {activeHero.caption}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Floating trust badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.6 }}
                  className="hidden sm:flex absolute -left-4 lg:-left-8 top-10 z-40 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/85 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <BadgeCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-white">{t("home.badge.oeko.title")}</p>
                    <p className="text-[10px] text-slate-400">{t("home.badge.oeko.sub")}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.75 }}
                  className="hidden md:flex absolute -bottom-5 right-4 lg:right-10 z-40 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/85 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                    <Gauge className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-white">{t("home.badge.capacity.title")}</p>
                    <p className="text-[10px] text-slate-400">{t("home.badge.capacity.sub")}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="relative border-y border-slate-800/80 bg-slate-950/40 py-4 overflow-hidden" aria-hidden="true">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0f172a] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0f172a] to-transparent" />
        <div className="marquee-track gap-10 items-center text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          {[...Array(2)].flatMap((_, r) =>
            ["Dryfit Milano", "Voal Ultrafine", "Satin Silk", "Scuba Neoprene", "Spandex Lycra", "Canvas 8oz", "Oeko-Tex Standard 100", "Rotary Heatpress"].map(
              (item, i) => (
                <span key={`${r}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
                  {item}
                  <Sparkles className="h-3 w-3 text-brand-500" />
                </span>
              )
            )
          )}
        </div>
      </div>

      {/* ── VALUE PROPOSITIONS ───────────────────────────────────────────── */}
      <section aria-labelledby="value-prop-heading" className={`${container} section-pad`}>
        <h2 id="value-prop-heading" className="sr-only">
          {t("home.valueHeading")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_PROPS.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-5 transition-all hover:-translate-y-1 hover:border-brand-500/40"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 font-display text-base xl:text-lg font-bold text-alabaster">
                  {t(`home.${v.key}.title`) || v.title}
                </h3>
                <p className="relative mt-1.5 text-xs leading-relaxed text-slate-400">
                  {t(`home.${v.key}.body`) || v.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CRAFTSMANSHIP PROCESS (Clean straight-line light canvas) ─────── */}
      <section className="surface-alabaster border-y border-slate-200">
        <div className={`${container} section-pad`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              light
              eyebrow={t("home.craftEyebrow")}
              title={t("home.craftTitle")}
              desc={t("home.craftDesc")}
            />
            <Link
              href={localePath("/custom-sublimation")}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-ink px-5 py-3 text-xs font-bold text-alabaster transition-colors hover:bg-slate-800"
            >
              {t("home.craftCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ol className="mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CRAFT_STEPS.map((s, i) => (
              <motion.li
                key={s.no}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-slate-300/50"
              >
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-[5.5rem] font-black leading-none text-slate-100 transition-colors group-hover:text-brand-100">
                  {s.no}
                </span>
                <div className="relative">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-sm font-bold text-white shadow-md shadow-brand-600/30">
                    {s.no}
                  </span>
                  <h3 className="mt-4 font-display text-lg xl:text-xl font-bold text-ink">
                    {t(`home.${s.key}.title`) || s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t(`home.${s.key}.body`) || s.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CATALOG ──────────────────────────────────────────────────────── */}
      <section className={`${container} section-pad`}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={t("home.catalogEyebrow")}
            title={t("home.catalogTitle")}
            desc={t("home.catalogDesc")}
          />
          <div
            className="flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1 backdrop-blur"
            role="tablist"
            aria-label="Filter kategori kain"
          >
            {[
              { v: "All", k: "cat.all" },
              { v: "Sportswear", k: "cat.sport" },
              { v: "Fashion & Hijab", k: "cat.fashion" },
              { v: "Home Living", k: "cat.home" },
              { v: "Merchandise & Flag", k: "cat.merch" },
            ].map((c) => (
              <button
                key={c.v}
                role="tab"
                aria-selected={category === c.v}
                onClick={() => setCategory(c.v)}
                className={`relative rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  category === c.v ? "text-ink" : "text-slate-400 hover:text-white"
                }`}
              >
                {category === c.v && (
                  <motion.span
                    layoutId="catalog-pill"
                    className="absolute inset-0 rounded-xl bg-brand-500 shadow-md shadow-brand-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t(c.k)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fabrics.map((f, i) => (
            <FabricSpecCard key={f.id} fabric={f} index={i} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={localePath("/catalog")}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-xs font-semibold text-alabaster transition-all hover:border-brand-500/60"
          >
            {t("home.exploreAll")}
            <ArrowRight className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── TIER PRICING CALCULATOR ──────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-20 xl:pb-24`}>
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 sm:p-8 lg:p-10 shadow-2xl">
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-7 space-y-7">
              <SectionHeading
                eyebrow={t("home.priceEyebrow")}
                title={t("home.priceTitle")}
              />

              <fieldset>
                <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("home.calcStep1")}
                </legend>
                <div className="grid max-h-64 grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1.5">
                  {fabricsList.map((f) => {
                    const active = calcFabricId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setCalcFabricId(f.id)}
                        className={`relative rounded-xl border px-3.5 py-3 text-left text-xs transition-all ${
                          active
                            ? "border-brand-500 bg-brand-500/10 text-alabaster ring-1 ring-brand-500/40"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-brand-500/40 hover:text-slate-200"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-ink">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <span className="block truncate pr-5 font-semibold">{f.name}</span>
                        <span className="text-[11px] text-slate-500">{f.variants[0]?.gsm} GSM</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label htmlFor="meters" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("home.calcStep2")}
                  </label>
                  <div className="flex items-baseline gap-1 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 focus-within:border-brand-500">
                    <input
                      id="meters"
                      type="number"
                      min={1}
                      max={5000}
                      value={calcYards}
                      onChange={(e) => setCalcYards(Math.max(1, Number(e.target.value)))}
                      className="w-20 bg-transparent text-right font-display text-xl font-bold text-alabaster focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">yd</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2200}
                  step={5}
                  value={calcYards}
                  onChange={(e) => setCalcYards(Number(e.target.value))}
                  className="w-full accent-brand-500"
                  aria-label="Geser panjang kain"
                />
                <div className="mt-4">
                  {priceHidden ? (
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-[11px] text-slate-300 italic leading-relaxed">
                      {t("catalog.priceHidden")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {fabric.priceTiers.map((t: any) => {
                        const active = t.id === tier.id;
                        return (
                          <div
                            key={t.id}
                            className={`rounded-xl border px-3.5 py-3 transition-all ${
                              active
                                ? "border-brand-400 bg-gradient-to-br from-brand-500 to-brand-600 text-ink shadow-lg shadow-brand-500/25"
                                : "border-slate-800 bg-slate-950/40 text-slate-400"
                            }`}
                          >
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {t.maxMeters ? `${metersToYards(t.minMeters)}–${metersToYards(t.maxMeters)} yd` : `≥ ${metersToYards(t.minMeters)} yd`}
                            </div>
                            <div className={`mt-1 text-sm font-bold ${active ? "text-ink" : "text-alabaster"}`}>
                              {formatRupiah(pricePerYard(t.unitPrice))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="h-full rounded-2xl border border-brand-500/25 bg-slate-950/70 p-6 sm:p-7 backdrop-blur flex flex-col">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Calculator className="h-4 w-4 text-brand-400" />
                  {t("home.calc.estimate")}
                </div>
                {priceHidden ? (
                  <p className="mt-3 text-sm text-slate-300 italic leading-relaxed">
                    {t("catalog.priceHidden")}
                  </p>
                ) : (
                  <>
                    <motion.p
                      key={tierTotal}
                      initial={{ opacity: 0.4, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="mt-3 font-display text-fluid-price font-bold text-alabaster"
                    >
                      {formatRupiah(tierTotal)}
                    </motion.p>
                    {discountPct > 0 && (
                      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                        <Percent className="h-3 w-3" /> {t("home.calc.savings")} {discountPct}% · {formatRupiah(savings)}
                      </span>
                    )}
                  </>
                )}
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                    <dt className="text-slate-400">{t("home.calc.fabric")}</dt>
                    <dd className="text-right font-medium text-alabaster">{fabric.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                    <dt className="text-slate-400">{t("home.calc.volume")}</dt>
                    <dd className="font-medium text-alabaster">{formatNumber(calcYards)} yd ≈ {formatNumber(calcMeters)} m</dd>
                  </div>
                  {!priceHidden && (
                    <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                      <dt className="text-slate-400">{t("home.calc.lockedPrice")}</dt>
                      <dd className="font-semibold text-brand-300">≈ {formatRupiah(pricePerYard(tier.unitPrice))} / yd</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-auto pt-6 flex flex-col gap-2.5">
                  <Link
                    href={`/custom-sublimation?fabric=${fabric.id}&meters=${calcMeters}`}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-3.5 text-sm font-bold text-ink shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                  >
                    {t("home.calc.printCta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={localePath(`/catalog/${fabric.slug}`)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3.5 text-sm font-semibold text-alabaster transition-colors hover:border-brand-500/60"
                  >
                    {t("home.calc.buyPlain")}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Clean straight-line light canvas) ───────────────── */}
      <section className="surface-alabaster border-y border-slate-200">
        <div className={`${container} section-pad`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading light eyebrow={t("home.testiEyebrow")} title={t("home.testiTitle")} />
            <div className="flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="flex text-brand-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-semibold text-ink">4.9/5</span>
              <span className="text-xs text-slate-500">{t("home.testi.avg")}</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {testimonials.map((t, i) => {
              const initials = (t.name || "")
                .split(" ")
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("");
              return (
                <motion.figure
                  key={t.name || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-slate-300/50"
                >
                  <div>
                    <Quote className="h-8 w-8 text-brand-500/30" />
                    <div className="mt-2 flex text-brand-500">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-3 font-display text-lg xl:text-xl italic leading-snug text-ink">
                      “{t.quote}”
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
                      {initials}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t.name}</span>
                      <span className="block text-xs text-slate-500">{t.org}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${container} section-pad`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-4 space-y-6">
            <SectionHeading
              eyebrow={t("home.faqEyebrow")}
              title={t("home.faqTitle")}
              desc={t("home.faqDesc")}
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-base font-bold text-alabaster">{t("home.faqHelpTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {t("home.faqHelpBody")}
              </p>
              <Link
                href={localePath("/contact")}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                {t("home.faqHelpCta")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {faqs.map((f: any, i) => {
              const qText = f.q || f.question;
              const aText = f.a || f.answer;
              const open = openFaq === i;
              return (
                <div
                  key={qText || i}
                  className={`rounded-2xl border transition-colors ${
                    open ? "border-brand-500/40 bg-slate-900/80" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 sm:px-6 text-left"
                  >
                    <span className="flex items-center gap-4">
                      <span
                        className={`hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${
                          open ? "bg-brand-500 text-ink" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {pad2(i + 1)}
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-alabaster">{qText}</h3>
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                        open ? "rotate-180 border-brand-500 bg-brand-500/10 text-brand-400" : "border-slate-700 text-slate-400"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden"
                  >
                    <RichContent
                      html={aText}
                      className="px-5 pb-5 sm:pl-[4.5rem] sm:pr-16 text-sm leading-relaxed text-slate-400"
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={`${container} pb-16 lg:pb-24`}>
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-900/60 via-slate-900 to-slate-950 px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgb(var(--brand-300)) 0 1px, transparent 1px 14px)",
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-200">
                <BadgeCheck className="h-3.5 w-3.5" /> {t("home.b2b.badge")}
              </span>
              <h2 className="mt-4 font-display text-fluid-h2 font-bold text-alabaster">{b2bCta.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">{b2bCta.description}</p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                href={b2bCta.actionLink || "/contact"}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-7 py-4 text-sm font-bold text-ink shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-0.5"
              >
                {b2bCta.actionText || "Minta penawaran"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold text-alabaster backdrop-blur transition-colors hover:bg-white/10"
              >
                {t("home.b2b.register")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PETA LOKASI KANTOR & PABRIK (DIATAS FOOTER) ───────────────────── */}
      <section className={`${container} pb-16 lg:pb-24`}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-200">
                <MapPin className="h-3.5 w-3.5 text-brand-400" /> {t("map.headingTag", "Lokasi Kantor & Workshop")}
              </span>
              <h2 className="mt-3 font-display text-fluid-h2 font-bold text-alabaster">
                {t("map.headingTitle", "Kunjungi Fasilitas Produksi Kami")}
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t("map.headingDesc", "Konsultasi langsung pemilihan bahan kain, kalibrasi warna ICC printing, dan peninjauan workshop mesin cetak sublimasi skala industri di Jakarta Utara.")}
            </p>
          </div>

          <CompanyLocationMap />
        </div>
      </section>
    </div>
  );
}
