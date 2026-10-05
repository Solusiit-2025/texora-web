"use client";

import Link from "next/link";
import {
  MOCK_ORDERS,
  MOCK_LEADS,
  MOCK_INVENTORY
} from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  Layers,
  Cpu,
  Users,
  Barcode,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileCheck
} from "lucide-react";

export default function PortalDashboard() {
  const totalPipelineValue = MOCK_LEADS.reduce((acc, lead) => acc + lead.estimatedValue, 0);
  const totalInProductionOrders = MOCK_ORDERS.filter(o => o.status === "IN_PRODUCTION" || o.status === "QUALITY_CONTROL");

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 min-w-0">

      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-5 sm:pb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display leading-tight">
            Executive Control Center
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
            Ringkasan performa penjualan, pipeline CRM, antrean cetak sublimasi mesin, dan ketersediaan stok bahan baku.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:flex gap-2 shrink-0">
          <Link
            href="/portal/crm/leads"
            className="px-4 py-3 lg:py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Tambah Lead Prospek</span>
          </Link>
          <Link
            href="/portal/warehouse/inventory"
            className="px-4 py-3 lg:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] whitespace-nowrap"
          >
            <Barcode className="w-4 h-4 text-accent-cyan shrink-0" />
            <span className="truncate">Scan Roll Kain</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid — 1 kolom HP, 2 kolom tablet, 4 kolom desktop */}
      <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">

        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">Omzet Bulan Ini</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums break-words leading-tight">Rp 248.500.000</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1.5 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-snug">+18.4% dibandingkan bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">Meter Kain Terproduksi</span>
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">14.850 m</div>
            <div className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              Rata-rata 495 m / hari (Kapasitas: 65%)
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">Nilai Pipeline CRM</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums break-words leading-tight">{formatRupiah(totalPipelineValue)}</div>
            <div className="text-[11px] text-brand-300 mt-1.5">
              {MOCK_LEADS.length} Kontrak Prospek Aktif
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">Stok Gudang Roll</span>
            <div className="p-2 rounded-lg bg-accent-amber/10 text-accent-amber shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">21.500 m</div>
            <div className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              184 Roll Aktif (Dryfit, Voal, Scuba)
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">

        {/* Left Column: Live Production & SPK Queue */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4 min-w-0">
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 min-w-0">
              <Cpu className="w-4 h-4 text-accent-cyan shrink-0" />
              <span className="truncate">Antrean Produksi Sublimasi Waktu Nyata</span>
            </h3>
            <Link
              href="/portal/oms/orders"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold shrink-0 py-1"
            >
              Kelola Semua Pesanan &gt;
            </Link>
          </div>

          <div className="space-y-3">
            {totalInProductionOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 sm:p-4 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 transition-colors space-y-3 min-w-0 overflow-hidden"
              >
                <div className="flex flex-col min-[560px]:flex-row min-[560px]:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-sm text-white">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2 truncate">— {order.customerCompany}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 self-start min-[560px]:self-auto whitespace-nowrap">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col min-[420px]:flex-row min-[420px]:justify-between gap-0.5 min-[420px]:gap-2 text-slate-300">
                      <span className="min-w-0 truncate">• {item.fabricName} ({item.gsm} GSM)</span>
                      <span className="font-mono font-bold text-white tabular-nums shrink-0">{item.lengthMeters} Meter</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                  <span className="truncate">Target Selesai: Hari Ini 17:00 WIB</span>
                  <span className="text-emerald-400 font-semibold whitespace-nowrap">Proofing Disetujui ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: CRM Leads Pipeline Highlights */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4 min-w-0">
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-accent-violet shrink-0" />
              <span className="truncate">Pipeline Prospek Terkini (CRM)</span>
            </h3>
            <Link
              href="/portal/crm/leads"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold shrink-0 py-1"
            >
              Buka Kanban Board &gt;
            </Link>
          </div>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-1 gap-3">
            {MOCK_LEADS.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="p-3.5 sm:p-4 rounded-xl glass-panel border border-slate-800 space-y-2 text-xs min-w-0 overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-white text-[13px] leading-snug min-w-0 flex-1">{lead.companyName}</div>
                  <span className="px-2 py-1 rounded bg-slate-900 text-brand-300 border border-brand-500/30 font-bold text-[10px] whitespace-nowrap shrink-0">
                    {lead.stage.replace("_", " ")}
                  </span>
                </div>

                <p className="text-slate-400 line-clamp-1">{lead.title}</p>

                <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800/80 font-mono">
                  <span className="text-slate-400 tabular-nums truncate">{lead.estimatedMeters} Meter</span>
                  <span className="font-bold text-accent-cyan tabular-nums whitespace-nowrap">{formatRupiah(lead.estimatedValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
