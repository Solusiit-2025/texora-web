"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import { 
  UploadCloud, 
  Layers, 
  Palette, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Repeat, 
  Sliders, 
  FileText, 
  ShoppingCart, 
  Sparkles, 
  Cpu,
  Info
} from "lucide-react";

export default function CustomSublimationPage() {
  const router = useRouter();

  // Selected Fabric & Variant
  const [selectedFabricId, setSelectedFabricId] = useState(MOCK_FABRICS[0].id);
  const activeFabric = MOCK_FABRICS.find(f => f.id === selectedFabricId) || MOCK_FABRICS[0];

  // Uploaded artwork state
  const [artworkFile, setArtworkFile] = useState<{
    name: string;
    sizeMb: number;
    dpi: number;
    widthCm: number;
    heightCm: number;
    previewUrl: string;
  } | null>({
    name: "Phoenix_Esport_Jersey_AllOver_Pattern.ai",
    sizeMb: 42.5,
    dpi: 300,
    widthCm: 152,
    heightCm: 100,
    previewUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
  });

  // Simulator controls
  const [patternMode, setPatternMode] = useState<"tile" | "single" | "roll">("tile");
  const [tileScale, setTileScale] = useState<number>(3);
  const [requiredMeters, setRequiredMeters] = useState<number>(100);
  const [proofApproved, setProofApproved] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sublimation service fee per meter
  const SUBLIMATION_PRINT_FEE_PER_METER = 18000;

  // Active fabric tier price
  const activeTier = activeFabric.priceTiers.find((tier) => {
    if (tier.maxMeters) {
      return requiredMeters >= tier.minMeters && requiredMeters <= tier.maxMeters;
    }
    return requiredMeters >= tier.minMeters;
  }) || activeFabric.priceTiers[0];

  const fabricCostTotal = activeTier.unitPrice * requiredMeters;
  const printingCostTotal = SUBLIMATION_PRINT_FEE_PER_METER * requiredMeters;
  const grandTotal = fabricCostTotal + printingCostTotal;

  // Mock upload trigger
  const handleSimulateUpload = (sampleIndex: number) => {
    if (sampleIndex === 1) {
      setArtworkFile({
        name: "Geometric_Tribal_Sport_Vector.pdf",
        sizeMb: 18.2,
        dpi: 300,
        widthCm: 76,
        heightCm: 76,
        previewUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
      });
    } else {
      setArtworkFile({
        name: "Monogram_Botanical_Hijab_Voal.tiff",
        sizeMb: 85.0,
        dpi: 240,
        widthCm: 115,
        heightCm: 115,
        previewUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80",
      });
    }
  };

  // Baca param masuk dari landing page ("Cetak dengan kain ini")
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fabricId = params.get("fabric");
    const meters = params.get("meters");
    if (fabricId && MOCK_FABRICS.some((f) => f.id === fabricId)) {
      setSelectedFabricId(fabricId);
    }
    if (meters) {
      setRequiredMeters(Math.max(1, Number(meters)));
    }
  }, []);

  const handleCheckout = () => {
    setIsSubmitting(true);
    addToCart({
      fabricName: activeFabric.name,
      gsm: activeFabric.variants[0]?.gsm ?? 0,
      widthInch: activeFabric.widthInch,
      meters: requiredMeters,
      unitPrice: activeTier.unitPrice,
      sublimationPrintFeePerMeter: SUBLIMATION_PRINT_FEE_PER_METER,
      customDesignTitle: artworkFile?.name,
      customDesignDpi: artworkFile?.dpi,
    });
    setTimeout(() => {
      router.push("/cart");
    }, 800);
  };

  return (
    <div className="texora-container py-10 space-y-10">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Alat Bantu Cetak Sublimasi Digital & Visualizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Kustom Sublimasi & Simulator Pola Kain
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Unggah file artwork Anda (AI, PDF, TIFF, PNG beresolusi tinggi), uji keterbacaan DPI, dan simulasikan pengulangan motif (*seamless pattern repeat*) pada lebar kain fisik secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">DPI Minimal Industri:</span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
            ≥ 150 - 300 DPI
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Visualizer Canvas & Simulator Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="rounded-2xl glass-panel border border-slate-800 p-5 shadow-2xl relative overflow-hidden">
            
            {/* Canvas Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Pratinjau Mockup Tekstil
                </span>
                <span className="text-[11px] text-slate-400">
                  (Lebar Bahan: {activeFabric.widthInch}&quot; / ~{Math.round(activeFabric.widthInch * 2.54)} cm)
                </span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setPatternMode("tile")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    patternMode === "tile" ? "bg-brand-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Repeat Tile (Seamless)
                </button>
                <button
                  onClick={() => setPatternMode("single")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    patternMode === "single" ? "bg-brand-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Single Artwork
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              
              {artworkFile ? (
                patternMode === "tile" ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${artworkFile.previewUrl})`,
                      backgroundSize: `${100 / tileScale}%`,
                      backgroundRepeat: "repeat",
                    }}
                  />
                ) : (
                  <div className="relative max-h-full max-w-full p-4 flex items-center justify-center">
                    <img
                      src={artworkFile.previewUrl}
                      alt={artworkFile.name}
                      className="max-h-[300px] object-contain shadow-2xl rounded border border-white/10"
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <UploadCloud className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">Belum ada file diunggah. Pilih sample di bawah.</p>
                </div>
              )}

              {/* Scale Overlay Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700 backdrop-blur-md text-[11px] font-mono text-slate-300">
                Kain: <span className="text-white font-bold">{activeFabric.name}</span> ({activeFabric.variants[0]?.gsm} GSM)
              </div>

              {patternMode === "tile" && (
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700 backdrop-blur-md text-[11px] font-mono text-accent-cyan">
                  Grid: {tileScale}x{tileScale} Repeat
                </div>
              )}

            </div>

            {/* Canvas Bottom Controls (Tile slider & Sample buttons) */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              
              {patternMode === "tile" && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-slate-400 font-medium whitespace-nowrap">Skala Pengulangan:</span>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={tileScale}
                    onChange={(e) => setTileScale(Number(e.target.value))}
                    className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <span className="text-white font-mono font-bold">{tileScale}x</span>
                </div>
              )}

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-slate-400 text-[11px]">Uji Contoh Artwork:</span>
                <button
                  onClick={() => handleSimulateUpload(1)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                >
                  Sport Tribal
                </button>
                <button
                  onClick={() => handleSimulateUpload(2)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                >
                  Hijab Voal
                </button>
              </div>

            </div>

          </div>

          {/* Upload Dropzone & File Specs */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-brand-400" />
              <span>Unggah File Desain Produksi (Resolusi Tinggi)</span>
            </h3>

            {/* Simulated Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-6 text-center transition-colors bg-slate-950/40 cursor-pointer">
              <UploadCloud className="w-10 h-10 text-brand-400 mx-auto mb-2 animate-bounce" />
              <div className="text-sm font-semibold text-white">
                Tarik & Lepas File Desain ke Sini
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Format yang didukung: <strong>Adobe Illustrator (.AI), PDF Vektor, TIFF Tanpa Kompresi, PNG 300 DPI</strong> (Maks. 250 MB)
              </p>
              <button
                type="button"
                onClick={() => handleSimulateUpload(1)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700"
              >
                Pilih File dari Komputer
              </button>
            </div>

            {/* File Verification Card */}
            {artworkFile && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-brand-500/20 text-brand-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{artworkFile.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      Ukuran: {artworkFile.sizeMb} MB • Dimensi Desain: {artworkFile.widthCm} × {artworkFile.heightCm} cm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {artworkFile.dpi >= 200 ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {artworkFile.dpi} DPI (Lolos Standar Cetak)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {artworkFile.dpi} DPI (Disarankan &gt; 150 DPI)
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Configuration, Tier Pricing & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-2xl space-y-6">
            
            <div>
              <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
                Kalkulasi Order Sublimasi
              </div>
              <h2 className="text-xl font-bold text-white font-display">
                Spesifikasi & Rincian Biaya
              </h2>
            </div>

            {/* 1. Fabric Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Pilih Bahan Kain Sublimasi:
              </label>
              <select
                value={selectedFabricId}
                onChange={(e) => setSelectedFabricId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {MOCK_FABRICS.map((fabric) => (
                  <option key={fabric.id} value={fabric.id}>
                    {fabric.name} ({fabric.variants[0]?.gsm} GSM) — {fabric.category}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400">
                Lebar efektif cetak: <strong>{activeFabric.widthInch}&quot; (~{Math.round(activeFabric.widthInch * 2.54)} cm)</strong>
              </div>
            </div>

            {/* 2. Meters Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Kebutuhan Panjang (Meter Lari):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={requiredMeters}
                    onChange={(e) => setRequiredMeters(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm text-right focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">Meter</span>
                </div>
              </div>

              <input
                type="range"
                min={5}
                max={1000}
                step={5}
                value={requiredMeters}
                onChange={(e) => setRequiredMeters(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5m</span>
                <span>50m (Roll)</span>
                <span>200m</span>
                <span>1.000m+</span>
              </div>
            </div>

            {/* 3. Cost Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                Rincian Kalkulasi Harga
              </div>
              
              <div className="flex justify-between text-slate-300">
                <span>Biaya Kain ({formatRupiah(activeTier.unitPrice)}/m × {requiredMeters}m):</span>
                <span className="font-mono text-white">{formatRupiah(fabricCostTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Jasa Cetak & Heatpress ({formatRupiah(SUBLIMATION_PRINT_FEE_PER_METER)}/m × {requiredMeters}m):</span>
                <span className="font-mono text-white">{formatRupiah(printingCostTotal)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Estimasi Cetak:</span>
                <span className="text-2xl font-black text-accent-cyan font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                *Belum termasuk PPN 11% & ongkir kargo roll
              </div>
            </div>

            {/* 4. Pre-Production Checklist */}
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={proofApproved}
                  onChange={(e) => setProofApproved(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-0"
                />
                <span>
                  Saya menyetujui bahwa layout motif, rasio skala, dan resolusi DPI file sudah final untuk diproses ke Surat Perintah Kerja (SPK) Sublimasi.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!proofApproved || isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan via-brand-500 to-accent-magenta hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950" />
                <span>{isSubmitting ? "Menyimpan ke Keranjang..." : "Ajukan Order & Lanjut ke Checkout"}</span>
              </button>

              <div className="text-center">
                <Link
                  href="/contact"
                  className="text-xs text-slate-400 hover:text-white underline transition-colors"
                >
                  Butuh Proofing Fisik Sample 1 Yard Terlebih Dahulu? Hubungi Sales B2B
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
