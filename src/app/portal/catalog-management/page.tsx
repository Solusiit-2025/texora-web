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
  Layers,
  FileText,
  Upload,
  Loader2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { metersToYards, yardsToMeters, pricePerYard, pricePerMeterFromYard } from "@/lib/units";
import { FabricProduct } from "@/types";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { htmlToPlainText } from "@/lib/sanitize";
import { getImageFileDimensions, isLowResolutionImage } from "@/lib/image-gallery";
import { shrinkImageForUpload, uploadImageFile } from "@/lib/upload-client";

/** Batas galeri gambar kain (sinkron lib/image-gallery). */
const MAX_PRODUCT_IMAGES = 5;
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per gambar

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

  // ── Mode sembunyikan harga (TERPUSAT di database via SystemSetting) ──
  // Berlaku untuk portal DAN storefront; hanya tulisan yang di-mask,
  // data harga di database tetap utuh.
  const [hidePrice, setHidePrice] = useState(false);
  const [hidePriceBusy, setHidePriceBusy] = useState(false);

  // ── Master kategori (dikelola via /api/categories) ──
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  /** Katalog PDF unggahan manual (CMS). null = memakai katalog otomatis. */
  const [catalogPdf, setCatalogPdf] = useState<{
    url: string;
    filename: string;
    sizeBytes: number;
    uploadedAt: string;
  } | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogUploading, setCatalogUploading] = useState(false);
  const [catalogStorage, setCatalogStorage] = useState<string>("local");

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
    images: [] as string[], // galeri (maks 5) — untuk /catalog manual carousel
  });

  const [imageBusy, setImageBusy] = useState(false);

  /** Upload gambar galeri kain: JPG/PNG/GIF/AVIF → otomatis .webp (maks 5 gambar, 5MB). */
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const slots = MAX_PRODUCT_IMAGES - formData.images.length;
    if (slots <= 0) {
      showNotice("error", `Maksimal ${MAX_PRODUCT_IMAGES} gambar per kain.`);
      return;
    }
    const accepted = files.slice(0, slots);
    const skipped = files.length - accepted.length;

    for (const file of accepted) {
      if (!file.type.startsWith("image/")) {
        showNotice("error", `"${file.name}" ditolak — hanya file gambar.`);
        continue;
      }
      if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
        showNotice("error", `"${file.name}" melebihi batas 5MB.`);
        continue;
      }
      // Peringatan resolusi rendah — kartu besar akan tampil kurang tajam.
      const dims = await getImageFileDimensions(file);
      if (isLowResolutionImage(dims.width, dims.height)) {
        showNotice(
          "error",
          `"${file.name}" beresolusi ${dims.width}×${dims.height}px — agak kecil. Idealnya ≥800px (mis. 1200×800) supaya tajam di kartu.`
        );
        continue; // jangan upload gambar yang pasti pecah
      }
      setImageBusy(true);
      try {
        // Kompres dulu di browser kalau besar — menghindari 413 dari Nginx/proxy.
        const upload = await shrinkImageForUpload(file);
        // Sudah dikompres di browser (WebP ≤1920px)? Simpan apa adanya supaya
        // server tidak meng-encode ulang (menghindari penurunan kualitas).
        const outcome = await uploadImageFile(upload, { convertToWebp: upload === file });
        if (outcome.success) {
          const url = outcome.url;
          setFormData((f) =>
            f.images.length < MAX_PRODUCT_IMAGES ? { ...f, images: [...f.images, url] } : f
          );
        } else {
          showNotice("error", outcome.error);
        }
      } finally {
        setImageBusy(false);
      }
    }
    if (skipped > 0) {
      showNotice("error", `${skipped} gambar dilewati — batas ${MAX_PRODUCT_IMAGES} gambar.`);
    }
  };

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?fresh=1", { cache: "no-store" });
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
    fetchCategories();
    // Muat status sembunyikan harga dari server (SystemSetting, terpusat)
    fetch("/api/catalog-settings")
      .then((r) => r.json())
      .then((j) => {
        if (typeof j?.hidePrices === "boolean") setHidePrice(j.hidePrices);
      })
      .catch(() => {
        /* default: harga tampil */
      });
  }, []);

  const toggleHidePrice = async () => {
    const next = !hidePrice;
    setHidePrice(next);
    setHidePriceBusy(true);
    try {
      const res = await fetch("/api/catalog-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidePrices: next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setHidePrice(!next);
        showNotice("error", json.error || "Gagal menyimpan pengaturan harga.");
      } else {
        showNotice(
          "success",
          next
            ? "Harga disembunyikan — berlaku juga di halaman katalog pengunjung."
            : "Harga ditampilkan kembali di portal & storefront."
        );
      }
    } catch {
      setHidePrice(!next);
      showNotice("error", "Koneksi gagal. Pengaturan tidak tersimpan.");
    } finally {
      setHidePriceBusy(false);
    }
  };

  const showNotice = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const json = await res.json();
      if (json?.categories?.length) setCategories(json.categories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback: derive dari produk + default ((service tetap jalan walau API kategori error)
    }
  };

  // Kunci perbandingan: huruf kecil, hanya alfanumerik & buang akhiran jamak
  // → "Sportswears"/"sportswear" dianggap sama. Sumber kebenaran tetap server.
  const catKey = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/(es|s)$/, "");

  // Daftar dropdown & chip: dari master kategori (API). Fallback dari produk jika API gagal.
  const categoryList =
    categories.length > 0
      ? categories
      : Array.from(
          new Set([
            ...fabrics.map((f) => f.category),
            "Sportswear",
            "Fashion & Hijab",
            "Merchandise & Flag",
            "Home Living",
          ])
        )
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "id"));

  // Dropdown selalu memuat kategori produk yang sedang diedit (legacy data bisa di luar master).
  const dropdownCats = categoryList.includes(formData.category)
    ? categoryList
    : Array.from(new Set([formData.category, ...categoryList]));

  const handleCategoryNameChange = (value: string) => {
    setNewCategoryName(value);
    setCategoryError(null);
    const key = catKey(value);
    if (!key.trim()) {
      setCategoryWarning(null);
      return;
    }
    const hit = categoryList.find((c) => catKey(c) === key);
    setCategoryWarning(
      hit
        ? `Kategori "${hit}" sudah ada — gunakan yang tersedia, jangan buat variasi baru.`
        : null
    );
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim().replace(/\s+/g, " ");
    if (!name) return;
    setSavingCategory(true);
    setCategoryError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setCategoryError(json.error || "Gagal menyimpan kategori.");
        return;
      }
      setCategories(json.categories || []);
      setFormData({ ...formData, category: json.category });
      setShowCategoryModal(false);
      setNewCategoryName("");
      setCategoryWarning(null);
      showNotice("success", `Kategori "${json.category}" ditambahkan & langsung terpilih.`);
    } catch {
      setCategoryError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setSavingCategory(false);
    }
  };

  const loadCatalogPdf = async () => {
    try {
      setCatalogLoading(true);
      const res = await fetch("/api/catalog/upload", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        setCatalogPdf(json.data || null);
        if (json.storage) setCatalogStorage(json.storage);
      }
    } catch {
      /* diamkan — panel tetap bisa dipakai untuk upload */
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogPdf();
  }, []);

  const handleCatalogUpload = async (file: File | null) => {
    if (!file) return;

    const isPdf = /\.pdf$/i.test(file.name) || file.type === "application/pdf";
    if (!isPdf) {
      showNotice("error", "File katalog harus berformat PDF.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      showNotice("error", "Ukuran katalog maksimal 30 MB.");
      return;
    }

    setCatalogUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/catalog/upload", { method: "POST", body: fd });
      if (res.status === 413) {
        throw new Error(
          "PDF ditolak server (413 Payload Too Large) — batas upload Nginx/proxy masih kecil. Naikkan client_max_body_size di Nginx."
        );
      }
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error || "Gagal mengunggah katalog.");
      }

      setCatalogPdf(json.data);
      showNotice("success", "Katalog PDF berhasil diunggah dan langsung dipakai di website.");
    } catch (err: any) {
      showNotice("error", err?.message || "Gagal mengunggah katalog.");
    } finally {
      setCatalogUploading(false);
    }
  };

  const handleCatalogDelete = async () => {
    if (!confirm("Hapus katalog unggahan? Website akan kembali memakai katalog otomatis dari data produk.")) {
      return;
    }

    setCatalogUploading(true);
    try {
      const res = await fetch("/api/catalog/upload", { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error || "Gagal menghapus katalog.");
      }
      setCatalogPdf(null);
      showNotice("success", "Katalog unggahan dihapus. Katalog otomatis kembali aktif.");
    } catch (err: any) {
      showNotice("error", err?.message || "Gagal menghapus katalog.");
    } finally {
      setCatalogUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return "-";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      images: [],
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
      // Galeri legacy: thumbnail lama + galleryImages (dedupe, maks 5).
      images: (fabric.images?.length
        ? fabric.images
        : [fabric.thumbnailUrl || ""])
        .filter((v, i, arr) => v && arr.indexOf(v) === i)
        .slice(0, 5),
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
            thumbnailUrl: formData.images[0] || "",
            galleryImages: formData.images,
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
            thumbnailUrl: formData.images[0] || "",
            galleryImages: formData.images,
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
          className={`fixed top-6 right-6 z-[2000] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all ${
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

      {/* Katalog PDF — unggahan manual dari CMS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Katalog PDF untuk Pengunjung</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Unggah katalog yang Anda desain sendiri di komputer (PDF, maks. 30 MB). File ini
              otomatis dipakai oleh semua tombol &quot;Unduh Katalog&quot; di website. Jika belum ada,
              website membuat katalog otomatis dari data produk di bawah.
            </p>
          </div>
          <a
            href="/api/catalog/pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-brand-500/50 text-slate-200 hover:text-white text-xs font-semibold shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-300" />
            Lihat Katalog Aktif
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {catalogLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
            Memeriksa katalog tersimpan...
          </div>
        ) : catalogPdf ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{catalogPdf.filename}</div>
                <div className="text-[11px] text-emerald-200/80 mt-0.5">
                  {formatBytes(catalogPdf.sizeBytes)} • diunggah{" "}
                  {new Date(catalogPdf.uploadedAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 break-all">
                  {catalogPdf.url.startsWith("http")
                    ? "Disimpan di Cloudflare R2 — diunduh lewat xoramateria.com (r2.dev diblokir sebagian ISP)"
                    : catalogPdf.url}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/api/catalog/pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500/50 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Unduh
              </a>
              <button
                type="button"
                onClick={handleCatalogDelete}
                disabled={catalogUploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs font-semibold text-red-300 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-center space-y-2">
            <FileText className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">
              Belum ada katalog unggahan
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Website saat ini memakai katalog otomatis yang dibuat dari data produk. Unggah PDF
              untuk menggantinya dengan desain versi Anda sendiri.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500">
            Penyimpanan:{" "}
            <span className="font-semibold text-slate-400">
              {catalogStorage === "r2" ? "Cloudflare R2 / S3" : "Folder server (public/uploads/catalog)"}
            </span>
          </div>

          <label
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition-all ${
              catalogUploading
                ? "bg-slate-700 text-slate-400 pointer-events-none"
                : "bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/20"
            }`}
          >
            {catalogUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {catalogUploading
              ? "Mengunggah..."
              : catalogPdf
                ? "Ganti Katalog PDF"
                : "Unggah Katalog PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              disabled={catalogUploading}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                e.currentTarget.value = "";
                handleCatalogUpload(file);
              }}
            />
          </label>
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {["ALL", ...categoryList].map((cat) => (            <button
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

          {/* Toggle tampilkan/sembunyikan harga di kartu */}
          <button
            type="button"
            onClick={toggleHidePrice}
            disabled={hidePriceBusy}
            title={hidePrice ? "Tampilkan harga" : "Sembunyikan harga (berlaku juga di storefront)"}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all disabled:opacity-50 ${
              hidePrice
                ? "bg-amber-500/10 border-amber-600/40 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {hidePrice ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {hidePriceBusy
              ? "Menyimpan..."
              : hidePrice
              ? "Harga Disembunyikan"
              : "Sembunyikan Harga"}
          </button>
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
                        {metersToYards(fabric.variants.reduce((acc, v) => acc + (v.stockMeters || 0), 0))} Yard
                      </span>
                    </div>
                  </div>

                  {/* Pricing Tiers Preview (bisa disembunyikan via toggle) */}
                  <div className="pt-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                      {hidePrice
                        ? "Tingkat Harga Grosir (disembunyikan)"
                        : "Tingkat Harga Grosir (Volume Tiers)"}
                    </div>
                    {hidePrice ? (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 italic">
                        Harga disembunyikan — aktifkan toggle "Tampilkan harga" untuk melihatnya.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {fabric.priceTiers.slice(0, 2).map((tier, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[9px] text-slate-400 font-medium">
                              {tier.maxMeters ? `${metersToYards(tier.minMeters)}-${metersToYards(tier.maxMeters)} yd` : `≥ ${metersToYards(tier.minMeters)} yd`}
                            </div>
                            <div className="font-bold text-brand-300 font-mono">
                              {formatRupiah(pricePerYard(tier.unitPrice))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-5">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Kategori</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(true);
                        setNewCategoryName("");
                        setCategoryError(null);
                        setCategoryWarning(null);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Kategori
                    </button>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  >
                    {dropdownCats.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Daftar tervalidasi tanpa duplikat. Kategori baru lewat tombol + Kategori.
                  </p>
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
                  <label className="block text-slate-300 font-semibold mb-1">
                    Harga Dasar (Rp/yd)
                    <span className="text-[10px] text-slate-500 ml-1">({formatRupiah(formData.basePricePerMeter)}/m di database)</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={pricePerYard(formData.basePricePerMeter)}
                    onChange={(e) =>
                      setFormData({ ...formData, basePricePerMeter: pricePerMeterFromYard(Number(e.target.value) || 0) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Stok (Yard)
                    <span className="text-[10px] text-slate-500 ml-1">({formatNumber(formData.stockMeters)} m di database)</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={metersToYards(formData.stockMeters)}
                    onChange={(e) =>
                      setFormData({ ...formData, stockMeters: yardsToMeters(Number(e.target.value) || 0) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Galeri gambar — maks 5, JPG/PNG/GIF otomatis .webp */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Galeri Gambar ({formData.images.length}/{MAX_PRODUCT_IMAGES})
                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                    JPG/PNG/GIF/AVIF otomatis jadi .webp · maks 5MB/gambar · gambar pertama = thumbnail
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((url, i) => (
                    <div
                      key={url}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-800 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gambar ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-500/90 text-slate-950 text-[9px] font-bold">
                          UTAMA
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, images: formData.images.filter((u) => u !== url) })
                        }
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < MAX_PRODUCT_IMAGES && (
                    <label
                      className={`w-24 h-24 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
                        imageBusy
                          ? "border-brand-500/60 bg-brand-500/5 cursor-wait"
                          : "border-slate-700 hover:border-brand-500/60 bg-slate-900/40"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={imageBusy}
                      />
                      {imageBusy ? (
                        <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-[10px] text-slate-400 mt-1 text-center leading-tight">
                            JPG/PNG/GIF
                            <br />→ .webp otomatis
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>
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

      {/* Modal Tambah Kategori Baru */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full glass-panel p-6 rounded-3xl border border-brand-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-display font-bold text-white">Tambah Kategori Baru</h3>
                <p className="text-[11px] text-slate-400">
                  Kategori akan tervalidasi otomatis (anti-duplikat).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">Nama Kategori</label>
              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={(e) => handleCategoryNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !savingCategory) handleAddCategory();
                }}
                placeholder="mis. Industrial Tent"
                maxLength={60}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-500"
              />
              {categoryWarning && (
                <p className="text-[11px] text-amber-400 mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {categoryWarning}
                </p>
              )}
              {categoryError && (
                <p className="text-[11px] text-red-400 mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {categoryError}
                </p>
              )}
              {categoryWarning && !categoryError && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Cukup pilih kategori yang sudah ada di dropdown — server juga
                  akan memvalidasi ulang saat disimpan.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl text-[11px] font-bold bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!newCategoryName.trim() || savingCategory}
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold bg-brand-500 text-slate-950 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingCategory ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {savingCategory ? "Menyimpan..." : "Tambah Kategori"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
