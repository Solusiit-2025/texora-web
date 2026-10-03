"use client";

import { useState } from "react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { Order, OrderStatus } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileText, 
  Filter, 
  Eye, 
  Download,
  Palette
} from "lucide-react";

export default function OmsOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = statusFilter === "ALL" 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">
              PRD 3.1 — Order Management System (OMS)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Antrean SPK & Produksi Sublimasi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifikasi file proofing cetak, status pemotongan kain, kalibrasi mesin heatpress, dan manifest kargo.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "ALL", label: "Semua" },
            { key: "IN_PRODUCTION", label: "Dalam Produksi" },
            { key: "QUALITY_CONTROL", label: "QC & Roll" },
            { key: "PENDING_PAYMENT", label: "Pending" },
            { key: "SHIPPED", label: "Terkirim" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st.key
                  ? "bg-brand-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. SPK & Pemesan</th>
                <th className="py-3.5 px-4">Spesifikasi Kain & Artwork</th>
                <th className="py-3.5 px-4">Total Panjang</th>
                <th className="py-3.5 px-4">Nilai SPK</th>
                <th className="py-3.5 px-4">Tahapan Pabrik</th>
                <th className="py-3.5 px-4 text-center">Aksi Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((ord) => {
                const totalMeters = ord.items.reduce((sum, item) => sum + item.lengthMeters, 0);

                return (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-sm">{ord.orderNumber}</div>
                      <div className="text-slate-300 font-medium text-xs mt-0.5">{ord.customerCompany}</div>
                      <div className="text-slate-500 text-[10px]">Tgl: {ord.createdAt}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {ord.items.map((item) => (
                        <div key={item.id} className="text-slate-300">
                          <span className="font-semibold text-white">{item.fabricName}</span> ({item.gsm} GSM)
                          {item.customDesignTitle && (
                            <span className="block font-mono text-[10px] text-accent-cyan truncate max-w-xs">
                              ↳ {item.customDesignTitle}
                            </span>
                          )}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {totalMeters} Meter
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-accent-cyan">{formatRupiah(ord.totalAmount)}</div>
                      <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded ${
                        ord.paymentStatus === "PAID" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                        ord.status === "IN_PRODUCTION"
                          ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40"
                          : ord.status === "QUALITY_CONTROL"
                          ? "bg-accent-violet/15 text-accent-violet border-accent-violet/40"
                          : ord.status === "SHIPPED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {ord.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-semibold transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail SPK</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SPK Detail & Action Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl bg-slate-900 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Lembar SPK Produksi: {selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedOrder.customerCompany} — Pemesan: {selectedOrder.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Tutup [ESC]
              </button>
            </div>

            {/* Quick Status Updater Buttons */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <label className="text-slate-400 font-bold block text-[10px] uppercase">
                Perbarui Tahapan Produksi di Lantai Pabrik:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { status: "CONFIRMED", label: "1. Proofing Disetujui" },
                  { status: "IN_PRODUCTION", label: "2. Mesin Printing & Heatpress" },
                  { status: "QUALITY_CONTROL", label: "3. QC & Rolling" },
                  { status: "SHIPPED", label: "4. Diserahkan ke Kargo" },
                ].map((s) => (
                  <button
                    key={s.status}
                    onClick={() => updateOrderStatus(selectedOrder.id, s.status as OrderStatus)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedOrder.status === s.status
                        ? "bg-brand-600 text-white shadow-lg"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items specifications */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Rincian Pengerjaan Kain & File Desain:
              </div>
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>{it.fabricName} ({it.gsm} GSM)</span>
                    <span className="font-mono text-accent-cyan">{it.lengthMeters} Meter</span>
                  </div>
                  {it.customDesignTitle && (
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <Palette className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Lampiran Artwork: {it.customDesignTitle}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Instruction notes */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Instruksi Khusus Garmen:</span>
              <p className="text-slate-300 mt-0.5">{selectedOrder.notes || "Tidak ada catatan khusus."}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Total SPK: <strong className="text-white font-mono">{formatRupiah(selectedOrder.totalAmount)}</strong></span>
              <button
                type="button"
                onClick={() => alert(`Mencetak dokumen Surat Perintah Kerja (SPK) untuk pesanan ${selectedOrder.orderNumber}`)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-brand-400" />
                <span>Cetak Lembar SPK Pabrik (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
