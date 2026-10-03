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
    <div className="space-y-8">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Executive Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ringkasan performa penjualan, pipeline CRM, antrean cetak sublimasi mesin, dan ketersediaan stok bahan baku.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/portal/crm/leads"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Lead Prospek</span>
          </Link>
          <Link
            href="/portal/warehouse/inventory"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Barcode className="w-4 h-4 text-accent-cyan" />
            <span>Scan Roll Kain</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Omzet Bulan Ini</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">Rp 248.500.000</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% dibandingkan bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Meter Kain Terproduksi</span>
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">14.850 m</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rata-rata 495 m / hari (Kapasitas: 65%)
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Nilai Pipeline CRM</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{formatRupiah(totalPipelineValue)}</div>
            <div className="text-[11px] text-brand-300 mt-1">
              {MOCK_LEADS.length} Kontrak Prospek Aktif
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Stok Gudang Roll</span>
            <div className="p-2 rounded-lg bg-accent-amber/10 text-accent-amber">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">21.500 m</div>
            <div className="text-[11px] text-slate-400 mt-1">
              184 Roll Aktif (Dryfit, Voal, Scuba)
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Production & SPK Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-cyan" />
              <span>Antrean Produksi Sublimasi Waktu Nyata</span>
            </h3>
            <Link
              href="/portal/oms/orders"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Kelola Semua Pesanan &gt;
            </Link>
          </div>

          <div className="space-y-3">
            {totalInProductionOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-white">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2">— {order.customerCompany}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 self-start sm:self-auto">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-300">
                      <span>• {item.fabricName} ({item.gsm} GSM)</span>
                      <span className="font-mono font-bold text-white">{item.lengthMeters} Meter</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target Selesai: Hari Ini 17:00 WIB</span>
                  <span className="text-emerald-400 font-semibold">Proofing Disetujui ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: CRM Leads Pipeline Highlights */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-violet" />
              <span>Pipeline Prospek Terkini (CRM)</span>
            </h3>
            <Link
              href="/portal/crm/leads"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Buka Kanban Board &gt;
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_LEADS.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-white">{lead.companyName}</div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-brand-300 border border-brand-500/30 font-bold text-[10px]">
                    {lead.stage.replace("_", " ")}
                  </span>
                </div>

                <p className="text-slate-400 line-clamp-1">{lead.title}</p>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono">
                  <span className="text-slate-400">{lead.estimatedMeters} Meter</span>
                  <span className="font-bold text-accent-cyan">{formatRupiah(lead.estimatedValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
