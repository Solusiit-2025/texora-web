"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home,
  Layers, 
  Palette, 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  PhoneCall
} from "lucide-react";

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 2 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("Pembeli (Storefront)");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-brand-400 transition-all duration-300">
              <img
                src="/icons/texora-logo.png"
                alt="PT. Texora Visi Prima"
                className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  TEXORA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 tracking-wider">
                  VISI PRIMA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Industrial Textile & Sublimation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/"
                  ? "text-white bg-white/10 font-semibold border border-white/15 shadow-sm"
                  : "text-slate-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home className={`w-4 h-4 ${pathname === "/" ? "text-brand-300" : "text-slate-400"}`} />
              <span>Home</span>
            </Link>

            <Link 
              href="/catalog" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                pathname?.startsWith("/catalog")
                  ? "text-white bg-white/10 font-semibold border border-white/15 shadow-sm"
                  : "text-slate-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Katalog Kain</span>
            </Link>
            
            <Link 
              href="/custom-sublimation" 
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-accent-cyan hover:bg-accent-cyan/10 transition-all flex items-center gap-1.5 border border-accent-cyan/30"
            >
              <Palette className="w-4 h-4 text-accent-cyan animate-pulse" />
              <span>Kustom Sublimasi (Visualizer)</span>
            </Link>

            <Link 
              href="/track-order" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname?.startsWith("/track-order")
                  ? "text-white bg-white/10 font-semibold border border-white/15 shadow-sm"
                  : "text-slate-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Lacak Pesanan
            </Link>

            <Link 
              href="/contact" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname?.startsWith("/contact")
                  ? "text-white bg-white/10 font-semibold border border-white/15 shadow-sm"
                  : "text-slate-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Konsultasi B2B
            </Link>
          </nav>

          {/* Right Action Controls: Role Switcher Demo, Cart & Portal Access */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Quick Enterprise Role Switcher Demo */}
            <div className="relative">
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
                title="Switch mode to preview CRM, OMS, or Storefront"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-400">Mode:</span>
                <span className="text-white font-semibold">{activeRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                    Simulasi Akses Peran (PRD RBAC)
                  </div>
                  <Link
                    href="/"
                    onClick={() => { setActiveRole("Pembeli (Storefront)"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-brand-500/20 text-slate-200 hover:text-brand-300 transition-colors"
                  >
                    <span>🛒 Toko & Katalog (Storefront)</span>
                    <span className="text-[10px] text-slate-400">Publik</span>
                  </Link>
                  <Link
                    href="/customer/dashboard"
                    onClick={() => { setActiveRole("Portal Pelanggan B2B"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 transition-colors font-medium"
                  >
                    <span>👤 Portal Pelanggan (Proofing & Pajak)</span>
                    <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-white">B2B V2</span>
                  </Link>
                  <Link
                    href="/portal/crm/leads"
                    onClick={() => { setActiveRole("Sales Rep (CRM)"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-accent-violet/20 text-slate-200 hover:text-accent-violet transition-colors"
                  >
                    <span>💼 Sales Rep (CRM Pipeline)</span>
                    <span className="text-[10px] bg-accent-violet/30 px-1.5 py-0.5 rounded text-white">Internal</span>
                  </Link>
                  <Link
                    href="/portal/warehouse/inventory"
                    onClick={() => { setActiveRole("Gudang (Warehouse)"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-accent-amber/20 text-slate-200 hover:text-accent-amber transition-colors"
                  >
                    <span>📦 Staf Gudang (Roll Barcode)</span>
                    <span className="text-[10px] bg-accent-amber/30 px-1.5 py-0.5 rounded text-white">Internal</span>
                  </Link>
                  <Link
                    href="/portal/dashboard"
                    onClick={() => { setActiveRole("Admin (Enterprise Portal)"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-brand-500/20 text-slate-200 hover:text-brand-300 transition-colors font-semibold"
                  >
                    <span>⚡ Executive Portal & OMS</span>
                    <span className="text-[10px] bg-brand-500/40 px-1.5 py-0.5 rounded text-white">Admin</span>
                  </Link>
                  <Link
                    href="/portal/audit-logs"
                    onClick={() => { setActiveRole("Keamanan & Audit"); setRoleDropdownOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-red-500/20 text-slate-200 hover:text-red-300 transition-colors"
                  >
                    <span>🛡️ Log Audit & Jejak 2FA</span>
                    <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded text-white">Security</span>
                  </Link>
                  <div className="my-1 border-t border-slate-800" />
                  <Link
                    href="/login"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 transition-colors font-semibold"
                  >
                    <span>🔐 Halaman Masuk / Login</span>
                    <span className="text-[10px] text-brand-400">Auth</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-accent-cyan transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-accent-magenta to-brand-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Portal Direct Button */}
            <Link
              href="/portal/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet text-white text-xs font-semibold hover:from-brand-500 hover:to-accent-violet/90 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Portal CRM & OMS</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/cart"
              className="relative p-2 rounded-lg bg-slate-800 text-slate-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-magenta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
              pathname === "/"
                ? "bg-brand-500/20 text-white font-bold border border-brand-500/30"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Home className="w-5 h-5 text-brand-400" />
            <span>Home</span>
          </Link>
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${
              pathname?.startsWith("/catalog")
                ? "bg-brand-500/20 text-white font-bold border border-brand-500/30"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Katalog Kain
          </Link>
          <Link
            href="/custom-sublimation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30"
          >
            Kustom Sublimasi (Visualizer)
          </Link>
          <Link
            href="/track-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Lacak Pesanan
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Konsultasi B2B
          </Link>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/portal/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-brand-600 text-white font-semibold text-sm"
            >
              Buka Internal Portal (CRM & OMS)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
