"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  LogIn,
  UserX,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  MonitorSmartphone,
} from "lucide-react";
import { auditCategoryOf } from "@/lib/audit-categories";

interface AuditUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuditRow {
  id: string;
  action: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: AuditUser | null;
}

interface Stats {
  loginSuccess: number;
  loginFailed: number;
  contentChanges: number;
  securityEvents: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const CATEGORY_TABS = [
  { key: "all", label: "Semua" },
  { key: "security", label: "Keamanan" },
  { key: "access", label: "Akses & Role" },
  { key: "content", label: "Konten & Katalog" },
  { key: "system", label: "Sistem" },
  { key: "sales", label: "Penjualan" },
];

const CATEGORY_BADGE: Record<string, string> = {
  security: "bg-red-500/15 text-red-300 border-red-500/30",
  access: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  content: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  system: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  sales: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  other: "bg-slate-700/40 text-slate-300 border-slate-600/40",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
}

/** Ringkas user agent jadi "Chrome · Windows" agar kolom tidak melebar. */
function shortDevice(userAgent: string | null) {
  if (!userAgent) return "-";
  const browser =
    /Edg\//i.test(userAgent) ? "Edge"
    : /OPR\/|Opera/i.test(userAgent) ? "Opera"
    : /Chrome\//i.test(userAgent) ? "Chrome"
    : /Firefox\//i.test(userAgent) ? "Firefox"
    : /Safari\//i.test(userAgent) ? "Safari"
    : /curl\//i.test(userAgent) ? "curl"
    : "Browser";
  const os =
    /Windows/i.test(userAgent) ? "Windows"
    : /Android/i.test(userAgent) ? "Android"
    : /iPhone|iPad|iOS/i.test(userAgent) ? "iOS"
    : /Mac OS X/i.test(userAgent) ? "macOS"
    : /Linux/i.test(userAgent) ? "Linux"
    : "OS";
  return `${browser} · ${os}`;
}

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
  });
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Debounce pencarian supaya tidak memanggil API tiap ketukan.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pagination.pageSize),
        });
        if (category !== "all") params.set("category", category);
        if (query) params.set("q", query);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const res = await fetch(`/api/audit-logs?${params.toString()}`, {
          cache: "no-store",
        });

        if (res.status === 403) {
          setForbidden(true);
          setRows([]);
          return;
        }
        if (res.status === 401) {
          window.location.href = "/login?redirect=%2Fportal%2Faudit-logs";
          return;
        }

        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || `Gagal memuat log (HTTP ${res.status}).`);
        }

        setForbidden(false);
        setRows(json.data || []);
        setStats(json.stats || null);
        setPagination(json.pagination);
        setLastUpdated(new Date());
      } catch (err: any) {
        setError(err?.message || "Gagal memuat log audit.");
      } finally {
        setLoading(false);
      }
    },
    [category, query, from, to, pagination.pageSize]
  );

  // Reset ke halaman 1 saat filter berubah.
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, from, to]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page }));
    load(page);
  };

  const statCards = [
    {
      label: "Login sukses (7 hari)",
      value: stats?.loginSuccess ?? 0,
      icon: LogIn,
      tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      label: "Login gagal (7 hari)",
      value: stats?.loginFailed ?? 0,
      icon: UserX,
      tone: "text-rose-300 bg-rose-500/10 border-rose-500/30",
    },
    {
      label: "Perubahan konten (7 hari)",
      value: stats?.contentChanges ?? 0,
      icon: FileEdit,
      tone: "text-brand-300 bg-brand-500/10 border-brand-500/30",
    },
    {
      label: "Insiden keamanan (7 hari)",
      value: stats?.securityEvents ?? 0,
      icon: ShieldAlert,
      tone: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const startRow = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endRow = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
              Audit Trail & Keamanan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Log Audit & Jejak Aktivitas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Siapa login, kapan, dari IP/perangkat apa, dan perubahan apa yang dilakukan.
            Hanya dapat diakses Administrator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-brand-500/50 text-slate-200 hover:text-white text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Muat ulang
        </button>
      </div>

      {forbidden ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-2">
          <Lock className="w-7 h-7 text-red-300 mx-auto" />
          <p className="text-sm font-bold text-white">Akses ditolak</p>
          <p className="text-xs text-red-200/80">
            Halaman ini hanya untuk role Administrator. Hubungi super admin bila Anda
            membutuhkan akses.
          </p>
        </div>
      ) : (
        <>
          {/* Statistik 7 hari */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border p-3.5 ${card.tone}`}
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  <card.icon className="w-3.5 h-3.5" />
                  {card.label}
                </div>
                <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === tab.key
                      ? "bg-brand-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama/email pengguna, jenis aksi, atau detail aktivitas..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400">Dari</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <label className="text-[11px] text-slate-400">s/d</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                {(from || to || query || category !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                      setSearchInput("");
                      setCategory("all");
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Tabel */}
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 whitespace-nowrap">Waktu & IP</th>
                    <th className="py-3.5 px-4">Pengguna</th>
                    <th className="py-3.5 px-4">Aksi</th>
                    <th className="py-3.5 px-4">Detail Perubahan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Perangkat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-400" />
                        Memuat log audit...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        Belum ada log untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    rows.map((log) => {
                      const cat = auditCategoryOf(log.action);
                      return (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition-colors align-top">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-white text-[11px]">
                              {formatDate(log.createdAt)}
                            </div>
                            <div className="font-mono text-slate-500 text-[10px] mt-0.5">
                              {log.ipAddress || "-"}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs">
                              {log.user?.name || "—"}
                            </div>
                            <div className="text-[10px] text-slate-400 break-all">
                              {log.user?.email || "tidak diketahui"}
                            </div>
                            {log.user?.role && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono mt-0.5 inline-block">
                                {log.user.role}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-1 rounded-md border font-mono font-bold text-[10px] inline-block ${
                                CATEGORY_BADGE[cat] || CATEGORY_BADGE.other
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300 text-xs max-w-md">
                            {log.description}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                              <MonitorSmartphone className="w-3.5 h-3.5" />
                              {shortDevice(log.userAgent)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/50 px-4 py-3">
              <div className="text-[11px] text-slate-400">
                {pagination.total === 0
                  ? "0 log"
                  : `Menampilkan ${startRow}–${endRow} dari ${pagination.total} log`}
                {lastUpdated && (
                  <span className="text-slate-500">
                    {" "}
                    · diperbarui {lastUpdated.toLocaleTimeString("id-ID")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={loading || pagination.page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                </button>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={loading || pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
