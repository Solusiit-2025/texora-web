"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeDropdown } from "../theme/ThemeDropdown";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import { cachedClientFetch } from "@/lib/client-api";
import { 
  Home,
  Building2,
  Layers, 
  Palette, 
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

export function Navbar({ initialDisabledPaths = [] }: NavbarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const localePath = useLocalePath();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic user session state
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

  /**
   * Apakah user ini boleh mengelola Website & CMS?
   * Administrator bawaan ATAU role custom yang diberi menu `content`
   * (mis. role "ADMIN" — Admin Web CMS).
   */
  const [canManageCms, setCanManageCms] = useState(false);

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
    // Ambil sesi autentikasi pengguna
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          const menuIds = Array.isArray(data.menuIds) ? data.menuIds : [];
          setCanManageCms(
            data.user.role === "ADMINISTRATOR" || menuIds.includes("content")
          );
        } else {
          setCurrentUser(null);
          setCanManageCms(false);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setCanManageCms(false);
      });
  }, []);

  // Sinkronkan ulang status disable saat berada di halaman (mis. setelah admin
  // toggle modul, navigasi client-side ikut ter-update tanpa reload).
  useEffect(() => {
    // Dedupe: SeoHead & PageGate juga memanggil /api/seo -> 1 request saja.
    // TTL pendek (5s) supaya perubahan visibilitas modul dari CMS cepat terlihat
    // setelah admin kembali ke storefront (cache penuh dibersihkan lewat
    // invalidateClientFetch("/api/seo") saat menyimpan).
    cachedClientFetch<{ data?: { pages?: Record<string, any> } }>("/api/seo", 5_000)
      .then((json) => {
        const pages = json?.data?.pages || {};
        const disabled = Object.keys(pages).filter((p) => pages[p]?.enabled === false);
        setDisabledPaths(disabled);
      })
      .catch(() => {});
  }, [pathname]);

  const dashboardHref =
    currentUser?.role === "CUSTOMER"
      ? "/customer/dashboard"
      : canManageCms
        ? "/portal/content-management"
        : currentUser?.dash || "/portal/dashboard";

  /** Label badge peran di tombol profil. */
  const roleBadge =
    currentUser?.role === "CUSTOMER"
      ? "Mitra"
      : canManageCms
        ? "Admin CMS"
        : "Staff";

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
          <Link href={localePath("/")} className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 shrink">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1 border border-brand-400/60 flex items-center justify-center shadow-md shadow-black/40 group-hover:border-brand-400 transition-all duration-300 shrink-0">
              <img
                src="/icons/xoramateria-mark.png"
                alt="XoraMateria"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(15,23,42,0.45)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white font-display truncate">
                  XORAMATERIA
                </span>
                <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 tracking-wider uppercase whitespace-nowrap">
                  FABRIC · PRINT
                </span>
              </div>
              <p className="hidden sm:block text-[9px] text-slate-400 tracking-wider uppercase font-medium truncate">
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
                    {roleBadge}
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

                        {/* Website & CMS (staff) / Portal Mitra (customer) */}
                        <div className="py-1.5 space-y-0.5">
                          <p className="px-3 pt-1 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {canManageCms ? "Website & CMS" : t("nav.portalSection")}
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
                              <div className="font-semibold">
                                {canManageCms
                                  ? "Dashboard CMS"
                                  : currentUser.role === "CUSTOMER"
                                    ? t("nav.dashMitra")
                                    : "Dashboard"}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {canManageCms
                                  ? "Kelola konten & katalog website"
                                  : t("nav.dashDesc")}
                              </div>
                            </div>
                          </Link>

                          {canManageCms ? (
                            <>
                              <Link
                                href="/portal/content-management"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-brand-300" />
                                <span>Content Management</span>
                              </Link>
                              <Link
                                href="/portal/content-management?tab=artikel"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Artikel &amp; Panduan</span>
                              </Link>
                              <Link
                                href="/portal/content-management?tab=seo"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                                <span>SEO &amp; AI</span>
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
                                href="/"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                              >
                                <Home className="w-3.5 h-3.5 text-slate-400" />
                                <span>Lihat Website</span>
                              </Link>
                              {currentUser.role === "ADMINISTRATOR" && (
                                <Link
                                  href="/portal/settings/users-rbac"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                                  <span>User &amp; Role (RBAC)</span>
                                </Link>
                              )}
                            </>
                          ) : currentUser.role === "CUSTOMER" ? (
                            <>
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
                            </>
                          ) : null}
                        </div>

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
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <LanguageSwitcher compact />
            <ThemeDropdown compact />
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
                    {canManageCms
                      ? "Dashboard CMS"
                      : currentUser.role === "CUSTOMER"
                        ? t("nav.dashMitra")
                        : "Dashboard"}
                  </Link>

                  {canManageCms ? (
                    <>
                      <Link
                        href="/portal/content-management"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        Content Management
                      </Link>
                      <Link
                        href="/portal/content-management?tab=artikel"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        Artikel &amp; Panduan
                      </Link>
                      <Link
                        href="/portal/content-management?tab=seo"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        SEO &amp; AI
                      </Link>
                      <Link
                        href="/portal/catalog-management"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        Katalog Kain
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        Lihat Website
                      </Link>
                    </>
                  ) : null}
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
