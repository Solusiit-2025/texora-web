"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Package, 
  FileText, 
  Settings, 
  Barcode, 
  ChevronRight, 
  ArrowLeft, 
  ShieldAlert, 
  TrendingUp,
  CheckCircle2,
  Scissors,
  FileCheck,
  Sliders,
  DollarSign,
  ClipboardList
} from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
        { name: "Pipeline Leads & Deals", href: "/portal/crm/leads", icon: TrendingUp },
        { name: "Database Pelanggan 360°", href: "/portal/crm/customers", icon: Users },
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-slate-800">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all">
                <img
                  src="/icons/texora-logo.png"
                  alt="Texora Suite"
                  className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
                />
              </div>
              <div>
                <div className="text-base font-bold text-white font-display">TEXORA SUITE</div>
                <div className="text-[10px] text-brand-400 font-bold tracking-wider uppercase">
                  CRM & OMS Enterprise
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6">
            {navigation.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

        {/* Bottom User Role Card & Exit */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                ADM
              </div>
              <div>
                <div className="text-xs font-bold text-white">Dian Sastrawan</div>
                <div className="text-[10px] text-emerald-400 font-mono">Role: ADMINISTRATOR</div>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Halaman Publik (Toko)</span>
          </Link>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar for mobile / header breadcrumb */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden text-brand-400 text-xs font-bold flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Toko
            </Link>
            <div className="text-xs text-slate-400 hidden sm:block">
              PT. Texora Visi Prima &gt; Enterprise Management System
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] px-2.5 py-1 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono font-semibold">
              Server: VPS Linux • Nginx • PostgreSQL Active
            </span>
          </div>
        </header>

        {/* Portal Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
