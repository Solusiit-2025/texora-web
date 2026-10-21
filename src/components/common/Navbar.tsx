"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeDropdown } from "../theme/ThemeDropdown";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import { cachedClientFetch } from "@/lib/client-api";
import { loadCart } from "@/lib/cart";
import { 
  Home,
  Building2,
  Layers, 
  Palette, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown,
  Lock,
  LogOut,
  Sparkles,
  Package,
  FileText,
  BookOpen
} from "lucide-react";

interface NavbarProps {
  cartCount?: number;
  /** Daftar path yang dinonaktifkan — di-resolve dari DB oleh layout server
   *  supaya link navigasi benar sejak HTML pertama (tanpa flash, SSR-friendly). */
  initialDisabledPaths?: string[];
}

const NAV_LINKS = [
  { key: "nav.home", href: "/", icon: Home },
  { key: "nav.catalog", href: "/catalog", icon: Layers },
  { key: "nav.artikel", href: "/artikel", icon: BookOpen },
  { key: "nav.about", href: "/about", icon: Building2 },
  {
    key: "nav.custom",
    href: "/custom-sublimation",
    badgeKey: "nav.badge",
    icon: Palette,
    special: true,
  },
  { key: "nav.track", href: "/track-order" },
  { key: "nav.consult", href: "/contact" },
];

