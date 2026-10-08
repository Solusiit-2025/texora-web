"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  FileText,
  Settings,
  Barcode,
  ArrowLeft,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Scissors,
  FileCheck,
  Sliders,
  ClipboardList,
  Inbox,
  MessagesSquare,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup drawer otomatis saat pindah halaman + kunci scroll body
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigation = [
    {
      title: "Executive Overview",
      items: [
        { name: "Dashboard Analitik", href: "/portal/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "CRM & Penjualan (PRD §3.3)",
      items: [
        { name: "Social Listening & Prospek", href: "/portal/social-media", icon: MessagesSquare, highlight: true, badge: "NEW" },
        { name: "WhatsApp", href: "/portal/crm/inbox", icon: MessageCircle },
        { name: "Pipeline Leads & Deals", href: "/portal/crm/leads", icon: TrendingUp },
        { name: "Database Pelanggan 360°", href: "/portal/crm/customers", icon: Users },
        { name: "Rekap Penjualan & Sales Order", href: "/portal/sales-report", icon: BarChart3 },
      ],
    },
    {
      title: "OMS & Digital Proofing (PRD §3.2)",
      items: [
        { name: "Antrean Pesanan & SPK", href: "/portal/oms/orders", icon: ClipboardList },
        { name: "Approval Digital Proof", href: "/portal/oms/custom-orders", icon: FileCheck },
        { name: "Faktur & CoreTax PPN", href: "/portal/oms/invoices", icon: FileText },
      ],
    },
    {
      title: "Gudang & Logistik (PRD §13)",
      items: [
        { name: "Stok Roll & Barcode", href: "/portal/warehouse/inventory", icon: Barcode },
        { name: "Pemotongan & Ekspedisi", href: "/portal/warehouse/fulfillment", icon: Scissors },
      ],
    },
    {
      title: "Katalog & Pengaturan",
      items: [
        { name: "Katalog Kain & Pricing", href: "/portal/catalog-management", icon: Sliders },
        { name: "Log Audit & 2FA Admin", href: "/portal/audit-logs", icon: ShieldAlert },
        { name: "Konfigurasi Sistem & RBAC", href: "/portal/settings", icon: Settings },
      ],
    },
  ];

  const renderNavGroups = (onNavigate?: () => void) => (
    <div className="p-4 space-y-6">
      {navigation.map((group, idx) => (
        <div key={idx} className="space-y-1">
          <div className="px-3 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <span className="text-slate-500">{group.title}</span>
          </div>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHighlight = (item as any).highlight;

            if (isHighlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all overflow-hidden border ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 via-brand-600 to-brand-600 text-white border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                      : "bg-emerald-500/10 text-white border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/60"
                  }`}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-black tracking-wider shadow shrink-0">
                    {(item as any).badge ?? "NEW"}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Desktop — hidden di mobile/tablet kecil */}
      <aside className="w-60 lg:w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Portal Badge */}
          <div className="p-5 lg:p-6 border-b border-slate-800">
            <Link href="/" className="flex items-center space-x-3 group min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all shrink-0">
                <img
                  src="/icons/texora-logo.png"
                  alt="Texora Suite"
                  className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm lg:text-base font-bold text-white font-display truncate">TEXORA SUITE</div>
                <div className="text-[10px] text-brand-400 font-bold tracking-wider uppercase truncate">
                  CRM & OMS Enterprise
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {renderNavGroups()}
        </div>

        {/* Bottom User Role Card & Exit */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                ADM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Pricilia Kishin Hassanannd</div>
                <div className="text-[10px] text-emerald-400 font-mono truncate">Role: ADMINISTRATOR</div>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ke Halaman Publik (Toko)</span>
          </Link>
        </div>
      </aside>

      {/* Drawer Mobile/Tablet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu portal">
          <button
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[86vw] max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center shrink-0">
                  <img src="/icons/texora-logo.png" alt="Texora Suite" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white font-display truncate">TEXORA SUITE</div>
                  <div className="text-[10px] text-brand-400 font-bold tracking-wider uppercase">CRM & OMS</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup navigasi"
                className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderNavGroups(() => setMobileOpen(false))}</div>
            <div className="p-4 border-t border-slate-800">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ke Halaman Publik (Toko)</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar responsif */}
        <header className="sticky top-0 z-30 min-h-[3.5rem] border-b border-slate-800 bg-slate-900/80 backdrop-blur px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              className="md:hidden p-2.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="md:hidden text-brand-400 text-xs font-bold flex items-center gap-1 shrink-0 px-1 py-2">
              <ArrowLeft className="w-4 h-4" /> Toko
            </Link>
            <div className="text-xs text-slate-400 hidden md:block truncate">
              PT. Texora Visi Prima &gt; Enterprise Management System
            </div>
            <div className="text-xs text-slate-400 md:hidden truncate font-medium">
              {pathname === "/portal/dashboard" ? "Dashboard Analitik" : "Portal Enterprise"}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Badge lengkap hanya di tablet ke atas */}
            <span className="hidden sm:inline-flex text-[11px] px-2.5 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono font-semibold whitespace-nowrap">
              Server: VPS Linux • Nginx • PostgreSQL Active
            </span>
            {/* Indikator compact untuk HP */}
            <span className="sm:hidden inline-flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Server Aktif
            </span>
          </div>
        </header>

        {/* Portal Page Content */}
        <main className="flex-1 w-full mx-auto p-3 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
