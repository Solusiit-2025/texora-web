"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
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
  X
} from "lucide-react";

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [proofingModalOrder, setProofingModalOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [proofingApproved, setProofingApproved] = useState(false);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState("");

  const pendingProofOrder = orders.find(o => o.status === "PENDING_PAYMENT" || o.status === "CONFIRMED");

  const handleApproveProof = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: "IN_PRODUCTION" as const } : o)
    );
    setProofingApproved(true);
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

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              PRD V2 — Customer Self-Service Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display mt-1">
            Portal Kemitraan Pelanggan B2B
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Selamat datang, <strong className="text-white">Hendra Wijaya</strong> (PT. Garment Kreatif Nusantara) — NPWP: <span className="font-mono text-slate-300">01.234.567.8-012.000</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/custom-sublimation"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span>Order Cetak Sublimasi Baru</span>
          </Link>
        </div>
      </div>

      {/* Alert Banner: Digital Proof Approval Required (PRD V2 3.2) */}
      {pendingProofOrder && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Persetujuan Digital Proofing Diperlukan (PRD V2)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {pendingProofOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Layout motif cetak pada bahan <strong className="text-white">{pendingProofOrder.items[0]?.fabricName}</strong> telah siap diverifikasi. Harap setujui proofing sebelum operator menjalankan mesin heatpress.
              </p>
            </div>
          </div>

          <button
            onClick={() => setProofingModalOrder(pendingProofOrder)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Review & Setujui Proofing</span>
          </button>
        </div>
      )}

      {/* Reorder Notification Toast */}
      {reorderSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Meter Kain Dipesan</span>
          <div className="text-2xl font-black text-white font-mono">1.050 Meter</div>
          <div className="text-[11px] text-accent-cyan">Dryfit Milano & Scuba Heavy</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Status Kemitraan B2B</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">Tier Gold (TOP 30)</div>
          <div className="text-[11px] text-slate-400">Limit Plafon: Rp 50.000.000</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Pesanan Dalam Produksi</span>
          <div className="text-2xl font-black text-accent-violet font-mono">2 SPK Aktif</div>
          <div className="text-[11px] text-slate-400">Sedang proses rotary heatpress</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Dokumen Faktur Pajak</span>
          <div className="text-2xl font-black text-white font-mono">4 Faktur Siap</div>
          <div className="text-[11px] text-slate-400">Terintegrasi CoreTax DJP</div>
        </div>
      </div>

      {/* Main Table: Order History, Digital Proofing & CoreTax Downloads */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-400" />
              <span>Riwayat Pesanan, Status Proofing & Dokumen Pajak</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau tahapan pengerjaan pabrik, setujui proofing cetak, unduh e-Faktur Pajak, dan lakukan pesan ulang (*1-click reorder*).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">No. SPK & Tanggal</th>
                <th className="py-3 px-4">Spesifikasi Kain & File Desain</th>
                <th className="py-3 px-4">Total Biaya</th>
                <th className="py-3 px-4">Tahapan Produksi</th>
                <th className="py-3 px-4">Dokumen Resmi</th>
                <th className="py-3 px-4 text-center">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.map((ord) => {
                const totalMeters = ord.items.reduce((sum, it) => sum + it.lengthMeters, 0);

                return (
                  <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-sm">{ord.orderNumber}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{ord.createdAt}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {ord.items.map((item) => (
                        <div key={item.id} className="text-slate-300">
                          <span className="font-semibold text-white">{item.fabricName}</span> ({item.lengthMeters} m)
                          {item.customDesignTitle && (
                            <span className="block font-mono text-[10px] text-accent-cyan truncate max-w-xs">
                              ↳ {item.customDesignTitle}
                            </span>
                          )}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-accent-cyan text-sm">{formatRupiah(ord.totalAmount)}</div>
                      <div className="text-[10px] text-slate-400">{ord.paymentMethod}</div>
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

                    <td className="py-3.5 px-4 space-y-1.5">
                      <button
                        onClick={() => alert(`Mengunduh Invoice Resmi PDF untuk ${ord.orderNumber}`)}
                        className="flex items-center gap-1.5 text-brand-300 hover:text-white transition-colors text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice PDF</span>
                      </button>

                      <button
                        onClick={() => alert(`Mengunduh e-Faktur Pajak (CoreTax 11%) untuk ${ord.orderNumber}`)}
                        className="flex items-center gap-1.5 text-accent-cyan hover:text-white transition-colors text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>e-Faktur Pajak (DJP)</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center space-y-1.5">
                      <Link
                        href={`/track-order?orderId=${ord.orderNumber}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lacak SPK</span>
                      </Link>

                      <button
                        onClick={() => handleReorder(ord.orderNumber)}
                        className="px-3 py-1.5 rounded-lg bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reorder 1-Click</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED DIGITAL PROOF APPROVAL MODAL (PRD V2 3.2 REQUIREMENT) */}
      {proofingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl glass-panel border border-brand-500/40 p-6 sm:p-8 shadow-2xl bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono text-accent-cyan uppercase tracking-wider block">
                  PRD V2 — Digital Proof Verification Workflow
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Verifikasi & Persetujuan Proofing Cetak: {proofingModalOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setProofingModalOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proofing Canvas Preview with Bleed & Dimension Overlays */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
                alt="Digital Proof Preview"
                className="w-full h-full object-cover opacity-85"
              />

              {/* Watermark Draft Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl sm:text-5xl font-black text-white/10 rotate-[-15deg] font-mono tracking-widest uppercase">
                  DIGITAL PROOF — PT. TEXORA
                </span>
              </div>

              {/* Spec overlay tag */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md text-xs space-y-1">
                <div className="font-bold text-white">{proofingModalOrder.items[0]?.fabricName}</div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Lebar Efektif: 152 cm (60&quot;) • Resolusi: 300 DPI • Tinta: UltraChrome CMYK
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                Parameter Kualitas yang Dikonfirmasi:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akurasi tata letak pola (*seamless repeat*)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kepadatan piksel aman & anti-blur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kompensasi susut heatpress 215°C (&lt;1.5%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Profil warna ICC monitor ke transfer paper</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Approve vs Request Revision */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  alert("Permintaan revisi dikirimkan ke Tim Desain Texora. PIC Sales akan menghubungi Anda via WhatsApp.");
                  setProofingModalOrder(null);
                }}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Minta Revisi Layout / Ganti File
              </button>

              <button
                type="button"
                onClick={() => handleApproveProof(proofingModalOrder.id)}
                disabled={proofingApproved}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:brightness-110 text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{proofingApproved ? "Proofing Disetujui! Memulai Mesin..." : "Setujui Proofing & Mulai Produksi Mesin"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
