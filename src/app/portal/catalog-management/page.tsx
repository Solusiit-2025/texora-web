"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Sliders, 
  Eye, 
  ArrowRight,
  Flame,
  ShieldCheck,
  X
} from "lucide-react";
import { MOCK_FABRICS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { FabricProduct } from "@/types";

export default function CatalogManagementPage() {
  const [fabrics, setFabrics] = useState<FabricProduct[]>(MOCK_FABRICS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newFabric, setNewFabric] = useState({
    name: "",
    category: "Sportswear",
    composition: "100% Micro Polyester",
    weaveType: "Interlock Knit",
    widthInch: 60,
    basePricePerMeter: 34000,
    gsm: 140,
  });

  const filteredFabrics = fabrics.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.composition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddFabric = (e: React.FormEvent) => {
    e.preventDefault();
    const created: FabricProduct = {
      id: `fab-${Date.now()}`,
      name: newFabric.name,
      slug: newFabric.name.toLowerCase().replace(/\s+/g, "-"),
      description: `Kain ${newFabric.name} kualitas industri dengan daya serap sublimasi tinggi.`,
      composition: newFabric.composition,
      weaveType: newFabric.weaveType,
      widthInch: Number(newFabric.widthInch),
      isSublimationReady: true,
      basePricePerMeter: Number(newFabric.basePricePerMeter),
      thumbnailUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      category: newFabric.category as any,
      variants: [
        { id: `var-${Date.now()}`, gsm: Number(newFabric.gsm), colorName: "Optic White Ready Sublim", stockMeters: 2000 }
      ],
      priceTiers: [
        { id: "t1", minMeters: 1, maxMeters: 49, unitPrice: Number(newFabric.basePricePerMeter) },
        { id: "t2", minMeters: 50, maxMeters: 199, unitPrice: Number(newFabric.basePricePerMeter) * 0.9 },
        { id: "t3", minMeters: 200, unitPrice: Number(newFabric.basePricePerMeter) * 0.8 },
      ]
    };

    setFabrics([created, ...fabrics]);
    setShowAddModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Kain Industri (PRD §3.1)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Manajemen Spesifikasi & Tiering Harga Kain
          </h1>
          <p className="text-xs text-slate-400">
            Konfigurasi varian GSM, lebar kain, kompatibilitas transfer sublimasi, dan matriks harga grosir per meter.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kain Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kain, komposisi serat..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {["ALL", "Sportswear", "Fashion & Hijab", "Merchandise & Flag", "Home Living"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fabrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric) => (
          <div key={fabric.id} className="glass-panel rounded-3xl border border-slate-800 hover:border-brand-500/50 transition-all overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-44 relative overflow-hidden bg-slate-950">
                <img
                  src={fabric.thumbnailUrl}
                  alt={fabric.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold text-brand-300">
                  {fabric.category}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  Ready Sublimasi
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-display font-bold text-white group-hover:text-brand-300 transition-colors">
                  {fabric.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {fabric.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Komposisi Serat:</span>
                    <span className="font-semibold text-white">{fabric.composition}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Anyaman & Lebar:</span>
                    <span className="font-semibold text-white">{fabric.weaveType} ({fabric.widthInch}")</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Varian Gramasi:</span>
                    <span className="font-semibold text-brand-400">
                      {fabric.variants.map(v => `${v.gsm} GSM`).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Pricing Tiers Preview */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                    Tingkat Harga Grosir (Volume Tiers)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {fabric.priceTiers.slice(0, 2).map((tier, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] text-slate-400 font-medium">
                          {tier.maxMeters ? `${tier.minMeters}-${tier.maxMeters}m` : `≥ ${tier.minMeters}m`}
                        </div>
                        <div className="font-bold text-brand-300 font-mono">
                          {formatRupiah(tier.unitPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                href={`/catalog/${fabric.slug}`}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <span>Lihat di Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => alert(`Mengedit parameter teknis kain ${fabric.name}...`)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Varian</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-display font-bold text-white">Tambah Kain Sublimasi Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFabric} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kain Industri</label>
                <input
                  type="text"
                  required
                  value={newFabric.name}
                  onChange={(e) => setNewFabric({ ...newFabric, name: e.target.value })}
                  placeholder="Contoh: Interlock Premium Quick-Dry"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
                  <select
                    value={newFabric.category}
                    onChange={(e) => setNewFabric({ ...newFabric, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Sportswear">Sportswear</option>
                    <option value="Fashion & Hijab">Fashion & Hijab</option>
                    <option value="Merchandise & Flag">Merchandise & Flag</option>
                    <option value="Home Living">Home Living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gramasi (GSM)</label>
                  <input
                    type="number"
                    required
                    value={newFabric.gsm}
                    onChange={(e) => setNewFabric({ ...newFabric, gsm: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lebar Kain (Inch)</label>
                  <input
                    type="number"
                    required
                    value={newFabric.widthInch}
                    onChange={(e) => setNewFabric({ ...newFabric, widthInch: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Dasar (Rp/Meter)</label>
                  <input
                    type="number"
                    required
                    value={newFabric.basePricePerMeter}
                    onChange={(e) => setNewFabric({ ...newFabric, basePricePerMeter: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold"
                >
                  Simpan Kain Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
