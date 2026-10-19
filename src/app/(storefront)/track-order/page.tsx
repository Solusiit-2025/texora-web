"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { loadLastOrder, type PlacedOrder } from "@/lib/order";
import type { Order } from "@/types";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Truck, 
  Package, 
  FileCheck, 
  AlertCircle, 
  Layers, 
  Palette, 
  Loader2, 
  Lock, 
  UserCheck,
  ChevronDown 
} from "lucide-react";

type TrackableOrder = Order | PlacedOrder;

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("orderId") || "";

  // Authentication State
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [allOrders, setAllOrders] = useState<TrackableOrder[]>([]);
  const [searchedOrder, setSearchedOrder] = useState<TrackableOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verifikasi status login sebelum akses
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          const currentUrl = typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/track-order";
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}&reason=auth_required`);
          return;
        }
        setCurrentUser(data.user);
        setAuthChecked(true);
      })
      .catch(() => {
        const currentUrl = typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/track-order";
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}&reason=auth_required`);
      });
  }, [router]);

  // Fetch initial orders from database API (sesuai akun yang login)
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          // Ketika data resmi dari database tersedia: jadikan Single Source of Truth
          if (json.data.length > 0) {
            // Bersihkan cache localStorage browser agar tidak membangkitkan data pesanan lama/duplikat
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("texora-last-order");
            }
            setAllOrders(json.data);

            if (initialQuery) {
              const found = json.data.find(
                (o: any) => o.orderNumber?.toLowerCase() === initialQuery.toLowerCase()
              );
              if (found) {
                setSearchedOrder(found);
                setQuery(found.orderNumber);
              } else {
                setErrorMessage(`Nomor SPK "${initialQuery}" tidak ditemukan pada daftar pesanan Anda.`);
              }
            } else {
              setSearchedOrder(json.data[0]);
              setQuery(json.data[0].orderNumber);
            }
            return;
          }

          // Fallback HANYA jika database kosong (misal pengguna offline / belum ada koneksi)
          const last = loadLastOrder();
          const fallbackOrders = last ? [last] : [];
          setAllOrders(fallbackOrders);

          if (initialQuery) {
            const found = fallbackOrders.find(
              (o: any) => o.orderNumber?.toLowerCase() === initialQuery.toLowerCase()
            );
            if (found) {
              setSearchedOrder(found);
              setQuery(found.orderNumber);
            } else {
              setErrorMessage(`Nomor SPK "${initialQuery}" tidak ditemukan pada daftar pesanan Anda.`);
            }
          } else if (fallbackOrders.length > 0) {
            setSearchedOrder(fallbackOrders[0]);
            setQuery(fallbackOrders[0].orderNumber);
          } else {
            setSearchedOrder(null);
            setQuery("");
          }
        }
      })
      .catch((err) => {
        console.warn("Using offline order cache:", err);
      });
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      // First check in-memory list
      const localMatch = allOrders.find(
        (o) => o.orderNumber?.toLowerCase() === query.trim().toLowerCase()
      );
      if (localMatch) {
        setSearchedOrder(localMatch);
        setIsSearching(false);
        return;
      }

      // Query database API
      const res = await fetch(`/api/orders?search=${encodeURIComponent(query.trim())}`);
      const json = await res.json();

      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        const match =
          json.data.find(
            (o: any) => o.orderNumber?.toLowerCase() === query.trim().toLowerCase()
          ) || json.data[0];
        setSearchedOrder(match);
      } else {
        const last = loadLastOrder();
        if (last && last.orderNumber?.toLowerCase() === query.trim().toLowerCase()) {
          setSearchedOrder(last);
        } else {
          setErrorMessage(
            `Nomor SPK "${query}" tidak ditemukan pada daftar pesanan akun Anda. Pastikan format nomor pesanan benar (contoh: TEX-202610-xxxx).`
          );
        }
      }
    } catch {
      setErrorMessage("Gagal memverifikasi status pesanan ke server. Coba beberapa saat lagi.");
    } finally {
      setIsSearching(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return 0;
      case "CONFIRMED": return 1;
      case "IN_PRODUCTION": return 2;
      case "QUALITY_CONTROL": return 3;
      case "SHIPPED": return 4;
      case "COMPLETED": return 5;
      default: return 2;
    }
  };

  const steps = [
    { key: "PENDING_PAYMENT", label: "Menunggu Pembayaran", icon: Clock },
    { key: "CONFIRMED", label: "Proofing Disetujui (SPK)", icon: FileCheck },
    { key: "IN_PRODUCTION", label: "Produksi Cetak Sublimasi", icon: Cpu },
    { key: "QUALITY_CONTROL", label: "Quality Control & Roll", icon: CheckCircle2 },
    { key: "SHIPPED", label: "Pengiriman Kargo Roll", icon: Truck },
    { key: "COMPLETED", label: "Selesai Diterima", icon: Package },
  ];

  const currentStepIdx = getStepIndex(searchedOrder?.status || "IN_PRODUCTION");

  if (!authChecked) {
    return (
      <div className="texora-container py-24 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <h2 className="text-lg font-bold text-white">Memverifikasi Hak Akses Pelacakan SPK...</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Akses riwayat produksi dan pelacakan pesanan memerlukan login akun terdaftar. Mengarahkan ke halaman login jika belum masuk.
        </p>
      </div>
    );
  }

  return (
    <div className="texora-container py-10 space-y-10">
      
      {/* Header & Search Bar */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            Sistem Pelacakan SPK Produksi Real-Time
          </span>
          {currentUser && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Terotentikasi: {currentUser.name}</span>
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Lacak Status Pesanan Sublimasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Pilih nomor Surat Perintah Kerja (SPK) terdaftar pada akun Anda untuk memantau status kalibrasi warna, antrean mesin rotary heatpress, dan nomor resi kargo secara langsung dari database pabrik.
        </p>

        {/* Order Selector Dropdown */}
        <div className="max-w-lg mx-auto pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-brand-400" />
              <span>Pilih Nomor Pesanan (SPK):</span>
            </span>
            <span className="text-[11px] text-brand-400 font-mono font-bold">
              {allOrders.length} Pesanan Terdaftar
            </span>
          </div>

          <div className="relative">
            <select
              value={searchedOrder?.orderNumber || ""}
              onChange={(e) => {
                const selectedNo = e.target.value;
                setQuery(selectedNo);
                const found = allOrders.find((o) => o.orderNumber === selectedNo);
                if (found) {
                  setSearchedOrder(found);
                  setErrorMessage(null);
                }
              }}
              disabled={allOrders.length === 0}
              className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 hover:border-brand-500/60 focus:border-brand-500 rounded-2xl text-xs sm:text-sm text-white font-mono cursor-pointer focus:outline-none shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed pl-11 pr-10 appearance-none"
            >
              {allOrders.length === 0 ? (
                <option value="">Belum ada nomor pesanan terdaftar di akun Anda</option>
              ) : (
                allOrders.map((o) => {
                  const mainFabric = o.items?.[0]?.fabricName || "Kain Sublimasi";
                  const meters = o.items?.[0]?.lengthMeters ? `${o.items[0].lengthMeters}m` : "";
                  const statusLabel = (o.status || "").replace("_", " ");
                  return (
                    <option key={o.orderNumber} value={o.orderNumber} className="bg-slate-900 text-white font-sans py-2">
                      {o.orderNumber} • {mainFabric} {meters} [{statusLabel}]
                    </option>
                  );
                })
              )}
            </select>

            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-400">
              <FileCheck className="w-4 h-4" />
            </div>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2 max-w-md mx-auto text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Order Status Timeline Card / Empty State */}
      {searchedOrder ? (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
          
          {/* Top Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="text-xs text-slate-400">Nomor Pesanan / SPK:</div>
              <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                <span>{searchedOrder.orderNumber}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  {(searchedOrder.status || "").replace("_", " ")}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Pemesan: <strong className="text-white">{searchedOrder.customerName}</strong>
                {searchedOrder.customerCompany ? ` (${searchedOrder.customerCompany})` : ""}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-400">Total Tagihan:</div>
              <div className="text-xl font-black text-accent-cyan font-mono">
                {formatRupiah((searchedOrder.totalAmount || 0) + (searchedOrder.taxAmount || 0) + (searchedOrder.shippingAmount || 0))}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Status Bayar: {searchedOrder.paymentStatus} ({searchedOrder.paymentMethod || "Bank Transfer"})
              </div>
            </div>
          </div>

          {/* Real-time Progress Bar / Stepper */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tahapan Pengerjaan di Pabrik:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between min-h-[100px] transition-all ${
                      isCurrent
                        ? "bg-brand-600/30 border-brand-500 text-white shadow-lg shadow-brand-500/20 ring-1 ring-brand-400"
                        : isPast
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900/40 border-slate-800 text-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-1 ${
                      isCurrent ? "bg-brand-500 text-white animate-pulse" : isPast ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] font-bold leading-tight">
                      {st.label}
                    </div>
                    <div className="text-[9px] font-mono mt-1">
                      {isCurrent ? "Sedang Berjalan" : isPast ? "Selesai ✓" : "Menunggu"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items in this Order */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Kain & File Artwork yang Sedang Diproses:
            </h3>

            <div className="space-y-2">
              {(searchedOrder.items || []).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{item.fabricName}</div>
                    <div className="text-slate-400 mt-0.5">
                      Gramatur: <span className="text-slate-200">{item.gsm} GSM</span> • Panjang: <span className="text-white font-mono font-bold">{item.lengthMeters} Meter</span>
                    </div>
                    {item.customDesignTitle && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-accent-cyan font-mono text-[11px]">
                        <Palette className="w-3.5 h-3.5" />
                        <span>{item.customDesignTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Subtotal:</span>
                    <span className="font-mono font-bold text-white text-sm">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Note & Resi Info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Catatan Produksi & Logistik:</span>
              <p className="text-slate-300 mt-0.5">{searchedOrder.notes || "Tidak ada instruksi khusus."}</p>
            </div>
            {searchedOrder.trackingNumber && (
              <div className="sm:text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">No. Resi Kargo:</span>
                <span className="font-mono font-bold text-accent-cyan text-sm">{searchedOrder.trackingNumber}</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl glass-panel border border-slate-800 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Belum Ada Pesanan yang Dapat Dilacak</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Akun Anda belum memiliki riwayat pesanan aktif di sistem produksi. Buat pesanan sublimasi atau kain pertama Anda untuk memantau tahapan kalibrasi warna dan resi pengiriman di sini.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/custom-sublimation"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              <span>Kustom Sublimasi Baru</span>
            </Link>
            <Link
              href="/catalog"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Lihat Katalog Kain</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Memuat data pelacakan SPK...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
