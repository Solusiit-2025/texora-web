"use client";
import { cachedClientFetch } from "@/lib/client-api";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { metersToYards } from "@/lib/units";
import { 
  Package, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  Palette, 
  Layers,
  ArrowRight,
  ExternalLink,
  X,
  Loader2,
  PackageSearch,
  ShoppingCart,
  PhoneCall,
  Sparkles,
  Search,
  HelpCircle,
  Building2,
  Check,
  ChevronRight,
  Printer,
  Flame,
  Truck,
  FileCheck2
} from "lucide-react";

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    companyName?: string;
    taxId?: string;
  } | null>(null);
  
  const [proofingModalOrder, setProofingModalOrder] = useState<any | null>(null);
  const [proofingApproved, setProofingApproved] = useState(false);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedTab, setSelectedTab] = useState<"all" | "proofing" | "in_production" | "completed" | "invoices">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoicePreviewOrder, setInvoicePreviewOrder] = useState<any | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // Fetch live user and orders from database API
  useEffect(() => {
    cachedClientFetch("/api/auth/me")
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/orders")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setOrders(json.data);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.warn("Using offline order cache in customer dashboard:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingProofOrder = orders.find(
    (o) => o.status === "PENDING_PAYMENT" || o.status === "CONFIRMED"
  );

  const handleApproveProof = async (orderId: string) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "IN_PRODUCTION" as const } : o
      )
    );
    setProofingApproved(true);

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PRODUCTION" }),
      });
    } catch (err) {
      console.warn("Failed to patch order in DB:", err);
    }

    setTimeout(() => {
      setProofingModalOrder(null);
      setProofingApproved(false);
    }, 1200);
  };

  const handleReorder = (orderNumber: string) => {
    setReorderSuccessMsg(`Pesanan ${orderNumber} berhasil diduplikasi ke draf SPK baru!`);
    setTimeout(() => {
      setReorderSuccessMsg("");
    }, 4000);
  };

  // Dynamically computed metrics from live database orders
  const totalMeters = orders.reduce(
    (sum, o) =>
      sum +
      (o.items || []).reduce(
        (s: number, it: any) => s + (Number(it.lengthMeters) || 0),
        0
      ),
    0
  );
  const inProductionCount = orders.filter(
    (o) => o.status === "IN_PRODUCTION" || o.status === "QUALITY_CONTROL"
  ).length;
  const proofingCount = orders.filter(
    (o) => o.status === "PENDING_PAYMENT" || o.status === "CONFIRMED"
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === "SHIPPED" || o.status === "DELIVERED"
  ).length;
  const paidInvoicesCount = orders.filter(
    (o) => o.paymentStatus === "PAID"
  ).length;

  // Filtered orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (selectedTab === "proofing" && order.status !== "PENDING_PAYMENT" && order.status !== "CONFIRMED") return false;
    if (selectedTab === "in_production" && order.status !== "IN_PRODUCTION" && order.status !== "QUALITY_CONTROL") return false;
    if (selectedTab === "completed" && order.status !== "SHIPPED" && order.status !== "DELIVERED") return false;
    if (selectedTab === "invoices" && !order.orderNumber) return false;

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber?.toLowerCase().includes(q);
      const matchFabric = order.items?.some((it: any) => it.fabricName?.toLowerCase().includes(q));
      const matchDesign = order.items?.some((it: any) => it.customDesignTitle?.toLowerCase().includes(q));
      if (!matchNumber && !matchFabric && !matchDesign) return false;
    }

    return true;
  });

  return (
    <div className="texora-container py-8 lg:py-10 space-y-8">
      
      {/* 1. Hero Welcome & Account Status Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Mitra Terverifikasi B2B
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-bold">
                Tier Gold Prioritas
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                â€¢ Plafon TOP 30 Hari Aktif (Limit Rp 50.000.000)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Selamat Datang, {currentUser?.name || "Mitra XoraMateria"}!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentUser?.companyName ? (
                <>Perusahaan: <strong className="text-white">{currentUser.companyName}</strong> â€¢ </>
              ) : null}
              Akses cepat seluruh layanan produksi sublimasi kain roll, verifikasi pra-cetak digital, lacak antrean mesin rotary heatpress, dan unduh dokumen faktur pajak DJP CoreTax.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/custom-sublimation"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-accent-cyan via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 group"
            >
              <Palette className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>+ Pesan Kustom Sublimasi Baru</span>
            </Link>

            <Link
              href="/track-order"
              className="px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <PackageSearch className="w-4 h-4 text-brand-400" />
              <span>Lacak Pesanan SPK</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Panduan Cepat Pemula: 3 Langkah Mudah Mengoperasikan Portal */}
      {showGuide && (
        <div className="rounded-2xl bg-slate-900/70 border border-brand-500/30 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Panduan Mudah Memulai Order di XoraMateria</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">
                    Untuk Pengguna Baru
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ikuti 3 tahapan berikut agar pesanan kain dan cetak sublimasi Anda langsung diproses mesin pabrik.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-xs"
              title="Tutup Panduan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-accent-cyan font-mono uppercase">
                  Langkah 1
                </span>
                <span className="w-6 h-6 rounded-full bg-accent-cyan/20 text-accent-cyan text-xs font-black flex items-center justify-center">
                  1
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Pilih Kain & Rancang Motif</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih jenis kain (Dryfit, Voal, Scuba) dan unggah artwork Anda, atau gunakan opsi <strong>Jasa Desain XoraMateria</strong> di Studio Kustom Sublimasi.
              </p>
              <div className="pt-1">
                <Link
                  href="/custom-sublimation"
                  className="text-xs text-accent-cyan font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Buka Studio Sublimasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-400 font-mono uppercase">
                  Langkah 2
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Setujui Digital Proofing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sebelum mesin heatpress mencetak roll kain Anda, sistem menampilkan preview layout dan profil warna CMYK untuk Anda verifikasi (1-Click Approval).
              </p>
              <div className="pt-1">
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <span>Otomatis Muncul di Dashboard</span>
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-400 font-mono uppercase">
                  Langkah 3
                </span>
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Pantau Mesin & Dokumen</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pantau proses rotary heatpress, quality control, dan nomor resi ekspedisi live. Unduh Surat Perintah Kerja (SPK) & e-Faktur Pajak CoreTax DJP.
              </p>
              <div className="pt-1">
                <Link
                  href="/track-order"
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Cek Live Tracking SPK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Pintasan Aksi Utama (6 Tombol Pintas Besar & Sangat Jelas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Pusat Navigasi Mandiri (Quick Access Hub)</span>
          </h2>
          <span className="text-xs text-slate-400">Tidak ada menu yang tersembunyi</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <Link
            href="/custom-sublimation"
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-accent-cyan/50 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-accent-cyan/15 text-accent-cyan w-fit group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">
                Kustom Sublimasi
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Order cetak baru & simulator 3D
              </p>
            </div>
          </Link>

          <Link
            href="/track-order"
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-brand-500/50 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-300 w-fit group-hover:scale-110 transition-transform">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                Lacak Produksi
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Pantau antrean mesin & resi SPK
              </p>
            </div>
          </Link>

          <Link
            href="/catalog"
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Katalog 18+ Kain
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Dryfit, Voal, Scuba & stok roll
              </p>
            </div>
          </Link>

          <Link
            href="/cart"
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 w-fit group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Keranjang Belanja
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Cek item draf & checkout order
              </p>
            </div>
          </Link>

          <button
            onClick={() => {
              setSelectedTab("invoices");
              const el = document.getElementById("order-history-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 transition-all group shadow-lg text-left flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 w-fit group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Faktur Pajak & SPK
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Unduh invoice PPN 11% & DJP
              </p>
            </div>
          </button>

          <Link
            href="/contact"
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 transition-all group shadow-lg flex flex-col justify-between"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 w-fit group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                Bantuan Sales PIC
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Konsultasi WhatsApp & sampel kain
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* 4. Alert Banner: Persetujuan Digital Proofing (PRD V2 3.2) */}
      {pendingProofOrder && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/40">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                <span>Persetujuan Digital Proofing Diperlukan (PRD V2 3.2)</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/30 text-amber-200 font-black border border-amber-500/40">
                  {pendingProofOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Layout motif cetak pada bahan <strong className="text-white font-semibold">{pendingProofOrder.items[0]?.fabricName}</strong> telah siap diverifikasi. Harap setujui proofing sebelum operator menjalankan mesin heatpress rotary 205Â°C.
              </p>
            </div>
          </div>

          <button
            onClick={() => setProofingModalOrder(pendingProofOrder)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Review & Setujui Proofing (1-Click)</span>
          </button>
        </div>
      )}

      {/* Reorder Notification Toast */}
      {reorderSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* 5. Quick Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 shadow-lg">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Yard Dipesan</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{metersToYards(totalMeters).toLocaleString("id-ID")} yd</div>
          <div className="text-[11px] text-accent-cyan font-semibold">Dryfit Milano, Scuba & Voal</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 shadow-lg">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status Kemitraan B2B</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {orders.length > 0 ? "Tier Gold" : "Mitra Baru"}
          </div>
          <div className="text-[11px] text-slate-400">Plafon TOP 30 Hari Aktif</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 shadow-lg">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Dalam Antrean Mesin</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-300 font-mono">{inProductionCount} SPK Aktif</div>
          <div className="text-[11px] text-slate-400">Proses RIP printing & QC</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 shadow-lg">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Dokumen Faktur Pajak</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{orders.length} Faktur Siap</div>
          <div className="text-[11px] text-slate-400">Terintegrasi DJP CoreTax 11%</div>
        </div>
      </div>

      {/* 6. Active Live Order Tracking Showcase Card (Untuk Pesanan Aktif) */}
      {orders.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  Pesanan Aktif Sedang Berjalan
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                SPK {orders[0].orderNumber} â€” {orders[0].items[0]?.fabricName} ({metersToYards(orders[0].items[0]?.lengthMeters || 0)} Yard)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/track-order?orderId=${orders[0].orderNumber}`}
                className="px-4 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500 text-brand-200 hover:text-slate-950 font-bold text-xs border border-brand-500/40 transition-all flex items-center gap-1.5"
              >
                <PackageSearch className="w-3.5 h-3.5" />
                <span>Buka Live Tracker</span>
              </Link>
            </div>
          </div>

          {/* Stepper Visual Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { title: "Order Masuk", desc: "SPK Terbit", done: true, current: false, icon: FileText },
              { title: "Pembayaran / TOP", desc: "Terms 30 Hari", done: true, current: false, icon: CheckCircle2 },
              { title: "Proofing Digital", desc: orders[0].status === "PENDING_PAYMENT" ? "Menunggu Approval" : "Disetujui", done: orders[0].status !== "PENDING_PAYMENT", current: orders[0].status === "PENDING_PAYMENT", icon: Eye },
              { title: "Cetak RIP Sublim", desc: "Mesin High-Speed", done: orders[0].status === "IN_PRODUCTION" || orders[0].status === "QUALITY_CONTROL" || orders[0].status === "SHIPPED", current: orders[0].status === "IN_PRODUCTION", icon: Printer },
              { title: "Rotary Heatpress", desc: "Suhu 205Â°C Fix", done: orders[0].status === "QUALITY_CONTROL" || orders[0].status === "SHIPPED", current: false, icon: Flame },
              { title: "QC & Pengiriman", desc: "Roll Packing", done: orders[0].status === "SHIPPED", current: false, icon: Truck },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all ${
                    step.current
                      ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10"
                      : step.done
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-slate-950/60 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                    <StepIcon className={`w-4 h-4 ${
                      step.current ? "text-amber-400 animate-pulse" : step.done ? "text-emerald-400" : "text-slate-500"
                    }`} />
                  </div>
                  <div className={`font-bold ${step.current ? "text-amber-300" : step.done ? "text-white" : "text-slate-400"}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Main Order History Table with Filter Tabs & Search */}
      <div id="order-history-section" className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl space-y-5 p-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-400" />
              <span>Daftar Pesanan SPK, Status Proofing & Dokumen Resmi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola seluruh riwayat pesanan, unduh invoice dan e-Faktur Pajak resmi, serta lakukan pesan ulang (1-Click Reorder).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SPK / Kain / Desain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "Semua Pesanan", count: orders.length },
            { id: "proofing", label: "Perlu Verifikasi Proofing", count: proofingCount, alert: proofingCount > 0 },
            { id: "in_production", label: "Dalam Produksi", count: inProductionCount },
            { id: "completed", label: "Selesai & Dikirim", count: completedCount },
            { id: "invoices", label: "Dokumen & Faktur Pajak", count: orders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTab === tab.id
                  ? "bg-brand-500 text-slate-950 font-bold shadow-md"
                  : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedTab === tab.id
                  ? "bg-slate-950 text-brand-300"
                  : tab.alert
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table Body */}
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Tidak Ada Pesanan Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? "Tidak ada pesanan yang sesuai dengan kata kunci pencarian Anda."
                  : "Mulai buat pesanan cetak sublimasi pertama Anda di Studio Kustom Sublimasi XoraMateria."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/custom-sublimation"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                <span>Kustom Sublimasi Baru</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. SPK & Tanggal</th>
                  <th className="py-3.5 px-4">Spesifikasi Kain & Desain</th>
                  <th className="py-3.5 px-4">Nilai Transaksi</th>
                  <th className="py-3.5 px-4">Tahapan Pabrik</th>
                  <th className="py-3.5 px-4">Dokumen Resmi</th>
                  <th className="py-3.5 px-4 text-center">Tindakan Langsung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map((ord) => {
                  const isProofPending = ord.status === "PENDING_PAYMENT" || ord.status === "CONFIRMED";
                  return (
                    <tr key={ord.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-white text-sm">{ord.orderNumber}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{ord.createdAt}</div>
                        <div className="text-[10px] text-brand-400 font-mono mt-0.5">SPK Standar Industri</div>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        {(ord.items || []).map((item: any) => (
                          <div key={item.id} className="text-slate-300">
                            <span className="font-semibold text-white">{item.fabricName}</span> â€¢ <span className="font-mono text-accent-cyan font-bold">{metersToYards(item.lengthMeters)} yd</span>
                            {item.customDesignTitle && (
                              <span className="block font-mono text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                â†³ Motif: {item.customDesignTitle}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-accent-cyan text-sm">{formatRupiah(ord.totalAmount)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {ord.paymentMethod || "Bank Transfer"} â€¢ {ord.paymentStatus === "PAID" ? "Lunas" : "TOP 30 Hari"}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${
                          ord.status === "IN_PRODUCTION"
                            ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40"
                            : ord.status === "QUALITY_CONTROL"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                            : ord.status === "SHIPPED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>{(ord.status || "").replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-1.5">
                        <button
                          onClick={() => setInvoicePreviewOrder(ord)}
                          className="flex items-center gap-1.5 text-brand-300 hover:text-white transition-colors text-[11px] font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-400" />
                          <span>Invoice & SPK PDF</span>
                        </button>

                        <button
                          onClick={() => setInvoicePreviewOrder(ord)}
                          className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors text-[11px] font-medium"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-400" />
                          <span>e-Faktur Pajak (DJP)</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-center space-y-1.5">
                        <div className="flex flex-col gap-1.5">
                          {isProofPending ? (
                            <button
                              onClick={() => setProofingModalOrder(ord)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-1 shadow-md"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Setujui Proofing</span>
                            </button>
                          ) : null}

                          <Link
                            href={`/track-order?orderId=${ord.orderNumber}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <PackageSearch className="w-3.5 h-3.5 text-accent-cyan" />
                            <span>Lacak SPK</span>
                          </Link>

                          <button
                            onClick={() => handleReorder(ord.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-slate-950 font-semibold transition-colors flex items-center justify-center gap-1 border border-brand-500/30"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reorder 1-Click</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. PIC Account Executive Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shrink-0">
            BS
          </div>
          <div>
            <div className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">
              Assigned Technical Account Executive
            </div>
            <h4 className="text-base font-bold text-white">Budi Santoso â€” PIC Senior XoraMateria</h4>
            <p className="text-xs text-slate-400">
              Siap melayani konsultasi profil warna ICC, permintaan sample swatch kain, dan pemesanan partai besar (&gt; 1.100 yard).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Budi%20XoraMateria,%20saya%20Mitra%20PT.%20INTECH%20MITRA%20ABADI%20ingin%20konsultasi%20pesanan%20sublimasi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat WhatsApp PIC</span>
          </a>
          <Link
            href="/contact"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Form Konsultasi Pabrik
          </Link>
        </div>
      </div>

      {/* 9. Digital Proofing Modal (PRD V2 3.2) */}
      {proofingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">
                  Verifikasi Pra-Cetak Digital (PRD V2 3.2)
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Approval Layout Motif & Warna Sublimasi
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Nomor SPK: <span className="font-mono text-white font-bold">{proofingModalOrder.orderNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setProofingModalOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proofing Mockup Display */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center group">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
                alt="Digital Proofing Layout"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <div className="bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 backdrop-blur-sm">
                  Kain: <strong className="text-white">{proofingModalOrder.items[0]?.fabricName}</strong> â€¢ Lebar: 152 cm (60")
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-mono font-bold">
                  CMYK Japan Color 2001
                </div>
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-300 mb-1">Checklist Kalibrasi XoraMateria:</div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolusi artwork memenuhi standar industri (&gt; 300 DPI)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulasi susut kain heatpress (shrinkage allowance 1.2%) telah dikoreksi</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profil warna tinta dispersi Oeko-Tex Standard 100 terverifikasi</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProofingModalOrder(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                Minta Revisi Desain
              </button>

              <button
                type="button"
                disabled={proofingApproved}
                onClick={() => handleApproveProof(proofingModalOrder.id)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {proofingApproved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-spin" />
                    <span>Proofing Disetujui! Memulai Mesin...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui Proofing & Terbitkan SPK Mesin</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 10. Dokumen Faktur Pajak CoreTax Modal Preview */}
      {invoicePreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Dokumen Faktur Pajak & SPK Resmi</h3>
              </div>
              <button
                onClick={() => setInvoicePreviewOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Nomor Faktur Pajak (DJP):</span>
                <span className="font-mono text-white font-bold">010.002-26.89201923</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Nomor SPK Pabrik:</span>
                <span className="font-mono text-accent-cyan font-bold">{invoicePreviewOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">PKP Penjual:</span>
                <span className="text-slate-200 text-right">XORAMATERIA<br /><span className="text-[10px] text-slate-400 font-mono">NPWP: 01.345.678.9-012.000</span></span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Pembeli BKP:</span>
                <span className="text-slate-200 text-right">{currentUser?.companyName || "PT. INTECH MITRA ABADI"}<br /><span className="text-[10px] text-slate-400 font-mono">NPWP: {currentUser?.taxId || "Terdaftar di DJP CoreTax"}</span></span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">DPP (Dasar Pengenaan Pajak):</span>
                <span className="font-mono text-white font-bold">{formatRupiah(invoicePreviewOrder.totalAmount ? Math.round(invoicePreviewOrder.totalAmount / 1.11) : 270000)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">PPN (11% CoreTax):</span>
                <span className="font-mono text-amber-400 font-bold">{formatRupiah(invoicePreviewOrder.totalAmount ? invoicePreviewOrder.totalAmount - Math.round(invoicePreviewOrder.totalAmount / 1.11) : 29700)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-200 font-bold">Total Pembayaran:</span>
                <span className="font-mono text-accent-cyan font-black text-sm">{formatRupiah(invoicePreviewOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={() => {
                  alert(`Memulai unduhan e-Faktur Pajak PDF resmi untuk ${invoicePreviewOrder.orderNumber}`);
                  setInvoicePreviewOrder(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh e-Faktur Pajak DJP</span>
              </button>
              <button
                onClick={() => {
                  alert(`Memulai unduhan Invoice & SPK Pabrik resmi untuk ${invoicePreviewOrder.orderNumber}`);
                  setInvoicePreviewOrder(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Unduh SPK & Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
