"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shuffle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  Link2,
  Eye,
  Search,
} from "lucide-react";

interface RedirectRule {
  from: string;
  to: string;
  type: "301" | "302" | "307" | "308";
  note?: string;
  createdAt?: string;
}

export function RedirectManager() {
  const [rules, setRules] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Form state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"301" | "302" | "307" | "308">("301");
  const [note, setNote] = useState("");

  // Test tool
  const [testPath, setTestPath] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/seo/redirects");
      const json = await res.json();
      if (json?.success) setRules(json.data || []);
      else setMessage({ ok: false, text: json?.error || "Gagal memuat redirect." });
    } catch {
      setMessage({ ok: false, text: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, type, note }),
      });
      const json = await res.json();
      if (json?.success) {
        setRules(json.data.rules);
        setFrom("");
        setTo("");
        setNote("");
        setType("301");
        setMessage({ ok: true, text: json.message });
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal membuat redirect." });
      }
    } catch {
      setMessage({ ok: false, text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleFrom: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/seo/redirects?from=${encodeURIComponent(ruleFrom)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json?.success) {
        setRules(json.data.rules);
        setMessage({ ok: true, text: json.message });
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menghapus." });
      }
    } catch {
      setMessage({ ok: false, text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPath.trim()) return;
    setTestResult(null);
    try {
      const res = await fetch(
        `/api/seo/redirects?match=${encodeURIComponent(testPath.trim())}`
      );
      const json = await res.json();
      setTestResult(json.data);
    } catch {
      setTestResult({ matched: false, error: "Gagal menguji." });
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-brand-200">Redirect Manager (301/308)</span>
        </div>
        <p className="text-[11px] text-brand-200/80 leading-relaxed">
          Alihkan URL lama ke URL baru tanpa kehilangan peringkat SEO. Gunakan status{" "}
          <strong>301</strong> (permanen) saat URL berubah permanen, atau{" "}
          <strong>302</strong> (sementara) untuk promo musiman. Mendukung wildcard, contoh:{" "}
          <code className="font-mono">/kain/*</code> → <code className="font-mono">/catalog</code>.
        </p>
      </div>

      {/* Form Tambah */}
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
      >
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-brand-400" />
          Tambah Rule Redirect
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              URL Sumber (lama)
            </label>
            <input
              type="text"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="/kain/dryfit-lama"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pb-2 hidden sm:flex items-center justify-center text-slate-600">
            <Shuffle className="w-4 h-4" />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              URL Tujuan (baru)
            </label>
            <input
              type="text"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="/catalog/dryfit-milano-premium"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-2 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Status Code
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:outline-none focus:border-brand-500"
            >
              <option value="301">301 (Permanen)</option>
              <option value="308">308 (Permanen)</option>
              <option value="302">302 (Sementara)</option>
              <option value="307">307 (Sementara)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Catatan Internal
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mis. Migrasi katalog lama ke slug baru"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !from.trim() || !to.trim()}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 h-[34px]"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`p-3 border rounded-xl text-xs flex items-start gap-2.5 ${
            message.ok
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Daftar Rule */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-brand-400" />
            Rule Aktif ({rules.length})
          </h4>
          <button
            type="button"
            onClick={load}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            title="Muat ulang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>Memuat redirect...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <Shuffle className="w-7 h-7 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Belum ada rule redirect.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Tambahkan saat Anda mengganti struktur URL agar ranking SEO tidak hilang.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.from}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3"
              >
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold shrink-0">
                  {r.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-slate-300 truncate">
                    {r.from} <span className="text-brand-400">→</span>{" "}
                    <span className="text-emerald-400">{r.to}</span>
                  </p>
                  {r.note && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{r.note}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.from)}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0 disabled:opacity-50"
                  title="Hapus rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Tool */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-brand-400" />
          Uji Redirect
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={testPath}
            onChange={(e) => setTestPath(e.target.value)}
            placeholder="/kain/lama"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={!testPath.trim()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Uji</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-2.5 rounded-lg text-[11px] ${
              testResult.matched
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                : "bg-slate-800/60 text-slate-400 border border-slate-700"
            }`}
          >
            {testResult.matched ? (
              <>
                Redirect <strong>{testResult.status}</strong> →{" "}
                <code className="font-mono">{testResult.target}</code>
              </>
            ) : (
              "Tidak ada rule yang cocok — URL ini akan dilayani normal."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
