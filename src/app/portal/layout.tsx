"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { isRouteAllowed } from "@/lib/auth/rbac";
import { getMenuIcon } from "@/components/portal/menu-icons";
import {
  DEFAULT_ROLE_MENU,
  PORTAL_MENU_GROUPS,
  PortalMenuGroup,
  PortalUserRole,
  ROLE_DEFINITIONS,
} from "@/config/portal-menu";
import { CMS_TABS } from "@/config/cms-tabs";

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

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [menuGroups, setMenuGroups] = useState<PortalMenuGroup[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j?.authenticated && j.user) {
          setCurrentUser(j.user);
        }
      })
      .catch(() => {});
  }, []);

  // Muat menu portal sesuai hak akses role (Role & Menu Management)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/rbac/menu?scope=me");
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data?.groups)) {
          setMenuGroups(json.data.groups);
        }
      } catch {
        // Fallback ke default saat API tidak tersedia
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  /**
   * Fallback ketika API menu gagal: pakai default role + aturan ROUTE_PERMISSIONS.
   */
  const buildFallbackGroups = (role?: string): PortalMenuGroup[] => {
    if (!role) return [];
    const allowed = new Set(DEFAULT_ROLE_MENU[role as PortalUserRole] ?? []);
    return PORTAL_MENU_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          allowed.has(item.id) && isRouteAllowed(item.href, role)
      ),
    })).filter((group) => group.items.length > 0);
  };

  const visibleGroups =
    menuGroups.length > 0 ? menuGroups : buildFallbackGroups(currentUser?.role);

  const roleMeta = ROLE_DEFINITIONS.find((r) => r.role === currentUser?.role);
  const roleShort =
    roleMeta?.shortLabel ??
    (currentUser?.role
      ? currentUser.role.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase()
      : "STF");

  const renderNavGroups = (onNavigate?: () => void) => (
    <div className="p-4 space-y-6">
      {visibleGroups.map((group, idx) => (
        <div key={group.id} className="space-y-1">
          <div className="px-3 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <span className="text-slate-500">{group.title}</span>
          </div>
          {group.items.map((item) => {
            const Icon = getMenuIcon(item.icon);
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                />
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
                  src="/icons/xoramateria-mark.png"
                  alt="XoraMateria Suite"
                  className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm lg:text-base font-bold text-white font-display truncate">XORAMATERIA SUITE</div>
                <div className="text-[10px] text-brand-400 font-bold tracking-wider uppercase truncate">
                  CRM & OMS Enterprise
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {renderNavGroups()}
        </div>

          {/* Submenu CMS (hanya di halaman Content Management) */}
          {pathname?.startsWith("/portal/content-management") && (
            <div className="p-4 border-t border-slate-800 space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Submenu CMS
              </div>
              {CMS_TABS.map((t) => (
                <Link
                  key={t.key}
                  href={`/portal/content-management?tab=${t.key}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <span className="truncate">{t.label}</span>
                </Link>
              ))}
            </div>
          )}

        {/* Bottom User Role Card & Exit */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between min-w-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                {roleShort}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser?.name || "User XoraMateria"}</div>
                <div className="text-[10px] text-emerald-400 font-mono truncate">Role: {currentUser?.role || "STAFF"}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar Sesi (Logout)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors min-h-[38px]"
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
                  <img src="/icons/xoramateria-mark.png" alt="XoraMateria Suite" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white font-display truncate">XORAMATERIA SUITE</div>
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
            <div className="p-4 border-t border-slate-800 space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {roleShort}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{currentUser?.name || "User XoraMateria"}</div>
                    <div className="text-[10px] text-emerald-400 font-mono truncate">Role: {currentUser?.role || "STAFF"}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar Sesi (Logout)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold min-h-[38px]"
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
              XoraMateria &gt; Enterprise Management System
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
