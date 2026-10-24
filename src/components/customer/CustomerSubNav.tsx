"use client";
import { cachedClientFetch } from "@/lib/client-api";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Palette, 
  Layers, 
  ShoppingCart, 
  FileText, 
  PhoneCall, 
  ShieldCheck, 
  ExternalLink,
  PlusCircle,
  Sparkles
} from "lucide-react";
import { loadCart } from "@/lib/cart";

export function CustomerSubNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    companyName?: string;
  } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    cachedClientFetch("/api/auth/me")
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    const syncCart = () => {
      const items = loadCart();
      setCartCount(items.length);
    };
    syncCart();
    window.addEventListener("texora-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("texora-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const NAV_ITEMS = [
    {
      label: "Dashboard & SPK",
      href: "/customer/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Lacak Produksi Real-Time",
      href: "/track-order",
      icon: PackageSearch,
      badge: "Rotary Live",
    },
    {
      label: "Studio Kustom Sublimasi",
      href: "/custom-sublimation",
      icon: Palette,
      badge: "Kalkulator 3D",
    },
    {
      label: "Katalog Kain Roll",
      href: "/catalog",
      icon: Layers,
      badge: "18+ Kain",
    },
    {
      label: "Keranjang Belanja",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartCount > 0 ? `${cartCount} Item` : null,
      highlightBadge: cartCount > 0,
    },
    {
      label: "Bantuan Sales PIC",
      href: "/contact",
      icon: PhoneCall,
      badge: null,
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-16 lg:top-[4.25rem] xl:top-[4.5rem] z-40 shadow-lg">
      <div className="texora-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2.5">
          
          {/* Status Kemitraan Pelanggan */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-brand-500/15 border border-brand-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white tracking-wide">
                PORTAL MITRA B2B
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/30 text-brand-300 font-bold">
                PRO-TIER
              </span>
            </div>

            {currentUser && (
              <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-500">â€¢</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
                {currentUser.companyName && (
                  <span className="text-slate-400 font-mono text-[11px]">({currentUser.companyName})</span>
                )}
              </div>
            )}
          </div>

          {/* Navigasi Utama Pelanggan (Tidak Tersembunyi) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none shrink-0 ${
                    isActive
                      ? "bg-brand-500 text-slate-950 shadow-md font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isActive
                          ? "bg-slate-950 text-brand-300"
                          : item.highlightBadge
                          ? "bg-amber-500 text-slate-950 animate-pulse font-extrabold"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick CTA Action */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/custom-sublimation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-cyan via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-black shadow-md transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Order Sublim Baru</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
