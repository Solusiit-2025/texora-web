"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { 
  Search, 
  SlidersHorizontal, 
  Layers, 
  ChevronRight, 
  Check, 
  Sparkles,
  Palette,
  Info
} from "lucide-react";

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGsmFilter, setSelectedGsmFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("default");

  const filteredFabrics = MOCK_FABRICS.filter((fabric) => {
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
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Master Tekstil & Bahan Siap Sublimasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Katalog Kain Industri
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Koleksi terlengkap 18 jenis kain poliester industri siap cetak sublimasi langsung dengan kontrol kualitas OEKO-TEX, daya serap pigmen tinggi, dan ketahanan suhu press 220°C.
          </p>
        </div>

        <Link
          href="/custom-sublimation"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Palette className="w-4 h-4" />
          <span>Upload File & Cetak Kustom</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kain (misal: dryfit, voal, satin, canvas, scuba, oxford)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {["All", "Sportswear", "Fashion & Hijab", "Home Living", "Merchandise & Flag"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat === "All" ? "Semua (18)" : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filter & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Menampilkan <strong className="text-white">{filteredFabrics.length}</strong> jenis kain</span>
            {selectedCategory !== "All" && (
              <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px]">
                Kategori: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                Cari: "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* GSM Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1 hidden sm:inline text-[11px]">Gramatur:</span>
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
              <span className="text-slate-400 text-[11px] hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500"
              >
                <option value="default">Rekomendasi Texora</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="stock-desc">Stok Terbanyak</option>
                <option value="gsm-asc">Gramatur Ringan</option>
                <option value="gsm-desc">Gramatur Tebal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fabric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric) => {
          const defaultVariant = fabric.variants[0];
          const lowestTierPrice = fabric.priceTiers[fabric.priceTiers.length - 1].unitPrice;

          return (
            <div
              key={fabric.id}
              className="rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={fabric.thumbnailUrl}
                    alt={fabric.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                      {fabric.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                      {defaultVariant?.gsm} GSM
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold backdrop-blur-md">
                      Stok: {formatNumber(defaultVariant?.stockMeters || 0)} m
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
                      {fabric.description}
                    </p>
                  </div>

                  {/* Technical Attributes */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Komposisi:</span>
                      <span className="font-semibold text-slate-200">{fabric.composition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Anyaman / Rajut:</span>
                      <span className="font-semibold text-slate-200">{fabric.weaveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lebar Standar:</span>
                      <span className="font-semibold text-slate-200">{fabric.widthInch} Inch</span>
                    </div>
                  </div>

                  {/* Volume Tier Quick Peek */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Harga Bertingkat (Tier Pricing):</span>
                      <span className="text-accent-cyan font-normal lowercase">per meter lari</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                      {fabric.priceTiers.slice(0, 2).map((tier) => (
                        <div key={tier.id} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                          <span className="text-slate-400 text-[10px] block">
                            {tier.maxMeters ? `${tier.minMeters}-${tier.maxMeters}m` : `≥${tier.minMeters}m`}
                          </span>
                          <span className="font-bold text-slate-200">{formatRupiah(tier.unitPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Harga Terbaik</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    {formatRupiah(lowestTierPrice)}
                    <span className="text-xs text-slate-400 font-normal"> /m</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/catalog/${fabric.slug}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Spesifikasi
                  </Link>
                  <Link
                    href={`/custom-sublimation?fabric=${fabric.id}`}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                  >
                    <span>Cetak</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredFabrics.length === 0 && (
        <div className="text-center py-16 p-8 rounded-2xl glass-panel border border-slate-800">
          <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Tidak ada kain yang cocok</h3>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter gramatur kain Anda.</p>
        </div>
      )}

    </div>
  );
}
