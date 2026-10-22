"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Languages,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  RefreshCw,
  Sparkles,
  Wand2,
  Plus,
  X,
} from "lucide-react";

interface TranslationJob {
  running: boolean;
  phase: string;
  done: number;
  total: number;
  message: string;
  startedAt: string | null;
  finishedAt: string | null;
}

interface TranslationRow {
  id: string;
  entity: string;
  entityId: string;
  field: string;
  locale: string;
  source: string;
  translation: string;
  updatedAt: string;
}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
  de: "Deutsch",
  ar: "العربية",
};

export function TranslationManager() {
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState<{
    enabled: boolean;
    provider: string;
    model: string;
  } | null>(null);
  const [byLocale, setByLocale] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [job, setJob] = useState<TranslationJob | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Form Tambah Terjemahan Manual
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    locale: "en",
    entity: "product",
    entityId: "",
    field: "description",
    source: "",
    translation: "",
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  const load = useCallback(async (locale = "") => {
    setLoading(true);
    try {
      const q = locale ? `?locale=${encodeURIComponent(locale)}` : "";
      const res = await fetch(`/api/i18n/translations${q}`);
      const json = await res.json();
      if (json?.success) {
        setAiEnabled(!!json.aiEnabled);
        if (json.aiProvider) setAiProvider(json.aiProvider);
        setByLocale(json.data.byLocale || {});
        setTotal(json.data.total || 0);
        setRows(json.data.rows || []);
        setJob(json.data.job || null);
        setDrafts({});
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal memuat terjemahan." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll status job terjemahan background
  useEffect(() => {
    if (!job?.running) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/i18n/translations?job=1");
        const json = await res.json();
        if (json?.success && json.data?.job) {
          const wasRunning = job.running;
          setJob(json.data.job);
          if (wasRunning && !json.data.job.running) {
            setTranslating(false);
            await load(filter);
          }
        }
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [job?.running, load, filter]);

  const handleSave = async (row: TranslationRow) => {
    setSavingId(row.id);
    setMessage(null);
    try {
      const res = await fetch("/api/i18n/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: row.entity,
          entityId: row.entityId,
          field: row.field,
          locale: row.locale,
          source: row.source,
          translation: drafts[row.id] ?? row.translation,
        }),
      });
      const json = await res.json();
      if (json?.success) {
        setMessage({ ok: true, text: "Terjemahan disimpan." });
        await load(filter);
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menyimpan." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menyimpan (jaringan)." });
    } finally {
      setSavingId(null);
    }
  };

  const handleTranslateSingle = async (row: TranslationRow) => {
    setTranslatingId(row.id);
    setMessage(null);
    try {
      const res = await fetch("/api/i18n/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate-single",
          entity: row.entity,
          entityId: row.entityId,
          field: row.field,
          locale: row.locale,
          source: row.source,
        }),
      });
      const json = await res.json();
      if (json?.success && json.data) {
        setDrafts((d) => ({ ...d, [row.id]: json.data.translation }));
        setMessage({ ok: true, text: `Berhasil diterjemahkan ke ${LOCALE_NAMES[row.locale] || row.locale}.` });
        await load(filter);
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menerjemahkan baris ini." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal terhubung ke AI (periksa kuota/jaringan)." });
    } finally {
      setTranslatingId(null);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.entityId.trim() || !manualForm.source.trim() || !manualForm.translation.trim()) {
      setMessage({ ok: false, text: "Semua kolom wajib diisi." });
      return;
    }
    setSubmittingManual(true);
    setMessage(null);
    try {
      const res = await fetch("/api/i18n/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      });
      const json = await res.json();
      if (json?.success) {
        setMessage({ ok: true, text: "Terjemahan manual berhasil disimpan!" });
        setIsAddingManual(false);
        setManualForm({
          locale: manualForm.locale,
          entity: "product",
          entityId: "",
          field: "description",
          source: "",
          translation: "",
        });
        await load(filter);
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menyimpan terjemahan manual." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menyimpan (jaringan)." });
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleDelete = async (row: TranslationRow) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/i18n/translations?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json?.success) {
        setMessage({ ok: true, text: "Cache dihapus — akan diterjemahkan ulang otomatis." });
        await load(filter);
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menghapus." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menghapus." });
    }
  };

  const handleTranslateAll = async () => {
    setTranslating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/i18n/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "translate-all" }),
      });
      const json = await res.json();
      if (json?.success) {
        setJob(json.data?.job || null);
        setMessage({
          ok: true,
          text:
            "Proses berjalan di background. Halaman ini otomatis diperbarui saat selesai.",
        });
      } else {
        setTranslating(false);
        setMessage({ ok: false, text: json?.error || "Gagal menerjemahkan." });
      }
    } catch {
      setTranslating(false);
      setMessage({ ok: false, text: "Gagal menerjemahkan (jaringan)." });
    }
  };

  const handleRepair = async () => {
    setTranslating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/i18n/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "repair" }),
      });
      const json = await res.json();
      if (json?.success) {
        setJob(json.data?.job || null);
        setMessage({
          ok: true,
          text: "Perbaikan berjalan di background (membersihkan baris gagal lalu buat ulang).",
        });
      } else {
        setTranslating(false);
        setMessage({ ok: false, text: json?.error || "Gagal memperbaiki terjemahan." });
      }
    } catch {
      setTranslating(false);
      setMessage({ ok: false, text: "Gagal memperbaiki (jaringan)." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        <span>Memuat cache terjemahan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          aiEnabled
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}
      >
        {aiEnabled ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">
              {aiEnabled
                ? `Terjemahan AI Aktif: ${aiProvider?.provider || "AI Engine"}`
                : "Terjemahan AI Nonaktif"}
            </span>
            {aiEnabled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Model: {aiProvider?.model || "default"}
              </span>
            )}
          </div>
          <span className="text-[11px] opacity-90 leading-relaxed block mt-1">
            {aiEnabled
              ? `Total ${total} terjemahan tersimpan di database. AI hanya dipanggil saat Anda klik tombol terjemahan di CMS (AI Massal / AI per-baris). Pengunjung website 100% membaca dari database cache (bebas kuota & ultra cepat). Anda juga bisa mengedit atau menambah terjemahan secara manual.`
              : "Isi OPENCODE_API_KEY (OpenCode Zen) atau GEMINI_API_KEY / NINEROUTER_API_KEY di .env untuk mengaktifkan AI di CMS, atau kelola terjemahan secara manual di bawah."}
          </span>
        </div>
      </div>

      {/* Ringkasan per bahasa */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(LOCALE_NAMES).map(([code, name]) => (
            <div
              key={code}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">{name}</div>
              <div className="text-lg font-bold text-white">{byLocale[code] || 0}</div>
              <div className="text-[9px] text-slate-500">teks</div>
            </div>
          ))}
        </div>
      )}

      {/* Aksi */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleTranslateAll}
          disabled={translating || !aiEnabled}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2"
        >
          {translating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          <span>{translating ? "Menerjemahkan..." : "Terjemahkan Semua Konten (AI)"}</span>
        </button>

        <button
          type="button"
          onClick={handleRepair}
          disabled={translating || !aiEnabled}
          className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 disabled:opacity-50 font-bold text-xs flex items-center gap-2"
          title="Bersihkan cache yang gagal diterjemahkan lalu buat ulang"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Perbaiki Terjemahan Bermasalah</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddingManual((v) => !v)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5 text-brand-400" />
          <span>{isAddingManual ? "Tutup Form Manual" : "+ Tambah Terjemahan Manual"}</span>
        </button>

        <button
          type="button"
          onClick={() => load(filter)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Form Tambah Terjemahan Manual */}
      {isAddingManual && (
        <form
          onSubmit={handleCreateManual}
          className="p-4 rounded-2xl bg-slate-900 border border-brand-500/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-400" /> Input Terjemahan Manual Baru
            </span>
            <button
              type="button"
              onClick={() => setIsAddingManual(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Bahasa Target</label>
              <select
                value={manualForm.locale}
                onChange={(e) => setManualForm((f) => ({ ...f, locale: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              >
                {Object.entries(LOCALE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Entity / Tipe</label>
              <input
                type="text"
                placeholder="product / faq / hero / siteContent"
                value={manualForm.entity}
                onChange={(e) => setManualForm((f) => ({ ...f, entity: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Entity ID / Slug</label>
              <input
                type="text"
                placeholder="misal: dryfit-milano atau 1"
                value={manualForm.entityId}
                onChange={(e) => setManualForm((f) => ({ ...f, entityId: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Field / Kolom</label>
              <input
                type="text"
                placeholder="misal: description / question / title"
                value={manualForm.field}
                onChange={(e) => setManualForm((f) => ({ ...f, field: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Teks Asli (Indonesia)</label>
              <textarea
                rows={2}
                placeholder="Masukkan teks asli bahasa Indonesia..."
                value={manualForm.source}
                onChange={(e) => setManualForm((f) => ({ ...f, source: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Terjemahan Manual</label>
              <textarea
                rows={2}
                placeholder="Masukkan teks terjemahan bahasa target..."
                value={manualForm.translation}
                onChange={(e) => setManualForm((f) => ({ ...f, translation: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingManual(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingManual}
              className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              {submittingManual ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan ke Database
            </button>
          </div>
        </form>
      )}

      {job?.running && (
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-200 text-xs flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="min-w-0">
            <span className="font-bold block">Proses terjemahan berjalan di background</span>
            <span className="text-[11px] opacity-90 block mt-0.5 truncate">
              {job.message || job.phase}
            </span>
          </span>
        </div>
      )}

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

      {/* Filter bahasa */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-semibold">Filter bahasa:</span>
        <button
          type="button"
          onClick={() => { setFilter(""); load(""); }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${filter === "" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400"}`}
        >
          Semua
        </button>
        {Object.keys(LOCALE_NAMES).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => { setFilter(code); load(code); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${filter === code ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {LOCALE_NAMES[code]}
          </button>
        ))}
      </div>

      {/* Daftar terjemahan */}
      {rows.length === 0 ? (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <Languages className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Belum ada terjemahan tersimpan.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Klik "Terjemahkan Semua Konten (AI)" untuk menerjemahkan otomatis, atau klik "+ Tambah Terjemahan Manual".
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {LOCALE_NAMES[row.locale] || row.locale}
                </span>
                <span className="text-slate-500 font-mono">{row.entity}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 font-mono">{row.entityId}</span>
                <span className="text-slate-600">·</span>
                <span className="text-brand-400 font-mono">{row.field}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Teks Asli (Indonesia)
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 rounded-lg p-2 line-clamp-2">
                    {row.source || <em className="text-slate-600">(kosong)</em>}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Terjemahan
                  </div>
                  <textarea
                    rows={2}
                    value={drafts[row.id] ?? row.translation}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-brand-500 resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus cache
                </button>
                <button
                  type="button"
                  onClick={() => handleTranslateSingle(row)}
                  disabled={translatingId === row.id || !aiEnabled}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 disabled:opacity-50 text-[11px] font-bold flex items-center gap-1.5"
                  title="Terjemahkan baris ini saja dengan AI Gemini"
                >
                  {translatingId === row.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI Translate
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(row)}
                  disabled={savingId === row.id}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 text-[11px] font-bold flex items-center gap-1.5"
                >
                  {savingId === row.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Simpan Manual
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
