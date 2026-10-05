"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeDropdown } from "../theme/ThemeDropdown";
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

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Katalog Kain", href: "/catalog", icon: Layers },
  { 
    name: "Kustom Sublimasi", 
    href: "/custom-sublimation", 
    badge: "Visualizer",
    icon: Palette,
    special: true
  },
  { name: "Lacak Pesanan", href: "/track-order" },
  { name: "Konsultasi B2B", href: "/contact" },
];

export function Navbar({ cartCount = 2 }: NavbarProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("Pembeli (Storefront)");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] xl:h-[4.5rem]">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center shadow-md shadow-black/40 group-hover:border-brand-400 transition-all duration-300">
              <img
                src="/icons/texora-logo.png"
                alt="PT. Texora Visi Prima"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(15,23,42,0.45)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base lg:text-lg font-bold tracking-tight text-white font-display">
                  TEXORA
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 tracking-wider uppercase">
                  VISI PRIMA
                </span>
              </div>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-medium">
                Industrial Textile & Sublimation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Capsule */}
          <nav 
            className="hidden lg:flex items-center space-x-1 p-1 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md relative shadow-lg shadow-black/20"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {NAV_LINKS.map((item, index) => {
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname?.startsWith(item.href);
              const isHovered = hoveredIndex === index;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative px-4 py-2 rounded-full text-xs xl:text-sm font-medium transition-colors duration-200 flex items-center gap-2 select-none ${
                    item.special
                      ? isActive
                        ? "text-accent-cyan font-bold"
                        : "text-accent-cyan hover:text-white"
                      : isActive 
                        ? "text-white font-semibold" 
                        : "text-slate-300 hover:text-white"
                  }`}
                >
                  {/* Floating Hover Indicator Pill */}
                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}

                  {/* Active Page Gliding Pill & Bottom Gold Beacon */}
                  {isActive && (
                    <>
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.04] border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                      <motion.span
                        layoutId="nav-active-glow"
                        className="absolute -bottom-[2px] left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_8px_rgb(var(--brand-300)/0.9)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    </>
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {Icon && (
                      <Icon 
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          item.special
                            ? "text-accent-cyan animate-pulse"
                            : isActive 
                              ? "text-brand-300 scale-105" 
                              : "text-slate-400"
                        }`} 
                      />
                    )}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/40"
                          : "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Control Toolbar */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Utility Capsule: Role Switcher Demo + Theme Picker */}
            <div className="flex items-center p-1 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
              
              {/* Role Switcher Demo Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-colors"
                  title="Switch mode to preview CRM, OMS, or Storefront"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-400 hidden xl:inline">Mode:</span>
                  <span className="text-white font-semibold">{activeRole.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {roleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-2xl"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-4 w-px bg-white/10 my-auto mx-0.5" />

              {/* Accent Theme Picker */}
              <ThemeDropdown />
            </div>

            {/* Shopping Cart Button Capsule */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-200 hover:text-white transition-all group shadow-lg shadow-black/20"
            >
              <ShoppingCart className="w-4 h-4 text-slate-300 group-hover:text-accent-cyan transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[1.35rem] h-[1.35rem] px-1 bg-gradient-to-r from-amber-500 to-brand-500 text-slate-950 text-[11px] font-extrabold rounded-full flex items-center justify-center leading-none shadow-md border border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Direct Executive Portal Button */}
            <Link
              href="/portal/dashboard"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Portal CRM & OMS</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeDropdown compact />
            <Link
              href="/cart"
              className="relative p-2 rounded-lg bg-slate-800 text-slate-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-[1.25rem] px-1 bg-gradient-to-r from-amber-500 to-brand-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none shadow-md border border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown with Smooth Staggered Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-slate-900/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl"
          >
            {NAV_LINKS.map((item, idx) => {
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.035, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "bg-brand-500/20 text-white font-bold border border-brand-500/30"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {Icon && <Icon className={`w-5 h-5 ${isActive ? "text-brand-300" : "text-slate-400"}`} />}
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/portal/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-600/30"
              >
                Buka Internal Portal (CRM & OMS)
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
