"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { 
  ArrowLeft, 
  Palette, 
  ShoppingCart, 
  ShieldCheck, 
  Award, 
  Check, 
  Zap, 
  HelpCircle,
  Truck,
  Layers,
  FileCheck
} from "lucide-react";

export default function FabricDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const fabric = MOCK_FABRICS.find((f) => f.slug === slug) || MOCK_FABRICS[0];
  
  const [selectedVariantId, setSelectedVariantId] = useState(fabric.variants[0]?.id || "");
  const [orderMeters, setOrderMeters] = useState<number>(100);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = fabric.variants.find(v => v.id === selectedVariantId) || fabric.variants[0];

  // Calculate pricing based on tiers
  const activeTier = fabric.priceTiers.find((tier) => {
    if (tier.maxMeters) {
      return orderMeters >= tier.minMeters && orderMeters <= tier.maxMeters;
    }
    return orderMeters >= tier.minMeters;
  }) || fabric.priceTiers[0];

  const subtotal = activeTier.unitPrice * orderMeters;

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      router.push("/cart");
    }, 800);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10">
      
      {/* Back button */}
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Kain</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image preview & Tech badges */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={fabric.thumbnailUrl}
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                {fabric.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                {selectedVariant?.gsm} GSM
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md flex items-center justify-between text-xs">
              <span className="text-slate-300">Dukungan Kalibrasi Warna:</span>
              <span className="font-bold text-accent-cyan">CMYK & Fluorescent Sublimation</span>
            </div>
          </div>

          {/* Industrial Certifications */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-white">OEKO-TEX</div>
              <div className="text-[10px] text-slate-400">Bebas Zat Berbahaya</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Zap className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
              <div className="font-bold text-white">Heatpress 215°C</div>
              <div className="text-[10px] text-slate-400">Anti-Mengkerut & Gosong</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Truck className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <div className="font-bold text-white">Roll Waterproof</div>
              <div className="text-[10px] text-slate-400">Packing Plastik Tebal</div>
            </div>
          </div>
        </div>

        {/* Right Column: Specs, Volume Tier Calculator & Order Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
              Spesifikasi Pabrik Tekstil
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">
              {fabric.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {fabric.description}
            </p>
          </div>

          {/* Variant Selector (GSM Options) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Pilih Varian Gramatur (GSM):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fabric.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    selectedVariantId === variant.id
                      ? "bg-brand-600/30 border-brand-500 text-white shadow-lg"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-sm text-white">{variant.gsm} GSM</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{variant.colorName}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    Stok Tersedia: {formatNumber(variant.stockMeters)} m
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Tier Table */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Tabel Harga Bertingkat (Tier Pricing):</span>
              <span className="text-accent-cyan font-normal text-[11px] lowercase">per meter lari</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {fabric.priceTiers.map((tier) => {
                const isSelectedTier = activeTier.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelectedTier
                        ? "bg-accent-cyan/15 border-accent-cyan text-white shadow-md shadow-accent-cyan/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {tier.maxMeters ? `${tier.minMeters} - ${tier.maxMeters} m` : `≥ ${tier.minMeters} m`}
                    </div>
                    <div className={`font-mono font-bold mt-1 text-sm ${isSelectedTier ? "text-accent-cyan" : "text-slate-200"}`}>
                      {formatRupiah(tier.unitPrice)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meter Quantity Slider & Input */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Panjang Pesanan:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={orderMeters}
                  onChange={(e) => setOrderMeters(Math.max(1, Number(e.target.value)))}
                  className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm text-right focus:outline-none focus:border-brand-500"
                />
                <span className="text-xs text-slate-400 font-semibold">Meter</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={1500}
              step={10}
              value={orderMeters}
              onChange={(e) => setOrderMeters(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Subtotal Bahan:</span>
                <span className="text-2xl font-black text-white font-mono">
                  {formatRupiah(subtotal)}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ({formatRupiah(activeTier.unitPrice)} / m × {formatNumber(orderMeters)} m)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAddToCart}
                  className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isAdded ? "Ditambahkan!" : "Pesan Bahan Saja"}</span>
                </button>

                <Link
                  href={`/custom-sublimation?fabric=${fabric.id}&meters=${orderMeters}`}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-accent-cyan border border-accent-cyan/40 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  <span>Cetak Desain Sublimasi</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Full Technical Specifications Sheet */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Tabel Parameter Teknis Tekstil:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
              <div><span className="text-slate-500">Komposisi:</span> {fabric.composition}</div>
              <div><span className="text-slate-500">Lebar Kain:</span> {fabric.widthInch}&quot; (~{Math.round(fabric.widthInch * 2.54)} cm)</div>
              <div><span className="text-slate-500">Struktur Benang:</span> {fabric.weaveType}</div>
              <div><span className="text-slate-500">Uji Susut Heatpress:</span> &lt; 1.5% @ 210°C</div>
              <div><span className="text-slate-500">Tingkat Penetrasi:</span> Sisi Depan 100%, Belakang 75-85%</div>
              <div><span className="text-slate-500">Sertifikat:</span> OEKO-TEX Standard 100 Class 1</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