export function Navbar({ cartCount: initialCartCount, initialDisabledPaths = [] }: NavbarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const localePath = useLocalePath();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic real-time cart count & user session state
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    companyName?: string;
    dash?: string;
  } | null>(null);
  // Seed awal dari server (SSR) -> tidak ada flash menu nonaktif & link tetap terbaca crawler.
  const [disabledPaths, setDisabledPaths] = useState<string[]>(initialDisabledPaths);

  // Click anywhere outside to close user dropdown profile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    // 1. Muat data keranjang riil dari storage
    const syncCart = () => {
      const items = loadCart();
      setCartItemCount(items.length);
    };

    syncCart();
    window.addEventListener("texora-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);

    // 2. Ambil sesi autentikasi pengguna
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));

    return () => {
      window.removeEventListener("texora-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  // Sinkronkan ulang status disable saat berada di halaman (mis. setelah admin
  // toggle modul, navigasi client-side ikut ter-update tanpa reload).
  useEffect(() => {
    // Dedupe: SeoHead & PageGate juga memanggil /api/seo -> 1 request saja
    cachedClientFetch<{ data?: { pages?: Record<string, any> } }>("/api/seo")
      .then((json) => {
        const pages = json?.data?.pages || {};
        const disabled = Object.keys(pages).filter((p) => pages[p]?.enabled === false);
        setDisabledPaths(disabled);
      })
      .catch(() => {});
  }, [pathname]);

  const dashboardHref =
    currentUser?.dash ||
    (currentUser?.role === "CUSTOMER" ? "/customer/dashboard" : "/portal/dashboard");

  const visibleNavLinks = NAV_LINKS.filter(
    (item) => !disabledPaths.includes(item.href)
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setCurrentUser(null);
      setUserMenuOpen(false);
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="texora-container">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] xl:h-[4.5rem]">
          
          {/* Brand Logo */}
          <Link href={localePath("/")} className="flex items-center space-x-3 group shrink-0">
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
            {visibleNavLinks.map((item, index) => {
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname?.startsWith(item.href);
              const isHovered = hoveredIndex === index;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={localePath(item.href)}
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

                  {/* Active Page Gliding Pill & Bottom Glow Beacon */}
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
                    <span>{t(item.key)}</span>
                    {item.badgeKey && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/40"
                          : "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25"
                      }`}>
                        {t(item.badgeKey)}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Control Toolbar */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Picker */}
            <div className="flex items-center p-1 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
              <ThemeDropdown />
            </div>

            {/* Direct Dashboard Shortcut Button (Solusi: Menu Tidak Tersembunyi Lagi) */}
            {currentUser && (
              <Link
                href={dashboardHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-accent-cyan/20 hover:from-brand-500/30 hover:to-accent-cyan/30 border border-brand-400/40 text-brand-200 hover:text-white text-xs font-bold transition-all shadow-sm shadow-brand-500/10 group shrink-0"
                title="Buka Dashboard Utama Mitra B2B"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
                <span>{currentUser.role === "CUSTOMER" ? t("nav.dashMitra") : t("nav.dashPabrik")}</span>
              </Link>
            )}

            {/* Shopping Cart Button Capsule with Dynamic Badge Notification (Hanya tampil jika user login) */}
            {currentUser && (
              <Link
                href="/cart"
                aria-label="Keranjang Belanja"
                title={cartItemCount > 0 ? `Keranjang: ${cartItemCount} item pesanan` : "Keranjang Belanja"}
                className="relative p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-200 hover:text-white transition-all group shadow-lg shadow-black/20"
              >
                <ShoppingCart className="w-4 h-4 text-slate-300 group-hover:text-accent-cyan transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.35rem] h-[1.35rem] px-1 bg-gradient-to-r from-amber-500 to-brand-500 text-slate-950 text-[11px] font-black rounded-full flex items-center justify-center leading-none shadow-md border border-slate-950 animate-in zoom-in-75 duration-200">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* CTA Utama: Minta Penawaran */}
            <Link
              href={localePath("/request-quote")}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-400/50 bg-brand-500/10 hover:bg-brand-500/25 hover:border-brand-300 text-brand-200 hover:text-white text-xs font-bold transition-all shadow-sm shadow-brand-500/10 shrink-0"
              title={t("nav.requestQuote")}
            >
              <FileText className="w-3.5 h-3.5 text-brand-300" />
              <span>{t("nav.requestQuote")}</span>
            </Link>

            {/* Authentication & Portal Controls */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-brand-500/30 text-white text-xs font-medium transition-all shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="max-w-[110px] truncate font-semibold">{currentUser.name.split(" ")[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 uppercase font-mono">
                    {currentUser.role === "CUSTOMER" ? "Mitra" : currentUser.role === "ADMINISTRATOR" ? "Admin" : "Staff"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[998] cursor-default bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setUserMenuOpen(false)}
                        aria-hidden="true"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.16 }}
                        style={{ backgroundColor: "#0f172a" }}
                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-2 z-[999] divide-y divide-slate-800/90 isolate"
                      >
                        {/* Header Profil */}
                        <div className="px-3 py-2.5 bg-slate-900 rounded-xl">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Online
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                          {currentUser.companyName && (
                            <p className="text-[10px] text-brand-400 font-mono mt-0.5 truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span>{currentUser.companyName}</span>
                            </p>
                          )}
                        </div>

                        {/* Menu Portal Utama */}
                        <div className="py-1.5 space-y-0.5">
                          <p className="px-3 pt-1 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {t("nav.portalSection")}
                          </p>
                          <Link
                            href={dashboardHref}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-300 group-hover:bg-brand-500 group-hover:text-slate-950 transition-colors">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold">{currentUser.role === "CUSTOMER" ? t("nav.dashMitra") : t("nav.dashPabrik")}</div>
                              <div className="text-[10px] text-slate-400">{t("nav.dashDesc")}</div>
                            </div>
                          </Link>

                          <Link
                            href="/track-order"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold">{t("nav.trackRt")}</div>
                              <div className="text-[10px] text-slate-400">{t("nav.trackRtDesc")}</div>
                            </div>
                          </Link>

                          <Link
                            href="/cart"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-semibold">{t("nav.cart")}</div>
                                <div className="text-[10px] text-slate-400">{t("nav.cartDesc")}</div>
                              </div>
                            </div>
                            {cartItemCount > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shadow-sm">
                                {cartItemCount}
                              </span>
                            )}
                          </Link>
                        </div>

                        {/* Layanan & Produksi */}
                        <div className="py-1.5 space-y-0.5">
                          <p className="px-3 pt-1 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {t("nav.services")}
                          </p>
                          <Link
                            href={localePath("/custom-sublimation")}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                          >
                            <Palette className="w-3.5 h-3.5 text-accent-cyan" />
                            <span>{t("nav.studio")}</span>
                          </Link>

                          <Link
                            href={localePath("/catalog")}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5 text-brand-300" />
                            <span>{t("nav.katalogSub")}</span>
                          </Link>

                          <Link
                            href={localePath("/contact")}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t("nav.consultSub")}</span>
                          </Link>
                        </div>

                        {/* Manajemen (khusus Administrator) */}
                        {currentUser.role === "ADMINISTRATOR" && (
                          <div className="py-1.5 space-y-0.5">
                            <p className="px-3 pt-1 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {t("nav.cms")}
                            </p>
                            <Link
                              href="/portal/content-management"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5 text-brand-300" />
                              <span>Content Management</span>
                            </Link>
                            <Link
                              href="/portal/catalog-management"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <Package className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Katalog Kain</span>
                            </Link>
                            <Link
                              href="/portal/settings/users-rbac"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                              <span>User & Role (RBAC)</span>
                            </Link>
                          </div>
                        )}

                        {/* Logout */}
                        <div className="pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t("nav.logout")}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={localePath("/login")}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Lock className="w-3.5 h-3.5 text-slate-950" />
                <span>Login</span>
              </Link>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSwitcher />
            <ThemeDropdown compact />
            {currentUser && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg bg-slate-800 text-slate-200"
                aria-label="Keranjang"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-[1.25rem] px-1 bg-gradient-to-r from-amber-500 to-brand-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none shadow-md border border-slate-950">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
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
            {visibleNavLinks.map((item, idx) => {
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
                    href={localePath(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "bg-brand-500/20 text-white font-bold border border-brand-500/30"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {Icon && <Icon className={`w-5 h-5 ${isActive ? "text-brand-300" : "text-slate-400"}`} />}
                      <span>{t(item.key)}</span>
                    </div>
                    {item.badgeKey && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                        {t(item.badgeKey)}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href={localePath("/request-quote")}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-brand-400/40 bg-brand-500/10 text-brand-200 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t("nav.requestQuote")}</span>
              </Link>
              {currentUser ? (
                <>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30"
                  >
                    {currentUser.role === "CUSTOMER" ? t("nav.dashMitra") : t("nav.dashPabrik")}
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-accent-cyan" />
                      <span>Keranjang Belanja</span>
                    </span>
                    {cartItemCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {cartItemCount} item
                      </span>
                    )}
                  </Link>
                   {currentUser.role === "ADMINISTRATOR" && (
                     <>
                       <Link
                         href="/portal/content-management"
                         onClick={() => setMobileMenuOpen(false)}
                         className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                       >
                         Content Management
                       </Link>
                       <Link
                         href="/portal/catalog-management"
                         onClick={() => setMobileMenuOpen(false)}
                         className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                       >
                         Katalog Kain
                       </Link>
                     </>
                   )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs border border-red-500/30"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link
                  href={localePath("/login")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 hover:from-brand-400 hover:to-brand-300 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
