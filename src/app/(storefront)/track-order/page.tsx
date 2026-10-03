"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
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
  Palette
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("orderId") || "TEX-202610-001";
  const [query, setQuery] = useState(initialQuery);
  const [searchedOrder, setSearchedOrder] = useState(() => {
    return MOCK_ORDERS.find(o => o.orderNumber === initialQuery) || MOCK_ORDERS[0];
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_ORDERS.find(
      o => o.orderNumber.toLowerCase() === query.trim().toLowerCase()
    );
    if (found) {
      setSearchedOrder(found);
    } else {
      alert("Pesanan tidak ditemukan. Gunakan demo: TEX-202610-001 atau TEX-202610-002");
    }
  };

  // Pipeline timeline steps
  const steps = [
    { key: "PENDING_PAYMENT", label: "Menunggu Pembayaran", icon: Clock },
    { key: "CONFIRMED", label: "Proofing Disetujui (SPK)", icon: FileCheck },
    { key: "IN_PRODUCTION", label: "Produksi Cetak Sublimasi", icon: Cpu },
    { key: "QUALITY_CONTROL", label: "Quality Control & Roll", icon: CheckCircle2 },
    { key: "SHIPPED", label: "Pengiriman Kargo Roll", icon: Truck },
    { key: "COMPLETED", label: "Selesai Diterima", icon: Package },
  ];

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

  const currentStepIdx = getStepIndex(searchedOrder.status);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10">
      
      {/* Header & Search Bar */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
          Sistem Pelacakan SPK Produksi Real-Time
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Lacak Status Pesanan Sublimasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Masukkan nomor pesanan resmi Texora untuk memantau status kalibrasi warna, antrean mesin print, dan nomor resi kargo roll.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Contoh: TEX-202610-001"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            Lacak
          </button>
        </form>

        <div className="flex justify-center gap-2 text-[11px] text-slate-500">
          <span>Contoh Demo SPK:</span>
          {MOCK_ORDERS.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => { setQuery(o.orderNumber); setSearchedOrder(o); }}
              className="text-accent-cyan hover:underline font-mono"
            >
              {o.orderNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Order Status Timeline Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
        
        {/* Top Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="text-xs text-slate-400">Nomor Pesanan / SPK:</div>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
              <span>{searchedOrder.orderNumber}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                {searchedOrder.status.replace("_", " ")}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Pemesan: <strong className="text-white">{searchedOrder.customerName}</strong> ({searchedOrder.customerCompany})
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Total Tagihan & Kargo:</div>
            <div className="text-xl font-black text-accent-cyan font-mono">
              {formatRupiah(searchedOrder.totalAmount + searchedOrder.taxAmount + searchedOrder.shippingAmount)}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              Status Bayar: {searchedOrder.paymentStatus} ({searchedOrder.paymentMethod})
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
            Item Kain & File Artwork yang Sedang Dicetak:
          </h3>

          <div className="space-y-2">
            {searchedOrder.items.map((item) => (
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
