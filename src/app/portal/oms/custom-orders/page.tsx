"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Filter, 
  FileCheck, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Maximize2, 
  ArrowRight,
  Download,
  Flame,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface CustomProofItem {
  id: string;
  orderNumber: string;
  customerName: string;
  companyName: string;
  designTitle: string;
  fileFormat: string;
  fileSizeBytes: string;
  dpi: number;
  colorProfile: string;
  fabricName: string;
  gsm: number;
  meters: number;
  previewUrl: string;
  status: "PENDING_REVIEW" | "PROOF_GENERATED" | "APPROVED" | "REVISION_REQUESTED";
  submittedAt: string;
}

export default function CustomOrdersProofingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedProof, setSelectedProof] = useState<CustomProofItem | null>(null);

  const initialProofs: CustomProofItem[] = [
    {
      id: "proof-1",
      orderNumber: "TEX-202610-001",
      customerName: "Hendra Wijaya",
      companyName: "PT. Garment Kreatif Nusantara",
      designTitle: "Jersey_Esport_Phoenix_Fullprint_Final.ai",
      fileFormat: "Adobe Illustrator (Vector)",
      fileSizeBytes: "84.2 MB",
      dpi: 300,
      colorProfile: "CMYK (Japan Color 2001 Coated)",
      fabricName: "Dryfit Milano Premium",
      gsm: 135,
      meters: 500,
      previewUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      status: "PROOF_GENERATED",
      submittedAt: "2026-10-03 09:20",
    },
    {
      id: "proof-2",
      orderNumber: "TEX-202610-002",
      customerName: "Sarah Alatas",
      companyName: "Alatas Scarves Signature",
      designTitle: "Monogram_Botanical_Autumn_Print.tiff",
      fileFormat: "TIFF Uncompressed LZW",
      fileSizeBytes: "142.6 MB",
      dpi: 350,
      colorProfile: "CMYK (FOGRA39)",
      fabricName: "Voal Ultrafine Premium Hijab",
      gsm: 85,
      meters: 300,
      previewUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      status: "APPROVED",
      submittedAt: "2026-10-02 14:15",
    },
    {
      id: "proof-3",
      orderNumber: "TEX-202610-004",
      customerName: "Andi Darmawan",
      companyName: "Bandung Cycling Collective",
      designTitle: "RoadBike_Jersey_Gradient_Neon.png",
      fileFormat: "PNG High-Res",
      fileSizeBytes: "18.5 MB",
      dpi: 150, // Warning low DPI
      colorProfile: "RGB (sRGB IEC61966-2.1)",
      fabricName: "Dryfit Milano Premium",
      gsm: 135,
      meters: 150,
      previewUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
      status: "REVISION_REQUESTED",
      submittedAt: "2026-10-03 11:45",
    },
    {
      id: "proof-4",
      orderNumber: "TEX-202610-005",
      customerName: "Dewi Kartika",
      companyName: "Kartika Batik Modern",
      designTitle: "Batik_MegaMendung_Sublim_Vector.pdf",
      fileFormat: "PDF/X-4 Print Ready",
      fileSizeBytes: "56.4 MB",
      dpi: 300,
      colorProfile: "CMYK (US Web Coated SWOP)",
      fabricName: "Polyester Silk Satin Silk",
      gsm: 95,
      meters: 400,
      previewUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
      status: "PENDING_REVIEW",
      submittedAt: "2026-10-03 16:10",
    },
  ];

  const [proofs, setProofs] = useState<CustomProofItem[]>(initialProofs);

  const filteredProofs = proofs.filter((p) => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.designTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: CustomProofItem["status"]) => {
    setProofs(proofs.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedProof?.id === id) {
      setSelectedProof({ ...selectedProof, status: newStatus });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Press & Proofing Engine (PRD §3.2)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Antrean Approval Digital Proof Sublimasi
          </h1>
          <p className="text-xs text-slate-400">
            Verifikasi teknis berkas artwork custom, kalibrasi profil CMYK, dan persetujuan pra-cetak calender.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/oms/orders"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white transition-all"
          >
            Lihat Semua Pesanan
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Proofing</div>
          <div className="text-xl font-display font-bold text-white mt-1">{proofs.length} File</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-brand-500/30 bg-brand-500/5">
          <div className="text-[10px] uppercase font-bold text-brand-400">Menunggu Approval</div>
          <div className="text-xl font-display font-bold text-brand-300 mt-1">
            {proofs.filter(p => p.status === "PROOF_GENERATED" || p.status === "PENDING_REVIEW").length} File
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Disetujui Naik Cetak</div>
          <div className="text-xl font-display font-bold text-emerald-300 mt-1">
            {proofs.filter(p => p.status === "APPROVED").length} File
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="text-[10px] uppercase font-bold text-amber-400">Permintaan Revisi</div>
          <div className="text-xl font-display font-bold text-amber-300 mt-1">
            {proofs.filter(p => p.status === "REVISION_REQUESTED").length} File
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari file, klien, no. pesanan..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "PENDING_REVIEW", "PROOF_GENERATED", "APPROVED", "REVISION_REQUESTED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                statusFilter === s
                  ? "bg-brand-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {s === "ALL" ? "Semua Status" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Proofing Queue Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">No. Pesanan & Klien</th>
                <th className="py-3.5 px-4 font-bold">Nama File & Format</th>
                <th className="py-3.5 px-4 font-bold">Kain & Volume</th>
                <th className="py-3.5 px-4 font-bold">Parameter Warna</th>
                <th className="py-3.5 px-4 font-bold">Status Proof</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProofs.map((item) => {
                const isLowDpi = item.dpi < 200;
                const isRgb = item.colorProfile.includes("RGB");

                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{item.orderNumber}</div>
                      <div className="text-[11px] text-brand-400">{item.companyName}</div>
                      <div className="text-[10px] text-slate-500">{item.customerName}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200 truncate max-w-xs">{item.designTitle}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.fileFormat}</span>
                        <span>•</span>
                        <span>{item.fileSizeBytes}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{item.fabricName}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.gsm} GSM • <strong className="text-brand-300">{item.meters} Meter</strong>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                          isLowDpi ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-slate-900 text-slate-300"
                        }`}>
                          {item.dpi} DPI {isLowDpi && "⚠️ (Min 200 DPI)"}
                        </span>
                        <span className={`text-[10px] font-mono ${isRgb ? "text-amber-400" : "text-emerald-400"}`}>
                          {item.colorProfile}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        item.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : item.status === "PROOF_GENERATED"
                          ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
                          : item.status === "REVISION_REQUESTED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProof(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspeksi</span>
                        </button>
                        <Link
                          href={`/portal/oms/orders/${item.orderNumber.toLowerCase()}`}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-semibold"
                        >
                          SPK
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  High-Resolution Pre-Press Inspector
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  {selectedProof.designTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  Pesanan: {selectedProof.orderNumber} • Klien: {selectedProof.companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Artwork Preview Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-[16/9] bg-slate-950">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${selectedProof.previewUrl}')` }}
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200">
                Kain: <strong className="text-brand-300">{selectedProof.fabricName} ({selectedProof.gsm} GSM)</strong> • {selectedProof.meters} Meter
              </div>
            </div>

            {/* Technical Verification Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Resolusi File</div>
                <div className="font-bold text-white mt-0.5">{selectedProof.dpi} DPI</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Format & Ukuran</div>
                <div className="font-bold text-white mt-0.5">{selectedProof.fileFormat} ({selectedProof.fileSizeBytes})</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Profil Gamut Warna</div>
                <div className="font-bold text-white mt-0.5">{selectedProof.colorProfile}</div>
              </div>
            </div>

            {/* Approval Decision Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-terracotta shrink-0" />
                <span>Setelah approved, sistem akan mengirimkan SPK cetak otomatis ke operator Mimaki.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedProof.id, "REVISION_REQUESTED")}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-semibold"
                >
                  Minta Revisi
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedProof.id, "APPROVED")}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20"
                >
                  Setujui & Terbitkan SPK
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
