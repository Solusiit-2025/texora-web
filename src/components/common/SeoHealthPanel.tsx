"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
  Info,
} from "lucide-react";

interface SeoCheck {
  id: string;
  label: string;
  category: "metadata" | "schema" | "ai" | "technical" | "content";
  status: "ok" | "warning" | "error";
  detail: string;
  fix?: string;
}

interface AuditResult {
  score: number;
  grade: string;
  total: number;
  ok: number;
  warning: number;
  error: number;
  checks: SeoCheck[];
  generatedAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  metadata: "Metadata",
  schema: "Structured Data",
  ai: "AI Readiness",
  technical: "Technical SEO",
  content: "Konten",
};

const CATEGORY_ORDER = ["metadata", "schema", "ai", "content", "technical"];

export function SeoHealthPanel() {
  const [data, setData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seo/audit");
      const json = await res.json();
      if (json?.success && json.data) {
        setData(json.data);
      } else {
        setError(json?.error || "Gagal memuat audit SEO.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        <span>Menjalankan audit SEO &amp; AI readiness...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const scoreColor =
    data.score >= 90
      ? "text-emerald-400"
      : data.score >= 75
      ? "text-brand-400"
      : data.score >= 60
      ? "text-amber-400"
      : "text-rose-400";

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: data.checks.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {/* Skor */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/60 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-800"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.score / 100) * 97.4} 97.4`}
                  className={scoreColor}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-black ${scoreColor}`}>{data.score}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Skor</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                SEO &amp; AI Health Check
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md">
                Nilai <strong className={scoreColor}>{data.score}/100</strong> (Grade{" "}
                {data.grade}). Menilai metadata, structured data, AI-readiness, technical SEO,
                dan kualitas konten website.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {data.ok} optimal
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {data.warning} perlu perhatian
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <XCircle className="w-3.5 h-3.5" />
                  {data.error} error
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors shrink-0 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Audit Ulang</span>
          </button>
        </div>
      </div>

      {/* Detail per kategori */}
      <div className="space-y-4">
        {grouped.map(({ cat, items }) => (
          <div
            key={cat}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                {cat === "ai" ? (
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                ) : cat === "schema" ? (
                  <Wrench className="w-3.5 h-3.5 text-brand-400" />
                ) : cat === "technical" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-brand-400" />
                )}
                {CATEGORY_LABEL[cat]}
              </h5>
              <span className="text-[10px] text-slate-500">{items.length} pemeriksaan</span>
            </div>

            <ul className="divide-y divide-slate-800/70">
              {items.map((c) => (
                <li key={c.id} className="px-4 py-2.5 flex items-start gap-3">
                  {c.status === "ok" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : c.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-200">{c.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {c.detail}
                    </p>
                    {c.fix && (
                      <p className="text-[10px] text-brand-400/90 mt-1 flex items-start gap-1.5">
                        <Wrench className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{c.fix}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-500">
        Terakhir diperiksa:{" "}
        {data.generatedAt
          ? new Date(data.generatedAt).toLocaleString("id-ID")
          : "-"}
      </p>
    </div>
  );
}
