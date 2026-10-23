"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { metersToYards, pricePerYard } from "@/lib/units";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { htmlToPlainText } from "@/lib/sanitize";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import type { StorefrontProduct } from "@/lib/storefront-data";
import { 
  Search, 
  SlidersHorizontal, 
  Layers, 
  ChevronRight, 
  Check, 
  Sparkles,
  Palette,
  Info,
  FileText,
  Download
} from "lucide-react";

interface CatalogClientProps {
  /** Produk hasil SSR (sudah ada di HTML awal untuk crawler). */
  initialFabrics: StorefrontProduct[];
  /** true saat admin portal menyembunyikan harga (setting terpusat). */
  hidePrices?: boolean;
}

export default function CatalogClient({ initialFabrics, hidePrices = false }: CatalogClientProps) {
  const { t, locale } = useI18n();
  const localePath = useLocalePath();
  const [fabrics, setFabrics] = useState<StorefrontProduct[]>(initialFabrics);
  const [loading, setLoading] = useState(initialFabrics.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGsmFilter, setSelectedGsmFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("default");

  // Refresh ringan di background; konten utama sudah SSR sehingga tidak ada
  // layout shift (CLS) dan crawler langsung melihat isi katalog.
  useEffect(() => {
    fetch(`/api/products?lang=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data?.length > 0) {
          setFabrics(data.data);
        }
      })
      .catch((err) => console.warn("Gagal memuat katalog:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch = 
      fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.composition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || fabric.category === selectedCategory;

    let matchesGsm = true;
    const gsm = fabric.variants[0]?.gsm || 0;
    if (selectedGsmFilter === "Light") matchesGsm = gsm < 120;
    else if (selectedGsmFilter === "Medium") matchesGsm = gsm >= 120 && gsm <= 200;
    else if (selectedGsmFilter === "Heavy") matchesGsm = gsm > 200;

    return matchesSearch && matchesCategory && matchesGsm;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.basePricePerMeter - b.basePricePerMeter;
    if (sortBy === "price-desc") return b.basePricePerMeter - a.basePricePerMeter;
    if (sortBy === "stock-desc") {
      const stockA = a.variants.reduce((sum, v) => sum + v.stockMeters, 0);
      const stockB = b.variants.reduce((sum, v) => sum + v.stockMeters, 0);
      return stockB - stockA;
    }
    if (sortBy === "gsm-asc") return (a.variants[0]?.gsm || 0) - (b.variants[0]?.gsm || 0);
    if (sortBy === "gsm-desc") return (b.variants[0]?.gsm || 0) - (a.variants[0]?.gsm || 0);
    return 0;
  });

  return (
    <article className="texora-container py-10 space-y-8">
      
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t("nav.catalog") }]} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>{t("catalog.eyebrow")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t("catalog.title")}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {t("catalog.desc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Link
            href={localePath("/request-quote?source=catalog")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/25 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{t("catalog.quoteCta")}</span>
          </Link>
          <a
            href="/api/catalog/pdf"
            download
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200 font-semibold text-xs hover:border-brand-500/50 hover:text-white transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>{t("catalog.pdfCta")}</span>
          </a>
          <Link
            href={localePath("/custom-sublimation")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span>{t("catalog.upload")}</span>
          </Link>
        </div>
      </div>

      {/* Link ke landing page kategori (SEO landing pages) */}
      <nav
        aria-label="Panduan kategori kain"
        className="flex flex-wrap items-center gap-2 text-xs"
      >
        <span className="text-slate-500 font-semibold">{t("catalog.panduan")}</span>
        {CATEGORY_SEO.map((c) => (
          <Link
            key={c.slug}
            href={localePath(`/kategori/${c.slug}`)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-brand-300 hover:border-brand-500/40 transition-colors font-medium"
          >
            {c.name}
          </Link>
        ))}
        <Link
          href={localePath("/kategori")}
          className="px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-300 hover:bg-brand-500/25 transition-colors font-semibold"
        >
          {t("catalog.allKat")} &rarr;
        </Link>
      </nav>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("catalog.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { v: "All", k: "cat.all" },
              { v: "Sportswear", k: "cat.sport" },
              { v: "Fashion & Hijab", k: "cat.fashion" },
              { v: "Home Living", k: "cat.home" },
              { v: "Merchandise & Flag", k: "cat.merch" },
            ].map((cat) => (
              <button
                key={cat.v}
                onClick={() => setSelectedCategory(cat.v)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.v
                    ? "bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {t(cat.k)} {cat.v === "All" ? `(${fabrics.length})` : ""}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filter & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>{t("catalog.showing")} <strong className="text-white">{filteredFabrics.length}</strong> {t("catalog.jenis")}</span>
            {selectedCategory !== "All" && (
              <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px]">
                {t("catalog.category")} {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {t("catalog.searchQ")} "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* GSM Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1 hidden sm:inline text-[11px]">{t("catalog.gsm")}</span>
              {[
                { label: "Semua", val: "All" },
                { label: "<120 GSM", val: "Light" },
                { label: "120-200", val: "Medium" },
                { label: ">200 GSM", val: "Heavy" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setSelectedGsmFilter(item.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                    selectedGsmFilter === item.val
                      ? "bg-accent-violet text-white font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-400 text-[11px] hidden sm:inline">{t("catalog.sort")}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500"
              >
                <option value="default">{t("catalog.sortRec")}</option>
                <option value="price-asc">{t("catalog.sortAsc")}</option>
                <option value="price-desc">{t("catalog.sortDesc")}</option>
                <option value="stock-desc">{t("catalog.sortStock")}</option>
                <option value="gsm-asc">{t("catalog.sortLight")}</option>
                <option value="gsm-desc">{t("catalog.sortHeavy")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fabric Cards Grid */}
      <section aria-labelledby="daftar-kain-heading">
        <h2 id="daftar-kain-heading" className="sr-only">
          Daftar Kain Siap Sublimasi
        </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
              <div className="aspect-[16/10] bg-slate-900/60 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 rounded-lg bg-slate-900/60 animate-pulse" />
                <div className="h-4 w-full rounded-lg bg-slate-900/60 animate-pulse" />
                <div className="h-16 rounded-xl bg-slate-900/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric) => {
          const defaultVariant = fabric.variants[0];
          // Kalau harga disembunyikan (priceTiers kosong), nilai ini tak dipakai render.
          const lowestTierPrice =
            fabric.priceTiers?.length > 0
              ? fabric.priceTiers[fabric.priceTiers.length - 1].unitPrice
              : 0;

          return (
            <article
              key={fabric.id}
              className="rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Thumbnail / galeri gambar (pindah manual via klik) */}
                <div className="relative">
                  {fabric.images && fabric.images.length > 1 ? (
                    <ImageCarousel
                      images={fabric.images}
                      alt={`${fabric.name} — kain ${fabric.composition} siap sublimasi, lebar ${fabric.widthInch} inci, kategori ${fabric.category}`}
                      aspect="16/10"
                      auto={false}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      <Image
                        src={fabric.thumbnailUrl}
                        alt={`${fabric.name} — kain ${fabric.composition} siap sublimasi, lebar ${fabric.widthInch} inci, kategori ${fabric.category}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5 z-20">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                      {fabric.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                      {defaultVariant?.gsm} GSM
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold backdrop-blur-md">
                      {t("catalog.stock")} {formatNumber(defaultVariant?.stockMeters || 0)} m
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-accent-cyan transition-colors">
                      {fabric.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {htmlToPlainText(fabric.description, 160)}
                    </p>
                  </div>

                  {/* Technical Attributes */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("catalog.comp")}</span>
                      <span className="font-semibold text-slate-200">{fabric.composition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("catalog.weave")}</span>
                      <span className="font-semibold text-slate-200">{fabric.weaveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("catalog.width")}</span>
                      <span className="font-semibold text-slate-200">{fabric.widthInch} Inch</span>
                    </div>
                  </div>

                  {/* Volume Tier Quick Peek */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>{t("catalog.tier")}</span>
                      {!hidePrices && (
                        <span className="text-accent-cyan font-normal lowercase">{t("catalog.perMeter")}</span>
                      )}
                    </div>
                    {hidePrices ? (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic leading-relaxed">
                        {t("catalog.priceHidden")}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                        {fabric.priceTiers.slice(0, 2).map((tier) => (
                          <div key={tier.id} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">
                              {tier.maxMeters ? `${metersToYards(tier.minMeters)}–${metersToYards(tier.maxMeters)} yd` : `≥${metersToYards(tier.minMeters)} yd`}
                            </span>
                            <span className="font-bold text-slate-200">{formatRupiah(pricePerYard(tier.unitPrice))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                <div>
                  {hidePrices ? (
                    <span className="text-[11px] text-slate-400 italic">
                      {t("catalog.priceHidden")}
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">{t("catalog.best")}</span>
                      <span className="text-base font-extrabold text-white font-mono">
                        {formatRupiah(lowestTierPrice)}
                        <span className="text-xs text-slate-400 font-normal"> /m</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={localePath(`/request-quote?product=${fabric.slug}&source=catalog`)}
                    title={t("catalog.quoteCta")}
                    aria-label={t("catalog.quoteCta")}
                    prefetch={false}
                    className="px-2.5 py-2 rounded-xl border border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/25 hover:text-white text-brand-200 transition-all flex items-center"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={localePath(`/catalog/${fabric.slug}`)}
                    prefetch={false}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {t("catalog.spec")}
                  </Link>
                  <Link
                    href={localePath(`/custom-sublimation?fabric=${fabric.id}`)}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                  >
                    <span>{t("catalog.print")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </article>
          );
        })}
      </div>
      )}

      {filteredFabrics.length === 0 && !loading && (
        <div className="text-center py-16 p-8 rounded-2xl glass-panel border border-slate-800">
          <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">{t("catalog.emptyT")}</h3>
          <p className="text-xs text-slate-400 mt-1">{t("catalog.emptyD")}</p>
        </div>
      )}
      </section>

    </article>
  );
}
