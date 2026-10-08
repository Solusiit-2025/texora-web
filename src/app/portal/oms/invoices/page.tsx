"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  companyName: string;
  taxId: string;
  issueDate: string;
  dueDate: string;
  dppAmount: number;
  vatAmount: number; // PPN 11%
  totalAmount: number;
  fakturPajakNo: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
}

export default function InvoicesCoreTaxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeInvoice, setActiveInvoice] = useState<InvoiceItem | null>(null);

  const invoices: InvoiceItem[] = [
    {
      id: "inv-001",
      invoiceNumber: "INV/TX/2026/10/0081",
      orderNumber: "TEX-202610-001",
      customerName: "Hendra Wijaya",
      companyName: "PT. Garment Kreatif Nusantara",
      taxId: "01.234.567.8-012.000",
      issueDate: "2026-10-01",
      dueDate: "2026-10-31",
      dppAmount: 18500000,
      vatAmount: 2035000,
      totalAmount: 20535000,
      fakturPajakNo: "010.002-26.89201192",
      status: "PAID",
    },
    {
      id: "inv-002",
      invoiceNumber: "INV/TX/2026/10/0082",
      orderNumber: "TEX-202610-002",
      customerName: "Sarah Alatas",
      companyName: "Alatas Scarves Signature",
      taxId: "02.987.654.3-011.000",
      issueDate: "2026-10-02",
      dueDate: "2026-11-01",
      dppAmount: 9450000,
      vatAmount: 1039500,
      totalAmount: 10489500,
      fakturPajakNo: "010.002-26.89201193",
      status: "PAID",
    },
    {
      id: "inv-003",
      invoiceNumber: "INV/TX/2026/10/0083",
      orderNumber: "TEX-202610-003",
      customerName: "Kevin Suryadi",
      companyName: "Runners United Club",
      taxId: "08.112.334.5-015.000",
      issueDate: "2026-10-03",
      dueDate: "2026-10-10",
      dppAmount: 4320000,
      vatAmount: 475200,
      totalAmount: 4795200,
      fakturPajakNo: "010.002-26.89201194",
      status: "UNPAID",
    },
    {
      id: "inv-004",
      invoiceNumber: "INV/TX/2026/09/0079",
      orderNumber: "TEX-202609-094",
      customerName: "Rudi Hartono",
      companyName: "CV. Tekstil Mandiri Sejahtera",
      taxId: "04.556.778.9-019.000",
      issueDate: "2026-09-15",
      dueDate: "2026-09-30",
      dppAmount: 32000000,
      vatAmount: 3520000,
      totalAmount: 35520000,
      fakturPajakNo: "010.002-26.89201170",
      status: "OVERDUE",
    },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.fakturPajakNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalVAT = invoices.reduce((acc, curr) => acc + curr.vatAmount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faktur Komersial & CoreTax DJP (PRD §3.3)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Faktur Penjualan & Pajak Pertambahan Nilai (PPN 11%)
          </h1>
          <p className="text-xs text-slate-400">
            Penerbitan e-Faktur terintegrasi CoreTax DJP RI, rekonsiliasi pembayaran tempo B2B, dan arsip dokumen pajak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Mengunduh ekspor CSV format e-Faktur CoreTax DJP...")}
            className="px-4 py-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 hover:bg-brand-500/25 text-xs font-semibold text-brand-300 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Format CoreTax</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Faktur B2B Diterbitkan</div>
          <div className="text-2xl font-display font-bold text-white mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Bulan Berjalan (Oktober 2026)</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 bg-brand-500/5">
          <div className="text-[10px] uppercase font-bold text-brand-400">Total PPN 11% Terkumpul (CoreTax)</div>
          <div className="text-2xl font-display font-bold text-brand-300 mt-1">
            {formatRupiah(totalVAT)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Siap Pelaporan SPT Masa PPN</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="text-[10px] uppercase font-bold text-amber-400">Piutang Menunggu Pembayaran</div>
          <div className="text-2xl font-display font-bold text-amber-300 mt-1">
            {formatRupiah(invoices.filter(i => i.status !== "PAID").reduce((a, b) => a + b.totalAmount, 0))}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">2 Faktur Jatuh Tempo</div>
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
            placeholder="Cari no faktur, NPWP, perusahaan..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PAID", "UNPAID", "OVERDUE"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                statusFilter === status
                  ? "bg-brand-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {status === "ALL" ? "Semua Status" : status === "PAID" ? "Lunas" : status === "UNPAID" ? "Belum Dibayar" : "Jatuh Tempo"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">No. Faktur & Tanggal</th>
                <th className="py-3.5 px-4 font-bold">Klien & NPWP</th>
                <th className="py-3.5 px-4 font-bold">Nomor e-Faktur Pajak</th>
                <th className="py-3.5 px-4 font-bold">DPP + PPN 11%</th>
                <th className="py-3.5 px-4 font-bold">Status Tagihan</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-white font-mono">{inv.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Order: {inv.orderNumber} • Tgl: {inv.issueDate}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-200">{inv.companyName}</div>
                    <div className="text-[10px] text-brand-400 font-mono mt-0.5">NPWP: {inv.taxId}</div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                      <span>{inv.fakturPajakNo}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-white">{formatRupiah(inv.totalAmount)}</div>
                    <div className="text-[10px] text-slate-400">
                      DPP: {formatRupiah(inv.dppAmount)} • PPN: {formatRupiah(inv.vatAmount)}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                      inv.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : inv.status === "UNPAID"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}>
                      {inv.status === "PAID" ? "Lunas (Paid)" : inv.status === "UNPAID" ? "Menunggu Bayar" : "Jatuh Tempo"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveInvoice(inv)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Faktur</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  PT. Texora Visi Prima — Faktur Penjualan Sah
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  {activeInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Penerima Tagihan (B2B Client)</div>
                <div className="font-bold text-white text-sm mt-1">{activeInvoice.companyName}</div>
                <div className="text-slate-400">{activeInvoice.customerName}</div>
                <div className="text-brand-400 font-mono mt-1">NPWP: {activeInvoice.taxId}</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Nomor e-Faktur Pajak</div>
                <div className="font-mono text-sm font-bold text-emerald-400 mt-1">{activeInvoice.fakturPajakNo}</div>
                <div className="text-slate-400 mt-1">Tgl Terbit: {activeInvoice.issueDate}</div>
                <div className="text-slate-400">Jatuh Tempo: {activeInvoice.dueDate}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Dasar Pengenaan Pajak (DPP)</span>
                <span className="font-semibold text-white">{formatRupiah(activeInvoice.dppAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pajak Pertambahan Nilai (PPN 11%)</span>
                <span className="font-semibold text-emerald-400">{formatRupiah(activeInvoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Tagihan Sah</span>
                <span className="text-brand-400">{formatRupiah(activeInvoice.totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF Faktur</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
