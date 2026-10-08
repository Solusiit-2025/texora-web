"use client";

import { useMemo } from "react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatRupiah, formatNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  Ruler,
  Printer,
  ArrowUpRight,
  Package,
} from "lucide-react";

const DARK_TOOLTIP = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#f1f5f9",
  fontSize: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Sportswear & Activewear": "#f59e0b",
  "Busana Muslim & Hijab": "#a78bfa",
  "Home Living & Interior": "#34d399",
  "Merchandise & Event": "#38bdf8",
};

const MONTHLY_REVENUE = [
  { month: "Mei", omzet: 182000000, order: 31 },
  { month: "Jun", omzet: 195500000, order: 34 },
  { month: "Jul", omzet: 208000000, order: 36 },
  { month: "Agu", omzet: 224500000, order: 38 },
  { month: "Sep", omzet: 231000000, order: 40 },
  { month: "Okt", omzet: 248500000, order: 42 },
];

const CATEGORY_BREAKDOWN = [
  { name: "Sportswear & Activewear", value: 111825000 },
  { name: "Busana Muslim & Hijab", value: 74550000 },
  { name: "Home Living & Interior", value: 37275000 },
  { name: "Merchandise & Event", value: 24850000 },
];

const TOP_CUSTOMERS = [
  { name: "Apparel Prima", value: 62500000, meters: 2600 },
  { name: "Zahra Hijab", value: 48300000, meters: 2100 },
  { name: "Bank Mandiri", value: 35400000, meters: 1500 },
  { name: "Event Solution", value: 28600000, meters: 1200 },
  { name: "Kreasi Promosi", value: 21400000, meters: 900 },
];

const formatJt = (v: number) => `${Math.round(v / 1_000_000)}jt`;

export default function SalesReportPage() {
  const latest = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const previous = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
  const growthPct = Math.round(((latest.omzet - previous.omzet) / previous.omzet) * 1000) / 10;

  const kpis = [
    {
      label: "Total Omzet (Bulan Ini)",
      value: formatRupiah(latest.omzet),
      sub: `+${growthPct}% dibanding bulan lalu`,
      icon: TrendingUp,
      tone: "text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Total Sales Order",
      value: `${latest.order} SO`,
      sub: "SPK diterbitkan bulan ini",
      icon: ShoppingCart,
      tone: "text-brand-400 bg-brand-500/10",
    },
    {
      label: "Rata-rata Nilai Order",
      value: formatRupiah(Math.round(latest.omzet / latest.order)),
      sub: "Per sales order",
      icon: Receipt,
      tone: "text-accent-cyan bg-accent-cyan/10",
    },
    {
      label: "Total Meter Terjual",
      value: "14.850 m",
      sub: "Dryfit, voal, satin & lainnya",
      icon: Ruler,
      tone: "text-accent-amber bg-accent-amber/10",
    },
  ];

  const totalMeterSample = useMemo(
    () => MOCK_ORDERS.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.lengthMeters, 0), 0),
    []
  );

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              CRM & Penjualan — Rekap Penjualan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display mt-1">
            Rekap Penjualan & Sales Order
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
            Ringkasan omzet, tren penjualan, dan rincian sales order untuk kebutuhan evaluasi performa penjualan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-lg ${kpi.tone} shrink-0`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums break-words leading-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 leading-snug">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Trend + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Tren Omzet 6 Bulan Terakhir
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pertumbuhan omzet bulanan (Mei – Oktober)</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" fontSize={11} tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis fontSize={11} tickFormatter={formatJt} tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={DARK_TOOLTIP} formatter={(v: any) => [formatRupiah(v), "Omzet"]} />
                <Area type="monotone" dataKey="omzet" name="Omzet" stroke="#f59e0b" fill="url(#gOmzet)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-400" /> Omzet per Kategori Produk
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Kontribusi tiap kategori kain</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_BREAKDOWN}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {CATEGORY_BREAKDOWN.map((d) => (
                    <Cell key={d.name} fill={CATEGORY_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={DARK_TOOLTIP} formatter={(v: any) => [formatRupiah(v), "Omzet"]} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Top Customers */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-accent-violet" /> Top Pelanggan (Berdasarkan Omzet)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Lima pelanggan dengan kontribusi omzet terbesar</p>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_CUSTOMERS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" fontSize={11} tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis fontSize={11} tickFormatter={formatJt} tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={DARK_TOOLTIP} formatter={(v: any) => [formatRupiah(v), "Omzet"]} cursor={{ fill: "#1e293b" }} />
              <Bar dataKey="value" name="Omzet" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Order Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Rekap Sales Order Terbaru (Sampel)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:block">
            Total: {MOCK_ORDERS.length} SO · {formatNumber(totalMeterSample)} m
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-4 whitespace-nowrap">No. Sales Order</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Kain & Meter</th>
                <th className="p-4 text-right whitespace-nowrap">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">PIC Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {MOCK_ORDERS.map((order) => {
                const meters = order.items.reduce((s, i) => s + i.lengthMeters, 0);
                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-mono font-bold text-white whitespace-nowrap">{order.orderNumber}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{order.createdAt}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-white">{order.customerCompany}</div>
                      <div className="text-slate-400 text-[10px]">{order.customerName}</div>
                    </td>
                    <td className="p-4 align-top">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-slate-300">
                          {item.fabricName} · <span className="text-white font-mono">{item.lengthMeters} m</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 align-top text-right font-mono font-bold text-accent-cyan whitespace-nowrap">
                      {formatRupiah(order.totalAmount)}
                    </td>
                    <td className="p-4 align-top">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                          order.status === "SHIPPED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : order.status === "IN_PRODUCTION"
                            ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40"
                            : order.status === "QUALITY_CONTROL"
                            ? "bg-accent-violet/15 text-accent-violet border-accent-violet/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 align-top text-slate-300 whitespace-nowrap">Rian Pratama</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
