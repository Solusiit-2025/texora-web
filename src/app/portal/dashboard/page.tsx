"use client";

import Link from "next/link";
import { useState } from "react";
import { MOCK_ORDERS, MOCK_LEADS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { LeadStage } from "@/types";
import {
  TrendingUp,
  Layers,
  Cpu,
  Users,
  Barcode,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileCheck,
  FileText,
  MessageCircle,
  MessagesSquare,
  Mail,
  BarChart3,
  ClipboardList,
  Scissors,
  Landmark,
  ShoppingCart,
  Sliders,
  ShieldAlert,
  Settings,
  Wallet,
  Clock,
  Truck,
  Activity,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// DATA SAMPEL (mockup presentasi — tidak terhubung database)
// ─────────────────────────────────────────────────────────────
const REVENUE_TREND = [
  { m: "Mei", v: 168 },
  { m: "Jun", v: 182 },
  { m: "Jul", v: 175 },
  { m: "Agu", v: 204 },
  { m: "Sep", v: 210 },
  { m: "Okt", v: 248.5 },
];

const AR_AGING = [
  { label: "Lancar (0–30 hari)", value: 198_000_000, pct: 70, color: "bg-emerald-500" },
  { label: "31–60 hari", value: 58_000_000, pct: 20, color: "bg-amber-500" },
  { label: "> 60 hari", value: 28_000_000, pct: 10, color: "bg-red-500" },
];

const PURCHASE_ORDERS = [
  { no: "PO-2026-1042", supplier: "PT. Polyester Nusantara", item: "Greige Dryfit 2.000 m", value: 52_000_000, status: "Menunggu Approval" },
  { no: "PO-2026-1041", supplier: "CV. Tinta Prima Global", item: "Tinta Dispersi 200 L", value: 32_500_000, status: "Dalam Pengiriman" },
  { no: "PO-2026-1039", supplier: "PT. Kertas Transfer Indo", item: "Paper Roll 100 GSM", value: 18_400_000, status: "Diterima Gudang" },
];

const ACTIVITY_FEED = [
  { time: "09:05", icon: ShoppingCart, color: "text-emerald-400", text: "Checkout Web Storefront: Pesanan Baru #ORD-2026-X104 (PT. Garment Kreatif) senilai Rp 48.500.000 diterima" },
  { time: "08:42", icon: MessageCircle, color: "text-emerald-400", text: "WhatsApp masuk dari PT. Intech Mitra Abadi — konfirmasi PO 1.500 m" },
  { time: "08:30", icon: FileCheck, color: "text-cyan-400", text: "Digital proof motif jersey Garuda FC disetujui klien" },
  { time: "08:15", icon: Landmark, color: "text-emerald-400", text: "Pelunasan invoice INV-2026-X092 Rp 48.000.000 diterima (BCA)" },
  { time: "07:58", icon: Mail, color: "text-brand-400", text: "SPH/TXR/2026/10-742 terkirim via Webmail ke procurement@intechmitra.co.id" },
  { time: "07:40", icon: Scissors, color: "text-amber-400", text: "Roll RL-DRY-0921 dipotong 320 m & siap ekspedisi JNE Cargo" },
];

const STAGE_META: { key: LeadStage; label: string; color: string }[] = [
  { key: "NEW_INQUIRY", label: "Inkuiri", color: "bg-slate-500" },
  { key: "REQUIREMENT_GATHERING", label: "Sampel", color: "bg-brand-500" },
  { key: "QUOTATION_SENT", label: "SPH", color: "bg-cyan-500" },
  { key: "NEGOTIATION", label: "Negosiasi", color: "bg-amber-500" },
  { key: "WON", label: "Won", color: "bg-emerald-500" },
];

type Period = "HARI_INI" | "BULAN_INI" | "YTD";

// Judul section dengan penjelasan singkat agar mudah dipahami audiens
function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  desc,
  href,
  linkLabel,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  desc: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
      </div>
      {href && (
        <Link
          href={href}
          className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold shrink-0 flex items-center gap-0.5 whitespace-nowrap"
        >
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export default function PortalDashboard() {
  const [period, setPeriod] = useState<Period>("BULAN_INI");

  const totalPipelineValue = MOCK_LEADS.reduce((acc, l) => acc + l.estimatedValue, 0);
  const productionOrders = MOCK_ORDERS.filter(
    (o) => o.status === "IN_PRODUCTION" || o.status === "QUALITY_CONTROL"
  );
  const stageCounts = STAGE_META.map((s) => ({
    ...s,
    count: MOCK_LEADS.filter((l) => l.stage === s.key).length,
    value: MOCK_LEADS.filter((l) => l.stage === s.key).reduce((a, l) => a + l.estimatedValue, 0),
  }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));
  const maxRevenue = Math.max(...REVENUE_TREND.map((r) => r.v));

  const periodMultiplier = period === "HARI_INI" ? 0.045 : period === "YTD" ? 5.98 : 1;
  const omzet = Math.round(248_500_000 * periodMultiplier);
  const labaBersih = Math.round(45_720_000 * periodMultiplier);

  // Kartu modul — dipetakan 1:1 dengan menu sidebar
  const MODULES = [
    {
      group: "CRM & Penjualan",
      accent: "from-violet-500/20 to-brand-500/10 border-violet-500/30",
      items: [
        { name: "Social Listening", href: "/portal/social-media", icon: MessagesSquare, stat: "12", note: "prospek baru hari ini", color: "text-violet-400" },
        { name: "WhatsApp CRM", href: "/portal/crm/inbox", icon: MessageCircle, stat: "8", note: "chat belum dibalas", color: "text-emerald-400" },
        { name: "Webmail Sales", href: "/portal/crm/webmail", icon: Mail, stat: "5", note: "email & SPH masuk", color: "text-brand-400" },
        { name: "Pipeline Leads", href: "/portal/crm/leads", icon: TrendingUp, stat: String(MOCK_LEADS.length), note: "deal aktif di kanban", color: "text-cyan-400" },
        { name: "Pelanggan 360°", href: "/portal/crm/customers", icon: Users, stat: "412", note: "mitra B2B terdaftar", color: "text-sky-400" },
        { name: "Rekap Penjualan", href: "/portal/sales-report", icon: BarChart3, stat: "+18%", note: "growth vs bulan lalu", color: "text-emerald-400" },
      ],
    },
    {
      group: "OMS & Produksi",
      accent: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30",
      items: [
        { name: "Antrean SPK", href: "/portal/oms/orders", icon: ClipboardList, stat: String(productionOrders.length || 6), note: "SPK sedang diproduksi", color: "text-cyan-400" },
        { name: "Digital Proof", href: "/portal/oms/custom-orders", icon: FileCheck, stat: "3", note: "menunggu approval", color: "text-amber-400" },
        { name: "Faktur & CoreTax", href: "/portal/oms/invoices", icon: FileText, stat: "24", note: "faktur PPN bulan ini", color: "text-brand-400" },
      ],
    },
    {
      group: "Gudang & Logistik",
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
      items: [
        { name: "Stok Roll & Barcode", href: "/portal/warehouse/inventory", icon: Barcode, stat: "184", note: "roll aktif • 21.500 m", color: "text-amber-400" },
        { name: "Cutting & Ekspedisi", href: "/portal/warehouse/fulfillment", icon: Scissors, stat: "9", note: "paket siap kirim", color: "text-orange-400" },
      ],
    },
    {
      group: "Finance & Pengadaan",
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      items: [
        { name: "Laporan Keuangan", href: "/portal/finance", icon: Landmark, stat: "18,4%", note: "net profit margin", color: "text-emerald-400" },
        { name: "Purchasing & Supplier", href: "/portal/purchasing", icon: ShoppingCart, stat: "3", note: "PO butuh tindak lanjut", color: "text-teal-400" },
      ],
    },
    {
      group: "Katalog & Sistem",
      accent: "from-slate-500/20 to-slate-700/10 border-slate-600/40",
      items: [
        { name: "Katalog & Pricing", href: "/portal/catalog-management", icon: Sliders, stat: "18", note: "jenis kain aktif", color: "text-slate-300" },
        { name: "Audit & 2FA", href: "/portal/audit-logs", icon: ShieldAlert, stat: "0", note: "insiden keamanan", color: "text-emerald-400" },
        { name: "Sistem & RBAC", href: "/portal/settings", icon: Settings, stat: "4", note: "role pengguna", color: "text-slate-300" },
      ],
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-7 min-w-0">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
              PT. Texora Visi Prima • Live Overview
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display leading-tight mt-1">
            Executive Control Center
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
            Satu layar untuk seluruh operasional: CRM omnichannel, pipeline penawaran, produksi sublimasi,
            gudang roll, keuangan, dan pengadaan bahan baku.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            {([
              { k: "HARI_INI", l: "Hari Ini" },
              { k: "BULAN_INI", l: "Okt 2026" },
              { k: "YTD", l: "YTD 2026" },
            ] as { k: Period; l: string }[]).map((p) => (
              <button
                key={p.k}
                onClick={() => setPeriod(p.k)}
                className={`flex-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  period === p.k ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
          <Link
            href="/portal/crm/leads"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 min-h-[40px] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Lead / SPH Baru
          </Link>
          <Link
            href="/portal/warehouse/inventory"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 min-h-[40px] whitespace-nowrap"
          >
            <Barcode className="w-4 h-4 text-accent-cyan" />
            Scan Roll
          </Link>
        </div>
      </div>

      {/* ── RINGKASAN BAHASA SEDERHANA ─────────────────────────── */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-600/15 via-slate-900/60 to-emerald-600/10 p-4 sm:p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-300 mb-2.5">
          Ringkasan Singkat untuk Manajemen
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, color: "text-emerald-400", title: "Penjualan naik", text: "Omzet Oktober Rp 248,5 jt, tumbuh 18,4% dibanding September." },
            { icon: Cpu, color: "text-cyan-400", title: "Produksi lancar", text: "14.850 m kain tercetak; mesin terpakai 65% — masih ada ruang order." },
            { icon: AlertTriangle, color: "text-amber-400", title: "Perlu perhatian", text: "3 proof menunggu approval, stok Voal Hitam menipis, piutang Rp 28 jt > 60 hari." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.color}`} />
                <div>
                  <div className="text-xs font-bold text-white">{s.title}</div>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── KPI EKSEKUTIF ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Omzet Penjualan", value: formatRupiah(omzet), sub: "+18,4% vs periode lalu", up: true, icon: TrendingUp, tone: "emerald", href: "/portal/sales-report" },
          { label: "Laba Bersih", value: formatRupiah(labaBersih), sub: "Margin 18,4%", up: true, icon: Landmark, tone: "emerald", href: "/portal/finance" },
          { label: "Nilai Pipeline CRM", value: formatRupiah(totalPipelineValue), sub: `${MOCK_LEADS.length} deal aktif`, up: true, icon: Users, tone: "brand", href: "/portal/crm/leads" },
          { label: "Kas & Bank", value: formatRupiah(642_500_000), sub: "BCA + Mandiri", up: true, icon: Wallet, tone: "cyan", href: "/portal/finance" },
          { label: "Meter Terproduksi", value: "14.850 m", sub: "Kapasitas mesin 65%", up: true, icon: Cpu, tone: "cyan", href: "/portal/oms/orders" },
          { label: "Piutang B2B (AR)", value: formatRupiah(284_000_000), sub: "Rp 28 jt > 60 hari", up: false, icon: Clock, tone: "amber", href: "/portal/finance" },
        ].map((k) => {
          const Icon = k.icon;
          const toneMap: Record<string, string> = {
            emerald: "bg-emerald-500/10 text-emerald-400",
            brand: "bg-brand-500/10 text-brand-400",
            cyan: "bg-cyan-500/10 text-cyan-400",
            amber: "bg-amber-500/10 text-amber-400",
          };
          return (
            <Link
              key={k.label}
              href={k.href}
              className="group p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-600 transition-all space-y-2.5 min-w-0 overflow-hidden hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase truncate">{k.label}</span>
                <span className={`p-1.5 rounded-lg shrink-0 ${toneMap[k.tone]}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white font-mono tabular-nums break-words leading-tight">
                {k.value}
              </div>
              <div className={`text-[11px] flex items-center gap-1 font-medium ${k.up ? "text-emerald-400" : "text-amber-400"}`}>
                {k.up ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{k.sub}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── HUB MODUL (sesuai menu sidebar) ────────────────────── */}
      <section className="space-y-3">
        <SectionHeader
          icon={Sparkles}
          iconColor="text-brand-400"
          title="Status Seluruh Modul"
          desc="Angka penting dari setiap menu di sidebar. Klik kartu untuk langsung membuka modulnya."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {MODULES.map((g) => (
            <div key={g.group} className={`rounded-2xl border bg-gradient-to-br ${g.accent} p-4 space-y-3`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{g.group}</div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-600 hover:bg-slate-900 transition-all min-w-0"
                    >
                      <div className={`p-2 rounded-lg bg-slate-900 ${it.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-slate-300 truncate">{it.name}</div>
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span className="text-base font-black text-white font-mono">{it.stat}</span>
                          <span className="text-[10px] text-slate-500 truncate">{it.note}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BARIS 1: TREN OMZET + FUNNEL CRM ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tren omzet */}
        <div className="lg:col-span-7 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 min-w-0">
          <SectionHeader
            icon={BarChart3}
            iconColor="text-emerald-400"
            title="Tren Omzet 6 Bulan"
            desc="Nilai dalam juta Rupiah. Batang hijau = bulan berjalan."
            href="/portal/sales-report"
            linkLabel="Rekap Penjualan"
          />
          <div className="flex items-end gap-2 sm:gap-4 h-44 pt-4">
            {REVENUE_TREND.map((r, i) => {
              const isLast = i === REVENUE_TREND.length - 1;
              return (
                <div key={r.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className={`text-[10px] font-mono font-bold ${isLast ? "text-emerald-400" : "text-slate-400"}`}>
                    {r.v}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isLast
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                        : "bg-gradient-to-t from-slate-700 to-slate-500"
                    }`}
                    style={{ height: `${(r.v / maxRevenue) * 100}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold">{r.m}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Kain Roll</div>
              <div className="text-sm font-bold text-white font-mono">77%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Jasa Cetak</div>
              <div className="text-sm font-bold text-white font-mono">19%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Desain & Proof</div>
              <div className="text-sm font-bold text-white font-mono">4%</div>
            </div>
          </div>
        </div>

        {/* Funnel CRM */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 min-w-0">
          <SectionHeader
            icon={TrendingUp}
            iconColor="text-violet-400"
            title="Perjalanan Calon Pelanggan"
            desc="Dari inkuiri pertama hingga deal ditandatangani (Won)."
            href="/portal/crm/leads"
            linkLabel="Pipeline"
          />
          <div className="space-y-2.5">
            {stageCounts.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">{s.label}</span>
                  <span className="text-slate-400 font-mono">
                    {s.count} deal • <span className="text-white">{formatRupiah(s.value)}</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.max(6, (s.count / maxStage) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
            <Link href="/portal/crm/inbox" className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center hover:bg-emerald-500/20 transition-colors">
              <MessageCircle className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="text-[10px] text-emerald-300 font-bold mt-1">8 WA</div>
            </Link>
            <Link href="/portal/crm/webmail" className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-center hover:bg-brand-500/20 transition-colors">
              <Mail className="w-4 h-4 text-brand-400 mx-auto" />
              <div className="text-[10px] text-brand-300 font-bold mt-1">5 Email</div>
            </Link>
            <Link href="/portal/social-media" className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-center hover:bg-violet-500/20 transition-colors">
              <MessagesSquare className="w-4 h-4 text-violet-400 mx-auto" />
              <div className="text-[10px] text-violet-300 font-bold mt-1">12 Sosmed</div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── BARIS 2: PRODUKSI + KEUANGAN ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Antrean produksi */}
        <div className="lg:col-span-7 space-y-3 min-w-0">
          <SectionHeader
            icon={Cpu}
            iconColor="text-accent-cyan"
            title="Pesanan Sedang Diproduksi"
            desc="Surat Perintah Kerja (SPK) yang sedang dicetak & dicek kualitasnya."
            href="/portal/oms/orders"
            linkLabel="Kelola SPK"
          />

          <div className="space-y-3">
            {productionOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 min-w-0">
                <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="min-w-0 truncate">
                    <span className="font-mono font-bold text-sm text-white">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2">— {order.customerCompany}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 self-start min-[520px]:self-auto whitespace-nowrap">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2 text-xs text-slate-300">
                    <span className="truncate">• {item.fabricName} ({item.gsm} GSM)</span>
                    <span className="font-mono font-bold text-white shrink-0">{item.lengthMeters} m</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target: Hari ini 17:00 WIB</span>
                  <span className="text-emerald-400 font-semibold">Proof disetujui ✓</span>
                </div>
              </div>
            ))}

            {/* Gudang & purchasing alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/portal/warehouse/inventory" className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 hover:bg-amber-500/15 transition-colors">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-amber-200">Stok Menipis</div>
                  <div className="text-amber-100/70">Voal Ultrafine Hitam tersisa 140 m (min. 500 m)</div>
                </div>
              </Link>
              <Link href="/portal/warehouse/fulfillment" className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex gap-3 hover:bg-cyan-500/15 transition-colors">
                <Truck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-cyan-200">9 Paket Siap Kirim</div>
                  <div className="text-cyan-100/70">JNE Cargo 5 • Deliveree 3 • Ambil sendiri 1</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Snapshot keuangan */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 min-w-0">
          <SectionHeader
            icon={Landmark}
            iconColor="text-emerald-400"
            title="Ringkasan Keuangan (YTD)"
            desc="Pendapatan dikurangi biaya = laba bersih perusahaan."
            href="/portal/finance"
            linkLabel="Laporan"
          />

          <div className="space-y-1.5 text-xs font-mono">
            {[
              { l: "Pendapatan", v: 1_485_200_000, c: "text-white" },
              { l: "HPP (COGS)", v: -938_650_000, c: "text-red-400" },
              { l: "Laba Kotor", v: 546_550_000, c: "text-cyan-400" },
              { l: "Beban Operasional", v: -256_200_000, c: "text-red-400" },
            ].map((r) => (
              <div key={r.l} className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">{r.l}</span>
                <span className={r.c}>{r.v < 0 ? `(${formatRupiah(-r.v)})` : formatRupiah(r.v)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-sans font-bold text-emerald-300">Laba Bersih YTD</span>
              <span className="font-bold text-emerald-400">{formatRupiah(273_280_000)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-300 uppercase">Umur Piutang B2B</div>
            <div className="flex h-2.5 rounded-full overflow-hidden">
              {AR_AGING.map((a) => (
                <div key={a.label} className={a.color} style={{ width: `${a.pct}%` }} />
              ))}
            </div>
            {AR_AGING.map((a) => (
              <div key={a.label} className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${a.color}`} />
                  {a.label}
                </span>
                <span className="font-mono text-white">{formatRupiah(a.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BARIS 3: PURCHASING + AKTIVITAS ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Purchasing */}
        <div className="lg:col-span-7 p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0">
          <SectionHeader
            icon={ShoppingCart}
            iconColor="text-teal-400"
            title="Pembelian Bahan Baku"
            desc="Purchase Order (PO) ke supplier kain, tinta, dan kertas transfer."
            href="/portal/purchasing"
            linkLabel="Purchasing"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-2">No. PO</th>
                  <th className="py-2 pr-2">Supplier / Item</th>
                  <th className="py-2 pr-2 text-right">Nilai</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {PURCHASE_ORDERS.map((po) => (
                  <tr key={po.no}>
                    <td className="py-2.5 pr-2 font-mono font-bold text-brand-400 whitespace-nowrap">{po.no}</td>
                    <td className="py-2.5 pr-2">
                      <div className="text-white font-semibold">{po.supplier}</div>
                      <div className="text-slate-500 text-[11px]">{po.item}</div>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-mono text-white whitespace-nowrap">{formatRupiah(po.value)}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                          po.status === "Diterima Gudang"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : po.status === "Dalam Pengiriman"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aktivitas terkini */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 min-w-0">
          <SectionHeader
            icon={Activity}
            iconColor="text-brand-400"
            title="Aktivitas Terbaru Hari Ini"
            desc="Kejadian penting dari seluruh tim secara berurutan."
          />
          <ol className="relative border-l border-slate-800 ml-2 space-y-3.5">
            {ACTIVITY_FEED.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="pl-4 relative">
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <Icon className={`w-2.5 h-2.5 ${a.color}`} />
                  </span>
                  <div className="text-[10px] font-mono text-slate-500">{a.time} WIB</div>
                  <p className="text-xs text-slate-300 leading-snug">{a.text}</p>
                </li>
              );
            })}
          </ol>
          <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Semua sistem berjalan normal • 2FA admin aktif
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-600 flex items-center justify-center gap-1.5">
        <Layers className="w-3 h-3" />
        Data pada dashboard ini merupakan data sampel untuk keperluan presentasi.
      </p>
    </div>
  );
}
