"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Printer, 
  AlertCircle, 
  Download, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Truck, 
  Flame, 
  Scan,
  MessageSquare,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "ord-101";

  const order = MOCK_ORDERS.find((o) => o.id === orderId) || MOCK_ORDERS[0];

  const [proofStatus, setProofStatus] = useState<"PENDING" | "APPROVED" | "REVISION_REQUESTED">(
    order.status === "PENDING_PAYMENT" || order.status === "CONFIRMED" ? "PENDING" : "APPROVED"
  );
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApproveProof = () => {
    setProofStatus("APPROVED");
    setActionSuccess("Digital Proof berhasil disetujui. Perintah Kerja (SPK) diteruskan ke Mesin Cetak Sublimasi.");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRequestRevision = () => {
    if (!revisionNotes) return;
    setProofStatus("REVISION_REQUESTED");
    setShowRevisionModal(false);
    setActionSuccess("Catatan revisi telah dikirimkan kepada tim pra-cetak (pre-press).");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const productionTimeline = [
    { title: "Pesanan Diterima & Verifikasi Pembayaran", date: order.createdAt, done: true },
    { title: "Pemeriksaan File Desain & Layout Proofing", date: "2026-10-02 10:30", done: true },
    { 
      title: "Digital Proof Approval (Customer)", 
      date: proofStatus === "APPROVED" ? "Disetujui • Siap Cetak" : "Menunggu Konfirmasi", 
      done: proofStatus === "APPROVED",
      current: proofStatus === "PENDING"
    },
    { 
      title: "Cetak Transfer Paper Sublim (Mimaki TS300P-1800)", 
      date: proofStatus === "APPROVED" ? "Antrean Mesin #03" : "Menunggu Approval Proof", 
      done: order.status === "IN_PRODUCTION" || order.status === "QUALITY_CONTROL" || order.status === "SHIPPED",
      current: proofStatus === "APPROVED" && order.status === "IN_PRODUCTION"
    },
    { 
      title: "Pemanasan Calender Rotary (Monti Antonio 205°C)", 
      date: "Estimasi 45 menit/roll", 
      done: order.status === "QUALITY_CONTROL" || order.status === "SHIPPED" 
    },
    { 
      title: "QC Rolling, Pemotongan & Pengemasan Tahan Air", 
      date: "Toleransi susut terverifikasi", 
      done: order.status === "SHIPPED" 
    },
    { 
      title: "Pengiriman Ekspedisi (JNE Cargo / Truk Texora)", 
      date: order.trackingNumber || "Nomor Resi Pending", 
      done: order.status === "SHIPPED" 
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/portal/oms/orders" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Pesanan & SPK</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Detail Pesanan: {order.orderNumber}
            </h1>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/10 border border-brand-500/30 text-brand-400">
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Cetak SPK Produksi</span>
          </button>
          <Link
            href="/portal/oms/invoices"
            className="px-4 py-2 rounded-xl bg-brand-500/15 border border-brand-500/40 hover:bg-brand-500/25 text-xs font-semibold text-brand-300 flex items-center gap-2 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Lihat Faktur Pajak</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Order Summary & Proof Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Digital Proof Approval & Items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PRD 3.2 Digital Proof Review Card */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>PRD §3.2 Digital Proof Approval</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white">
                  Pratinjau Layout Proofing Sublimasi
                </h2>
                <p className="text-xs text-slate-400">
                  Verifikasi skala motif, profil warna CMYK, dan tata letak sebelum transfer panas calender 205°C.
                </p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                  proofStatus === "APPROVED" 
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                    : proofStatus === "REVISION_REQUESTED"
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-brand-500/10 border border-brand-500/30 text-brand-400"
                }`}>
                  {proofStatus === "APPROVED" ? "✓ Proof Disetujui" : proofStatus === "REVISION_REQUESTED" ? "⚠️ Perlu Revisi" : "Menunggu Approval"}
                </span>
              </div>
            </div>

            {/* Simulated Fabric Print Proof Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/9] flex items-center justify-center group">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:scale-105 transition-transform duration-700"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Technical Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-200">
                  Resolusi: 300 DPI • Skala 1:1
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-brand-300">
                  Profil: Japan Subli CMYK
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-200">
                  Lebar: 152 cm (60")
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-terracotta" />
                  <span className="text-[11px]">Toleransi susut rajut: <strong>±2.5%</strong> terkalibrasi</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Hash: SHA256-TEX984A1</span>
              </div>
            </div>

            {/* Proofing Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persetujuan ini mengikat secara hukum untuk parameter warna SPK.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Minta Revisi File</span>
                </button>

                <button
                  type="button"
                  onClick={handleApproveProof}
                  disabled={proofStatus === "APPROVED"}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{proofStatus === "APPROVED" ? "Proof Terverifikasi" : "Setujui Digital Proof"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ordered Line Items */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center justify-between">
              <span>Item Kain & Cetak Sublimasi</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                {order.items.length} Rincian Item
              </span>
            </h3>

            <div className="divide-y divide-slate-800/80">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.fabricName}</h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                      <span>Gramasi: {item.gsm} GSM</span>
                      <span>•</span>
                      <span>Volume: {item.lengthMeters} Meter</span>
                      <span>•</span>
                      <span>Harga Satuan: {formatRupiah(item.unitPrice)}/m</span>
                    </div>
                    {item.customDesignTitle && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-brand-300 font-mono">
                        <FileCheck className="w-3 h-3 text-brand-400" />
                        <span>File: {item.customDesignTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {formatRupiah(item.subtotal)}
                    </div>
                    <div className="text-[10px] text-emerald-400">Siap Naik Cetak</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Kain & Sublimasi</span>
                <span className="font-semibold text-slate-200">{formatRupiah(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PPN 11% (CoreTax Terintegrasi)</span>
                <span className="font-semibold text-slate-200">{formatRupiah(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimasi Ekspedisi Kargo (Roll Delivery)</span>
                <span className="font-semibold text-slate-200">{formatRupiah(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Tagihan SPK</span>
                <span className="text-brand-400">
                  {formatRupiah(order.totalAmount + order.taxAmount + order.shippingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Production Timeline & Customer Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customer & Delivery Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" />
              <span>Informasi Klien & Pengiriman</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Perusahaan Pemesan</div>
                <div className="font-bold text-white text-sm">{order.customerCompany || order.customerName}</div>
                <div className="text-slate-400">{order.customerName} ({order.customerEmail})</div>
                <div className="text-slate-400">Telp: {order.customerPhone}</div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Metode Pembayaran</div>
                <div className="font-semibold text-white">{order.paymentMethod}</div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase">{order.paymentStatus}</div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ekspedisi Logistik</div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-brand-400" />
                  <span>{order.trackingNumber ? `Resi: ${order.trackingNumber}` : "Armada Texora Bandung"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Production Status Stepper */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Status Produksi Pabrik</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {productionTimeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                    step.done 
                      ? "bg-brand-500 border-slate-950" 
                      : step.current
                      ? "bg-amber-400 border-slate-950 animate-ping"
                      : "bg-slate-800 border-slate-950"
                  }`} />
                  
                  <div>
                    <h4 className={`text-xs font-semibold ${step.done ? "text-white font-bold" : "text-slate-400"}`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-brand-500/30 shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Catatan Permintaan Revisi Digital Proof</h3>
            <p className="text-xs text-slate-400">
              Sampaikan detail penyesuaian yang diperlukan (misal: pergeseran posisi motif, kecerahan warna, atau koreksi skala repeat).
            </p>
            <textarea
              rows={4}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Contoh: Mohon skala motif diperbesar 10% dan saturasi warna hitam dibuat lebih pekat sesuai standar jersey sport..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={!revisionNotes}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
