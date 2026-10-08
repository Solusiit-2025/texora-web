"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  FileSpreadsheet,
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Scale,
  Receipt,
  X,
  PieChart,
  Info,
  Sparkles,
  BarChart3,
  Layers,
  Clock,
  ChevronDown
} from "lucide-react";

// Tipe data jurnal transaksi
interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  description: string;
  accountDebit: string;
  accountCredit: string;
  amount: number;
  category: "REVENUE" | "COGS" | "OPEX" | "ASSET" | "LIABILITY";
  status: "POSTED" | "AUDITED";
  pic: string;
}

// Tipe data piutang B2B
interface ARAgingItem {
  id: string;
  companyName: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  daysAging: number;
  status: "LANCAR" | "TEMPO_7_HARI" | "TEMPO_30_HARI" | "LEWAT_TEMPO";
  picPhone: string;
}

export default function FinanceAccountingPage() {
  // State navigasi tab
  const [activeTab, setActiveTab] = useState<"pnl" | "balance" | "cashflow" | "journal" | "ar">("pnl");
  
  // State periode filter
  const [selectedPeriod, setSelectedPeriod] = useState<"YTD" | "Q3" | "SEP" | "OKT">("YTD");

  // State pencarian jurnal
  const [journalSearch, setJournalSearch] = useState("");
  
  // Modal tambah transaksi / jurnal
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [newJournalForm, setNewJournalForm] = useState({
    voucherNo: `BKM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    description: "",
    accountDebit: "1101 - Kas & Bank BCA",
    accountCredit: "4101 - Pendapatan Cetak Sublimasi",
    amount: 15000000,
    category: "REVENUE" as JournalEntry["category"],
  });

  // Mock data transaksi jurnal akuntansi
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "j-101",
      voucherNo: "BKM-2026-8812",
      date: "08 Okt 2026",
      description: "Pelunasan TOP 30 Hari Invoice #INV-2026-X092 PT. Intech Mitra Abadi",
      accountDebit: "1101 - Kas & Bank BCA",
      accountCredit: "1120 - Piutang Usaha B2B",
      amount: 48000000,
      category: "REVENUE",
      status: "POSTED",
      pic: "Finance Staff",
    },
    {
      id: "j-102",
      voucherNo: "BKK-2026-7419",
      date: "07 Okt 2026",
      description: "Pembelian Tinta Dispersi Sublimasi Oeko-Tex 200 Liter (Batch Lot #TX89)",
      accountDebit: "5102 - HPP Tinta Sublimasi",
      accountCredit: "1101 - Kas & Bank BCA",
      amount: 32500000,
      category: "COGS",
      status: "AUDITED",
      pic: "Procurement",
    },
    {
      id: "j-103",
      voucherNo: "BKK-2026-7420",
      date: "06 Okt 2026",
      description: "Pembayaran Tagihan Listrik PLN Industri & Gas Kalender Rotary 210°C",
      accountDebit: "5104 - Beban Energi & Kalender",
      accountCredit: "1102 - Bank Mandiri Operasional",
      amount: 18450000,
      category: "COGS",
      status: "AUDITED",
      pic: "Finance Staff",
    },
    {
      id: "j-104",
      voucherNo: "BKM-2026-8813",
      date: "05 Okt 2026",
      description: "Penerimaan DP 50% Pengadaan Kain Voal Ultrafine 2.500m (Hijab Zahra)",
      accountDebit: "1101 - Kas & Bank BCA",
      accountCredit: "2120 - Uang Muka Penjualan (DP)",
      amount: 35000000,
      category: "REVENUE",
      status: "POSTED",
      pic: "Kasir Pusat",
    },
    {
      id: "j-105",
      voucherNo: "BKK-2026-7421",
      date: "03 Okt 2026",
      description: "Gaji & Lembur Operator Printing Mesin 1440 DPI & QC Tekstil Periode Sep",
      accountDebit: "6101 - Beban Gaji & Operasional",
      accountCredit: "1101 - Kas & Bank BCA",
      amount: 52750000,
      category: "OPEX",
      status: "AUDITED",
      pic: "HR & Finance",
    },
    {
      id: "j-106",
      voucherNo: "BKK-2026-7422",
      date: "02 Okt 2026",
      description: "Sewa Fasilitas Pergudangan & Kantor Jl. Walang Baru VI Tanjung Priok",
      accountDebit: "6102 - Beban Sewa & Fasilitas",
      accountCredit: "1102 - Bank Mandiri Operasional",
      amount: 15000000,
      category: "OPEX",
      status: "AUDITED",
      pic: "Finance Head",
    },
    {
      id: "j-107",
      voucherNo: "BKM-2026-8814",
      date: "01 Okt 2026",
      description: "Penjualan Langsung Kain Dryfit Milano 500 Meter (Konveksi Berkah)",
      accountDebit: "1101 - Kas & Bank BCA",
      accountCredit: "4101 - Pendapatan Cetak Sublimasi",
      amount: 16000000,
      category: "REVENUE",
      status: "POSTED",
      pic: "Sales Rep",
    },
  ]);

  // Mock data AR Aging Piutang B2B
  const arAgingData: ARAgingItem[] = [
    {
      id: "ar-1",
      companyName: "PT. Intech Mitra Abadi",
      invoiceNo: "INV/TXR/2026/09-102",
      amount: 48000000,
      dueDate: "20 Okt 2026",
      daysAging: 12,
      status: "LANCAR",
      picPhone: "+6281280212068",
    },
    {
      id: "ar-2",
      companyName: "Konveksi Berkah Jersey",
      invoiceNo: "INV/TXR/2026/09-088",
      amount: 18500000,
      dueDate: "14 Okt 2026",
      daysAging: 24,
      status: "TEMPO_7_HARI",
      picPhone: "+6285281702489",
    },
    {
      id: "ar-3",
      companyName: "Hijab Zahra Textile",
      invoiceNo: "INV/TXR/2026/08-210",
      amount: 35000000,
      dueDate: "28 Okt 2026",
      daysAging: 5,
      status: "LANCAR",
      picPhone: "+6281399001122",
    },
    {
      id: "ar-4",
      companyName: "CV. Garmen Nusantara",
      invoiceNo: "INV/TXR/2026/09-045",
      amount: 14200000,
      dueDate: "10 Okt 2026",
      daysAging: 28,
      status: "TEMPO_7_HARI",
      picPhone: "+6281700112233",
    },
    {
      id: "ar-5",
      companyName: "Sportwearindo Bandung",
      invoiceNo: "INV/TXR/2026/08-115",
      amount: 22800000,
      dueDate: "02 Nov 2026",
      daysAging: 3,
      status: "LANCAR",
      picPhone: "+6282133445566",
    },
  ];

  // Handler tambah jurnal manual
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalForm.description.trim() || newJournalForm.amount <= 0) return;

    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      voucherNo: newJournalForm.voucherNo,
      date: newJournalForm.date,
      description: newJournalForm.description.trim(),
      accountDebit: newJournalForm.accountDebit,
      accountCredit: newJournalForm.accountCredit,
      amount: Number(newJournalForm.amount),
      category: newJournalForm.category,
      status: "POSTED",
      pic: "Accounting User",
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setShowAddJournalModal(false);
    setNewJournalForm({
      voucherNo: `BKM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      description: "",
      accountDebit: "1101 - Kas & Bank BCA",
      accountCredit: "4101 - Pendapatan Cetak Sublimasi",
      amount: 15000000,
      category: "REVENUE",
    });
  };

  const filteredJournals = journalEntries.filter(j =>
    j.description.toLowerCase().includes(journalSearch.toLowerCase()) ||
    j.voucherNo.toLowerCase().includes(journalSearch.toLowerCase()) ||
    j.accountDebit.toLowerCase().includes(journalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* ── HEADER HALAMAN & IDENTITAS PERUSAHAAN ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>PT. TEXORA VISI PRIMA</span>
              <span>•</span>
              <span>ACCOUNTING & FINANCE EXECUTIVE</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-0.5">
            Laporan Keuangan & Akuntansi Perusahaan
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Ringkasan komprehensif Laba Rugi (P&L), Neraca Keuangan (Balance Sheet), Arus Kas (Cash Flow), dan Manajemen Piutang B2B Pabrik Tekstil Sublimasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Audit */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AUDITED 2026 (WTP)</span>
          </div>

          {/* Tombol Print / Download PDF */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
            title="Cetak Laporan Keuangan Resmi (A4)"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Cetak PDF</span>
          </button>

          {/* Tombol Export Excel */}
          <button
            onClick={() => alert("📥 Mockup Export: Data Laporan Keuangan PT. TEXORA VISI PRIMA (YTD 2026) siap diunduh dalam format .xlsx")}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* Tombol Input Jurnal Baru */}
          <button
            onClick={() => setShowAddJournalModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Jurnal</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI FINANCIAL METRICS CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Pendapatan (Revenue)</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatRupiah(1485200000)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% YoY</span>
            <span className="text-slate-500 font-normal">vs target 2025</span>
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Laba Kotor (Gross Profit)</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <PieChart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-accent-cyan font-mono">
            {formatRupiah(546550000)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
            <span>Margin 36.8%</span>
            <span className="text-slate-500 font-normal">• HPP terkendali</span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Laba Bersih (Net Income)</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {formatRupiah(273280000)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span>Margin 18.4%</span>
            <span className="text-slate-500 font-normal">• Net Profit Margin</span>
          </div>
        </div>

        {/* Kas & Bank */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Kas & Bank (BCA + Mandiri)</span>
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatRupiah(642500000)}
          </div>
          <div className="text-[11px] text-slate-400">
            Likuiditas lancar & aman
          </div>
        </div>

        {/* Piutang Usaha B2B */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Piutang Usaha B2B (AR)</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono">
            {formatRupiah(284000000)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            94% Status Lancar (TOP 30)
          </div>
        </div>

      </div>

      {/* ── BAR FILTER & NAVIGASI TAB MODUL KEUANGAN ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { key: "pnl", label: "Laba Rugi (P&L)", icon: TrendingUp },
            { key: "balance", label: "Neraca Keuangan", icon: Scale },
            { key: "cashflow", label: "Arus Kas (Cash Flow)", icon: Landmark },
            { key: "journal", label: "Buku Besar & Jurnal", icon: Receipt },
            { key: "ar", label: "Monitoring Piutang (AR)", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Periode Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">Periode:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-semibold text-[11px]">
            {[
              { key: "YTD", label: "YTD 2026" },
              { key: "Q3", label: "Q3 2026" },
              { key: "OKT", label: "Okt 2026" },
              { key: "SEP", label: "Sep 2026" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPeriod(p.key as any)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedPeriod === p.key ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── KONTEN TAB UTAMA ────────────────────────────────────────────────── */}

      {/* ========================================================================= */}
      {/* 1. TAB LABA RUGI (INCOME STATEMENT / P&L) */}
      {/* ========================================================================= */}
      {activeTab === "pnl" && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-6 bg-slate-900/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                Laporan Laba Rugi Komprehensif
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  {selectedPeriod} 2026
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                PT. TEXORA VISI PRIMA • Satuan Nilai dalam Rupiah Penuh (IDR)
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>Standar Akuntansi: SAK ETAP</div>
              <div className="text-emerald-400 font-bold">Status: Audited Final</div>
            </div>
          </div>

          <div className="space-y-6 text-xs font-mono">
            
            {/* PENDAPATAN */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 font-sans font-bold text-white text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  PENDAPATAN USAHA (REVENUE)
                </span>
                <span className="font-mono text-emerald-400">{formatRupiah(1485200000)}</span>
              </div>
              <div className="pl-4 pr-4 space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Penjualan Kain Sublimasi Roll (Dryfit Milano, Voal, Satin, Scuba)</span>
                  <span className="text-white">{formatRupiah(1150000000)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Jasa Cetak & Heatpress Roll-to-Roll (Order Maklon Brand)</span>
                  <span className="text-white">{formatRupiah(285200000)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>• Jasa Custom Motif Digital & Color Proofing</span>
                  <span className="text-white">{formatRupiah(50000000)}</span>
                </div>
              </div>
            </div>

            {/* HARGA POKOK PENJUALAN (HPP) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 font-sans font-bold text-white text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  HARGA POKOK PENJUALAN (HPP / COGS)
                </span>
                <span className="font-mono text-red-400">({formatRupiah(938650000)})</span>
              </div>
              <div className="pl-4 pr-4 space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Bahan Baku Kain Poliester Mentah (Greige Fabric)</span>
                  <span>({formatRupiah(520000000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Tinta Dispersi Sublimasi Ramah Lingkungan (Oeko-Tex Standard 100)</span>
                  <span>({formatRupiah(185000000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Kertas Transfer Sublimasi Khusus Roll (100 GSM Fast Dry)</span>
                  <span>({formatRupiah(98400000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Beban Energi Listrik & Gas Kalender Rotary Heatpress 210°C</span>
                  <span>({formatRupiah(82500000)})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>• Upah Tenaga Kerja Langsung (Operator Cetak & Kalender)</span>
                  <span>({formatRupiah(52750000)})</span>
                </div>
              </div>
            </div>

            {/* LABA KOTOR */}
            <div className="flex justify-between items-center bg-cyan-950/30 px-5 py-3 rounded-xl border border-cyan-500/30 text-white font-sans font-bold text-sm">
              <div>
                <span className="text-accent-cyan uppercase tracking-wider block">LABA KOTOR (GROSS PROFIT)</span>
                <span className="text-slate-400 text-xs font-normal">Gross Profit Margin: 36.80%</span>
              </div>
              <span className="font-mono text-accent-cyan text-base">{formatRupiah(546550000)}</span>
            </div>

            {/* BEBAN OPERASIONAL (OPEX) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 font-sans font-bold text-white text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  BEBAN OPERASIONAL & UMUM (OPEX)
                </span>
                <span className="font-mono text-amber-400">({formatRupiah(256200000)})</span>
              </div>
              <div className="pl-4 pr-4 space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Gaji Manajemen, Tim Sales B2B & Administrasi Kantor</span>
                  <span>({formatRupiah(124000000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Sewa & Fasilitas Pabrik (Jl. Walang Baru VI Tanjung Priok)</span>
                  <span>({formatRupiah(45000000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Ekspedisi Kargo Roll & Logistik Pengiriman Antar-Pulau</span>
                  <span>({formatRupiah(38400000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Pemeliharaan Mesin, Sparepart & Kalibrasi Profil Warna ICC</span>
                  <span>({formatRupiah(22500000)})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span>• Pemasaran Digital, Katalog Bahan & Media Sosial</span>
                  <span>({formatRupiah(16800000)})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>• Beban Perlengkapan & Keperluan Kantor Umum</span>
                  <span>({formatRupiah(9500000)})</span>
                </div>
              </div>
            </div>

            {/* LABA OPERASIONAL / EBITDA */}
            <div className="flex justify-between items-center bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-800 text-white font-sans font-bold text-sm">
              <span className="text-slate-300">LABA USAHA / OPERASIONAL (EBITDA)</span>
              <span className="font-mono text-white">{formatRupiah(290350000)}</span>
            </div>

            {/* PAJAK PPH */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 text-slate-400">
              <span>Estimasi Beban Pajak Penghasilan (PPh Badan Final / CoreTax)</span>
              <span className="text-red-400 font-mono">({formatRupiah(17070000)})</span>
            </div>

            {/* LABA BERSIH (NET INCOME) */}
            <div className="flex justify-between items-center bg-emerald-950/40 px-5 py-4 rounded-2xl border-2 border-emerald-500/40 text-white font-sans font-black text-base shadow-lg">
              <div>
                <span className="text-emerald-400 uppercase tracking-wider block">LABA BERSIH TAHUN BERJALAN (NET PROFIT)</span>
                <span className="text-slate-300 text-xs font-normal">Net Profit Margin: 18.40% • Siap untuk Dividen / Cadangan</span>
              </div>
              <span className="font-mono text-emerald-400 text-xl">{formatRupiah(273280000)}</span>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB NERACA KEUANGAN (BALANCE SHEET) */}
      {/* ========================================================================= */}
      {activeTab === "balance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SISI AKTIVA / ASET */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-5 bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <span>AKTIVA / TOTAL ASET</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatRupiah(2450000000)}
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Aset Lancar */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-slate-300 text-xs flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span>ASET LANCAR (CURRENT ASSETS)</span>
                  <span className="text-white">{formatRupiah(1312000000)}</span>
                </h4>
                <div className="space-y-1.5 pl-2 text-slate-300">
                  <div className="flex justify-between py-0.5">
                    <span>Kas & Bank BCA (Rek. 128-300-8899)</span>
                    <span className="text-white">{formatRupiah(485500000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Bank Mandiri Rekening Operasional</span>
                    <span className="text-white">{formatRupiah(157000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Piutang Usaha B2B (AR Lancar TOP 30)</span>
                    <span className="text-white">{formatRupiah(284000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Persediaan Kain Mentah & Gulungan Jadi (Stock)</span>
                    <span className="text-white">{formatRupiah(360500000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Uang Muka Biaya & Perlengkapan Cetak</span>
                    <span className="text-white">{formatRupiah(25000000)}</span>
                  </div>
                </div>
              </div>

              {/* Aset Tetap */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-sans font-bold text-slate-300 text-xs flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span>ASET TETAP (FIXED ASSETS - NET)</span>
                  <span className="text-white">{formatRupiah(1138000000)}</span>
                </h4>
                <div className="space-y-1.5 pl-2 text-slate-300">
                  <div className="flex justify-between py-0.5">
                    <span>Mesin Printer Sublimasi 1440 DPI (4 Unit)</span>
                    <span>{formatRupiah(680000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Mesin Rotary Kalender Heatpress 210°C (2 Unit)</span>
                    <span>{formatRupiah(420000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Meja Inspeksi, Barcode & Mesin Cutting</span>
                    <span>{formatRupiah(95000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Armada Kendaraan Logistik Roll</span>
                    <span>{formatRupiah(165000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-red-400">
                    <span>Akumulasi Penyusutan Aset Tetap</span>
                    <span>({formatRupiah(222000000)})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-center text-sm font-sans font-bold text-white bg-slate-950 p-3 rounded-xl">
                <span>TOTAL ASET</span>
                <span className="font-mono text-emerald-400">{formatRupiah(2450000000)}</span>
              </div>
            </div>
          </div>

          {/* SISI PASIVA / KEWAJIBAN & EKUITAS */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-5 bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent-cyan" />
                <span>PASIVA / KEWAJIBAN & EKUITAS</span>
              </h3>
              <span className="text-xs font-mono font-bold text-accent-cyan">
                {formatRupiah(2450000000)}
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Kewajiban / Liabilitas */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-slate-300 text-xs flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span>LIABILITAS JANGKA PENDEK (UTANG USAHA)</span>
                  <span className="text-white">{formatRupiah(396720000)}</span>
                </h4>
                <div className="space-y-1.5 pl-2 text-slate-300">
                  <div className="flex justify-between py-0.5">
                    <span>Utang Usaha Supplier Bahan Baku Kain & Benang</span>
                    <span className="text-white">{formatRupiah(215000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Uang Muka Penjualan Customer (DP Pesanan)</span>
                    <span className="text-white">{formatRupiah(98400000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Utang Pajak PPN (CoreTax 11%) & PPh 21</span>
                    <span className="text-white">{formatRupiah(38320000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Beban Akrual & Gaji yang Masih Harus Dibayar</span>
                    <span className="text-white">{formatRupiah(45000000)}</span>
                  </div>
                </div>
              </div>

              {/* Ekuitas */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-sans font-bold text-slate-300 text-xs flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span>EKUITAS (MODAL BERSIH PEMILIK)</span>
                  <span className="text-white">{formatRupiah(2053280000)}</span>
                </h4>
                <div className="space-y-1.5 pl-2 text-slate-300">
                  <div className="flex justify-between py-0.5">
                    <span>Modal Disetor Saham Pendiri PT. Texora Visi Prima</span>
                    <span>{formatRupiah(1200000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Saldo Laba Ditahan (Retained Earnings)</span>
                    <span>{formatRupiah(580000000)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-emerald-400 font-semibold">
                    <span>Laba Bersih Tahun Berjalan (Net Profit YTD)</span>
                    <span>{formatRupiah(273280000)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-center text-sm font-sans font-bold text-white bg-slate-950 p-3 rounded-xl">
                <span>TOTAL LIABILITAS & EKUITAS</span>
                <span className="font-mono text-accent-cyan">{formatRupiah(2450000000)}</span>
              </div>

              {/* Status Balance */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-300 font-sans">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  NERACA SEIMBANG (100% BALANCE)
                </span>
                <span className="font-mono">Selisih: Rp 0 (Sempurna)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB ARUS KAS (CASH FLOW STATEMENT) */}
      {/* ========================================================================= */}
      {activeTab === "cashflow" && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-6 bg-slate-900/80">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white font-display">
              Laporan Arus Kas (Metode Langsung)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              PT. TEXORA VISI PRIMA • Periode Berjalan 2026
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Arus Kas Operasi */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-sans font-bold text-sm text-emerald-400 border-b border-slate-800 pb-2">
                <span>ARUS KAS DARI AKTIVITAS OPERASI</span>
                <span>+{formatRupiah(307000000)}</span>
              </div>
              <div className="space-y-1 text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span>Penerimaan Kas dari Pelanggan B2B & Penjualan Kain</span>
                  <span className="text-white">+{formatRupiah(1380000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran Kas ke Pemasok Kain & Tinta Sublimasi</span>
                  <span className="text-red-400">({formatRupiah(820000000)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran Kas untuk Beban Operasional, Listrik & Gaji</span>
                  <span className="text-red-400">({formatRupiah(235000000)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran Setoran Pajak PPN & PPh Final</span>
                  <span className="text-red-400">({formatRupiah(18000000)})</span>
                </div>
              </div>
            </div>

            {/* Arus Kas Investasi */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-sans font-bold text-sm text-cyan-400 border-b border-slate-800 pb-2">
                <span>ARUS KAS DARI AKTIVITAS INVESTASI</span>
                <span className="text-red-400">({formatRupiah(65000000)})</span>
              </div>
              <div className="space-y-1 text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span>Pengadaan Sparepart Head Mesin Digital Sublimasi & Meja Roll</span>
                  <span className="text-red-400">({formatRupiah(65000000)})</span>
                </div>
              </div>
            </div>

            {/* Kenaikan Bersih & Saldo Akhir */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Kenaikan Bersih Kas & Bank Tahun Berjalan:</span>
                <span className="font-bold text-emerald-400">+{formatRupiah(242000000)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Saldo Awal Kas & Bank (01 Jan 2026):</span>
                <span>{formatRupiah(400500000)}</span>
              </div>
              <div className="flex justify-between font-sans font-bold text-base text-white pt-2 border-t border-slate-800">
                <span>SALDO AKHIR KAS & BANK PERUSAHAAN (BCA + MANDIRI):</span>
                <span className="font-mono text-emerald-400">{formatRupiah(642500000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB BUKU BESAR & JURNAL TRANSAKSI (GENERAL LEDGER) */}
      {/* ========================================================================= */}
      {activeTab === "journal" && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-4 bg-slate-900/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Buku Besar & Jurnal Transaksi Terkini
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pencatatan real-time voucher kas masuk (BKM) dan voucher kas keluar (BKK).
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder="Cari voucher / deskripsi..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">No. Bukti</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Deskripsi Transaksi</th>
                  <th className="py-2.5 px-3">Debit</th>
                  <th className="py-2.5 px-3">Kredit</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredJournals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-brand-400 font-bold whitespace-nowrap">
                      {item.voucherNo}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200 min-w-[240px]">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 text-[11px] whitespace-nowrap">
                      {item.accountDebit}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 text-[11px] whitespace-nowrap">
                      {item.accountCredit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "AUDITED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB MONITORING PIUTANG B2B (AR AGING) */}
      {/* ========================================================================= */}
      {activeTab === "ar" && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl space-y-5 bg-slate-900/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Monitoring Piutang Usaha & Termin Pembayaran (AR Aging)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengawasan tempo kredit klien garmen (TOP 14 / TOP 30 Hari). Total Piutang: <strong className="text-amber-300 font-mono">{formatRupiah(284000000)}</strong>
              </p>
            </div>
            <Link
              href="/portal/crm/inbox"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Follow-up Penagihan via WhatsApp</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Nama Mitra Garmen / Buyer</th>
                  <th className="py-2.5 px-3">Nomor Invoice</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right">Nilai Piutang</th>
                  <th className="py-2.5 px-3 text-center">Umur Piutang</th>
                  <th className="py-2.5 px-3 text-center">Status Kolektibilitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {arAgingData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {item.companyName}
                    </td>
                    <td className="py-3 px-3 text-brand-400">
                      {item.invoiceNo}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.dueDate}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">
                      {item.daysAging} Hari
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === "LANCAR"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.status === "LANCAR" ? "🟢 Lancar" : "🟡 Jatuh Tempo 7 Hari"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INPUT JURNAL TRANSAKSI BARU (MOCKUP INTERAKTIF PRESENTASI) */}
      {/* ========================================================================= */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Input Transaksi Jurnal Keuangan</h3>
                <p className="text-xs text-slate-400">Catat voucher kas masuk atau pengeluaran pabrik baru</p>
              </div>
              <button
                onClick={() => setShowAddJournalModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJournal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nomor Voucher</label>
                  <input
                    value={newJournalForm.voucherNo}
                    onChange={(e) => setNewJournalForm(p => ({ ...p, voucherNo: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tanggal</label>
                  <input
                    value={newJournalForm.date}
                    onChange={(e) => setNewJournalForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Keterangan Transaksi</label>
                <textarea
                  required
                  rows={2}
                  value={newJournalForm.description}
                  onChange={(e) => setNewJournalForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Contoh: Penerimaan pembayaran termin kain dryfit jersey 1.000 meter..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Akun Debit</label>
                  <select
                    value={newJournalForm.accountDebit}
                    onChange={(e) => setNewJournalForm(p => ({ ...p, accountDebit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="1101 - Kas & Bank BCA">1101 - Kas & Bank BCA</option>
                    <option value="1102 - Bank Mandiri Operasional">1102 - Bank Mandiri Operasional</option>
                    <option value="5101 - HPP Bahan Kain Mentah">5101 - HPP Bahan Kain Mentah</option>
                    <option value="5102 - HPP Tinta Sublimasi">5102 - HPP Tinta Sublimasi</option>
                    <option value="6101 - Beban Gaji & Operasional">6101 - Beban Gaji & Operasional</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Akun Kredit</label>
                  <select
                    value={newJournalForm.accountCredit}
                    onChange={(e) => setNewJournalForm(p => ({ ...p, accountCredit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="4101 - Pendapatan Cetak Sublimasi">4101 - Pendapatan Cetak Sublimasi</option>
                    <option value="1120 - Piutang Usaha B2B">1120 - Piutang Usaha B2B</option>
                    <option value="2120 - Uang Muka Penjualan (DP)">2120 - Uang Muka Penjualan (DP)</option>
                    <option value="1101 - Kas & Bank BCA">1101 - Kas & Bank BCA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newJournalForm.amount}
                  onChange={(e) => setNewJournalForm(p => ({ ...p, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-accent-cyan"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddJournalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Posting Jurnal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
