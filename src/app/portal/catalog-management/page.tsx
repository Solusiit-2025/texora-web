"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  X,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { FabricProduct } from "@/types";
import { ImageUpload } from "@/components/common/ImageUpload";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { htmlToPlainText } from "@/lib/sanitize";

export default function CatalogManagementPage() {
  const [fabrics, setFabrics] = useState<FabricProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("loading");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState<FabricProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Sportswear",
    composition: "100% Micro Polyester",
    weaveType: "Interlock Knit",
    widthInch: 60,
    basePricePerMeter: 34000,
    gsm: 140,
    stockMeters: 2000,
    description: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  });

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && json.data) {
        setFabrics(json.data);
        setDataSource(json.source || "database");
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      showNotice("error", "Gagal memuat katalog dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const filteredFabrics = fabrics.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.composition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      category: "Sportswear",
      composition: "100% Micro Polyester",
      weaveType: "Interlock Knit",
      widthInch: 60,
      basePricePerMeter: 34000,
      gsm: 140,
      stockMeters: 2000,
      description: "",
      thumbnailUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (fabric: FabricProduct) => {
    setEditingFabric(fabric);
    setFormData({
      name: fabric.name,
      category: fabric.category || "Sportswear",
      composition: fabric.composition,
      weaveType: fabric.weaveType || "",
      widthInch: fabric.widthInch,
      basePricePerMeter: fabric.basePricePerMeter,
      gsm: fabric.variants[0]?.gsm || 140,
      stockMeters: fabric.variants[0]?.stockMeters || 2000,
      description: fabric.description,
      thumbnailUrl: fabric.thumbnailUrl || "",
    });
  };

  const handleSaveFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingFabric) {
        // Edit mode (PUT)
        const updatedVariants = editingFabric.variants.map((v, i) =>
          i === 0
            ? { ...v, gsm: Number(formData.gsm), stockMeters: Number(formData.stockMeters) }
            : v
        );

        const res = await fetch(`/api/products/${editingFabric.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            composition: formData.composition,
            weaveType: formData.weaveType,
            widthInch: Number(formData.widthInch),
            basePricePerMeter: Number(formData.basePricePerMeter),
            description: formData.description,
            thumbnailUrl: formData.thumbnailUrl,
            variants: updatedVariants,
          }),
        });

        const json = await res.json();
        if (json.success) {
          showNotice("success", `Kain "${formData.name}" berhasil diperbarui di database!`);
          setEditingFabric(null);
          await fetchFabrics();
        } else {
          showNotice("error", json.error || "Gagal memperbarui kain.");
        }
      } else {
        // Add mode (POST)
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            composition: formData.composition,
            weaveType: formData.weaveType,
            widthInch: Number(formData.widthInch),
            basePricePerMeter: Number(formData.basePricePerMeter),
            gsm: Number(formData.gsm),
            description: formData.description,
            thumbnailUrl: formData.thumbnailUrl,
            variants: [
              {
                gsm: Number(formData.gsm),
                colorName: "Optic White Ready Sublim",
                stockMeters: Number(formData.stockMeters),
              },
            ],
          }),
        });

        const json = await res.json();
        if (json.success) {
          showNotice("success", `Kain "${formData.name}" berhasil ditambahkan ke database!`);
          setShowAddModal(false);
          await fetchFabrics();
        } else {
          showNotice("error", json.error || "Gagal menambahkan kain.");
        }
      }
    } catch (err: any) {
      showNotice("error", err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFabric = async (fabric: FabricProduct) => {
    if (!window.confirm(`Yakin ingin menghapus kain "${fabric.name}" dari katalog produk?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${fabric.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showNotice("success", `Kain "${fabric.name}" berhasil dihapus dari database.`);
        await fetchFabrics();
      } else {
        showNotice("error", json.error || "Gagal menghapus kain.");
      }
    } catch (err) {
      showNotice("error", "Gagal menghubungi server untuk menghapus kain.");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
              : "bg-red-950/90 text-red-200 border-red-500/40"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CMS Produk Katalog (PRD §3.1)</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                dataSource === "database"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}
            >
              <Database className="w-3 h-3" />
              {dataSource === "database" ? "PostgreSQL Terhubung" : "Fallback Cache"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Manajemen Katalog Kain Industri
          </h1>
          <p className="text-xs text-slate-400">
            Kelola spesifikasi teknis kain poliester, gramasi (GSM), lebar roll, dan tiering harga langsung ke database produksi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchFabrics}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
            title="Muat ulang dari database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kain Baru</span>
          </button>
        </div>
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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Menghubungkan ke database PostgreSQL...</p>
          <p className="text-xs text-slate-500 mt-1">Mengambil data spesifikasi kain dan tier harga terkini.</p>
        </div>
      )}

      {/* Fabrics Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="glass-panel rounded-3xl border border-slate-800 hover:border-brand-500/50 transition-all overflow-hidden flex flex-col justify-between group"
            >
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
                    {htmlToPlainText(fabric.description, 140)}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Komposisi Serat:</span>
                      <span className="font-semibold text-white">{fabric.composition}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Anyaman & Lebar:</span>
                      <span className="font-semibold text-white">
                        {fabric.weaveType} ({fabric.widthInch}&quot;)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Varian Gramasi:</span>
                      <span className="font-semibold text-brand-400">
                        {fabric.variants.map((v) => `${v.gsm} GSM`).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Stok Tersedia:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {fabric.variants.reduce((acc, v) => acc + (v.stockMeters || 0), 0)} Meter
                      </span>
                    </div>
                  </div>

                  {/* Pricing Tiers Preview */}
                  <div className="pt-1">
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

              <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/catalog/${fabric.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(fabric)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-brand-500/50 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFabric(fabric)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                    title="Hapus Kain"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {(showAddModal || editingFabric) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  {editingFabric ? "Edit Parameter Kain Sublimasi" : "Tambah Kain Sublimasi Baru"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {editingFabric ? `Mengubah data untuk: ${editingFabric.name}` : "Data akan disimpan langsung ke database PostgreSQL."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFabric(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFabric} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kain Industri</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Interlock Premium Quick-Dry"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Deskripsi Produk"
                  value={formData.description || ""}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                  placeholder="Karakteristik kain, kegunaan utama, daya serap sublimasi..."
                  minHeight={180}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Komposisi Serat</label>
                  <input
                    type="text"
                    required
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    placeholder="e.g. 100% Micro Polyester"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Anyaman / Rajut</label>
                  <input
                    type="text"
                    required
                    value={formData.weaveType}
                    onChange={(e) => setFormData({ ...formData, weaveType: e.target.value })}
                    placeholder="e.g. Circular Knit Eyelet"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lebar Kain (Inch)</label>
                  <input
                    type="number"
                    required
                    value={formData.widthInch}
                    onChange={(e) => setFormData({ ...formData, widthInch: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Dasar (Rp/m)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePricePerMeter}
                    onChange={(e) =>
                      setFormData({ ...formData, basePricePerMeter: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stok (Meter)</label>
                  <input
                    type="number"
                    required
                    value={formData.stockMeters}
                    onChange={(e) =>
                      setFormData({ ...formData, stockMeters: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  label="Gambar Thumbnail"
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  onError={(m) => showNotice("error", m)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingFabric(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFabric ? "Simpan Perubahan" : "Simpan Kain Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
