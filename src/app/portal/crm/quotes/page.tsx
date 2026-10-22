"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  MapPin,
  Ruler,
  Package,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Globe,
  MessageSquare,
} from "lucide-react";

interface QuoteRequest {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  productIds: string[];
  productsText: string | null;
  meters: number | null;
  needsSample: boolean;
  message: string | null;
  fileUrl: string | null;
  fileName: string | null;
  locale: string;
  source: string;
  status: string;
  notes: string | null;
  leadId: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  NEW: {
    label: "Baru",
    cls: "bg-brand-500/15 text-brand-300 border-brand-500/30",
    icon: Clock,
  },
  CONTACTED: {
    label: "Sudah Dihubungi",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: MessageSquare,
  },
  QUOTED: {
    label: "Penawaran Terkirim",
    cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: Mail,
  },
  WON: {
    label: "Menjadi Pesanan",
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  LOST: {
    label: "Dibatalkan",
    cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: XCircle,
  },
};

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];

export default function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/quote-requests", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error || "Gagal memuat permintaan penawaran.");
        return;
      }
      setQuotes(json.data || []);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error || "Gagal mengubah status.");
        return;
      }
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: json.data.status } : q))
      );
    } catch {
      setError("Gagal mengubah status.");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotes.filter((item) => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return [item.name, item.company, item.email, item.country, item.productsText]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [quotes, statusFilter, search]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { ALL: quotes.length };
    for (const s of STATUSES) out[s] = quotes.filter((q) => q.status === s).length;
    return out;
  }, [quotes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              Permintaan Penawaran (RFQ) — Website
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Permintaan Penawaran Harga Kain
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Semua permintaan dari form “Minta Penawaran” di website. Otomatis
            masuk ke pipeline CRM sebagai Lead.
          </p>
        </div>
        <button
          onClick={fetchQuotes}
          className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Filter status */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", ...STATUSES].map((s) => {
          const meta = s !== "ALL" ? STATUS_META[s] : null;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                active
                  ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {meta ? meta.label : "Semua"} · {counts[s] ?? 0}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, perusahaan, email, negara, atau produk..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Daftar */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat permintaan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Belum ada permintaan</p>
          <p className="text-xs text-slate-400 mt-1">
            Permintaan yang dikirim lewat website akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const meta = STATUS_META[q.status] || STATUS_META.NEW;
            const Icon = meta.icon;
            const isOpen = expanded === q.id;
            return (
              <div
                key={q.id}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
              >
                {/* Baris utama */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.cls}`}
                      >
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      {q.needsSample && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/15 text-violet-300 border-violet-500/30">
                          <Package className="w-3 h-3" />
                          Sample swatch
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(q.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        <Globe className="inline w-3 h-3" /> {q.locale} · {q.source}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate">
                      {q.name}
                      {q.company && (
                        <span className="text-slate-400 font-normal">
                          {" "}— {q.company}
                        </span>
                      )}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-400">
                      <a
                        href={`mailto:${q.email}`}
                        className="inline-flex items-center gap-1 hover:text-brand-300 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-400" />
                        {q.email}
                      </a>
                      {q.phone && (
                        <a
                          href={`https://wa.me/${q.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-emerald-300 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {q.phone}
                        </a>
                      )}
                      {q.country && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {q.country}
                        </span>
                      )}
                      {q.meters ? (
                        <span className="inline-flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5 text-accent-cyan" />
                          {q.meters} m
                        </span>
                      ) : null}
                    </div>

                    {q.productsText && (
                      <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                        <Package className="w-3 h-3 inline" /> {q.productsText}
                      </p>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={q.status}
                      disabled={savingId === q.id}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpanded(isOpen ? null : q.id)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                    >
                      {isOpen ? "Tutup" : "Detail"}
                    </button>
                  </div>
                </div>

                {/* Detail */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800 space-y-3">
                    {q.message && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Detail kebutuhan
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {q.message}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {q.fileUrl && (
                        <a
                          href={q.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-200 text-[11px] font-semibold hover:bg-brand-500/20 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {q.fileName || "File referensi"}
                        </a>
                      )}
                      {q.leadId && (
                        <Link
                          href="/portal/crm/leads"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold hover:bg-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka di Pipeline Leads
                        </Link>
                      )}
                      <Link
                        href={`/api/catalog/pdf`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold hover:bg-slate-700 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Katalog PDF
                      </Link>
                    </div>

                    {q.notes && (
                      <p className="text-[11px] text-slate-500">
                        Catatan internal: {q.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-600">
        <Building2 className="w-3 h-3 inline" /> Halaman ini hanya untuk
        Administrator &amp; Sales Rep. Data pelanggan disimpan sesuai
        ketentuan privasi website XoraMateria.
      </p>
    </div>
  );
}
