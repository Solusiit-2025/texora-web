"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DatabaseBackup,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  HardDriveDownload,
  Trash2,
  Clock,
  ShieldCheck,
  FileJson,
  RefreshCw,
  Upload,
  Database,
  X,
} from "lucide-react";

interface BackupFile {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

interface BackupLog {
  id: string;
  filename: string;
  sizeBytes: number;
  recordCount: number;
  status: string;
  trigger: string;
  message: string | null;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}

export function BackupPanel() {
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [backupDir, setBackupDir] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pruning, setPruning] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/backup");
      const data = await res.json();
      if (data?.success && data.data) {
        setFiles(data.data.files || []);
        setLogs(data.data.logs || []);
        setBackupDir(data.data.backupDir || "");
      }
    } catch {
      setMessage({ ok: false, text: "Gagal memuat data backup." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage({
          ok: true,
          text: `Backup berhasil! ${data.data.filename} (${data.data.recordCount} record, ${formatBytes(data.data.sizeBytes)})`,
        });
        await loadData();
      } else {
        setMessage({ ok: false, text: data?.error || "Gagal membuat backup." });
      }
    } catch {
      setMessage({ ok: false, text: "Terjadi kesalahan jaringan saat backup." });
    } finally {
      setCreating(false);
    }
  };

  const handlePrune = async () => {
    setPruning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prune", keep: 7 }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage({ ok: true, text: data.message });
        await loadData();
      } else {
        setMessage({ ok: false, text: data?.error || "Gagal membersihkan backup lama." });
      }
    } catch {
      setMessage({ ok: false, text: "Terjadi kesalahan jaringan." });
    } finally {
      setPruning(false);
    }
  };

  const openRestoreForFile = (filename: string) => {
    setRestoreTarget(filename);
    setPendingFile(null);
    setConfirmText("");
    setShowRestoreModal(true);
  };

  const openRestoreForUpload = (file: File) => {
    setRestoreTarget(null);
    setPendingFile(file);
    setConfirmText("");
    setShowRestoreModal(true);
  };

  const handleRestoreConfirm = async () => {
    if (confirmText.trim().toUpperCase() !== "RESTORE") {
      setMessage({ ok: false, text: "Ketik RESTORE untuk konfirmasi." });
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      let res: Response;
      if (pendingFile) {
        const form = new FormData();
        form.append("file", pendingFile);
        form.append("action", "restore");
        res = await fetch("/api/backup", { method: "POST", body: form });
      } else if (restoreTarget) {
        res = await fetch("/api/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore", filename: restoreTarget }),
        });
      } else {
        setMessage({ ok: false, text: "Tidak ada target restore." });
        setRestoring(false);
        return;
      }

      const data = await res.json();
      if (data?.success) {
        setMessage({
          ok: true,
          text: `Restore berhasil! ${data.data?.recordCount ?? 0} record dipulihkan.`,
        });
        setShowRestoreModal(false);
        setRestoreTarget(null);
        setPendingFile(null);
        setConfirmText("");
        await loadData();
      } else {
        setMessage({ ok: false, text: data?.error || "Gagal melakukan restore." });
      }
    } catch {
      setMessage({ ok: false, text: "Terjadi kesalahan jaringan saat restore." });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        <span>Memuat riwayat backup...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Penjelasan */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-brand-200">
            Backup Otomatis &amp; Manual Teraktif
          </span>
        </div>
        <p className="text-[11px] text-brand-200/80 leading-relaxed">
          Server membuat backup JSON otomatis setiap <strong>24 jam</strong> dan menyimpan
          14 file terbaru. Anda juga dapat membuat backup manual kapan saja. Semua proses
          tercatat pada audit trail <code className="font-mono">backup_logs</code> di
          database.
        </p>
        {backupDir && (
          <p className="text-[10px] text-brand-300/70 font-mono break-all">
            Lokasi penyimpanan: {backupDir}
          </p>
        )}
      </div>

      {/* Aksi */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <HardDriveDownload className="w-4 h-4" />
          )}
          <span>{creating ? "Membuat Backup..." : "Backup Sekarang"}</span>
        </button>

        <button
          type="button"
          onClick={() => loadData()}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>

        <button
          type="button"
          onClick={handlePrune}
          disabled={pruning || files.length === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          {pruning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>Bersihkan yang Lama (Simpan 7)</span>
        </button>
      </div>

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

      {/* Restore dari file upload */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Pulihkan dari File Backup (Upload)</span>
        </h4>
        <p className="text-[11px] text-slate-400">
          Unggah file backup JSON (.json) untuk memulihkan database. Tindakan ini
          akan menimpa seluruh data yang ada.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) openRestoreForUpload(f);
              e.target.value = "";
            }}
          />
          <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors">
            <FileJson className="w-3.5 h-3.5" />
            <span>Pilih File &amp; Pulihkan</span>
          </span>
        </label>
      </div>

      {/* Daftar File */}
      <div>
        <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-brand-400" />
          <span>File Backup Tersimpan ({files.length})</span>
        </h4>

        {files.length === 0 ? (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <DatabaseBackup className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Belum ada file backup.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Klik &quot;Backup Sekarang&quot; untuk membuat backup pertama Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.filename}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-mono text-slate-300 truncate">
                    {f.filename}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-2.5 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(f.createdAt).toLocaleString("id-ID")}
                    </span>
                    <span>{formatBytes(f.sizeBytes)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openRestoreForFile(f.filename)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    title="Pulihkan database dari file ini"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Pulihkan</span>
                  </button>
                  <a
                    href={`/api/backup?download=${encodeURIComponent(f.filename)}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat / Audit Trail */}
      {logs.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <DatabaseBackup className="w-4 h-4 text-brand-400" />
            <span>Riwayat Audit Backup</span>
          </h4>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {logs.map((l) => (
              <div
                key={l.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-[10px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-slate-400 truncate">{l.filename}</p>
                  <p className="text-slate-600 mt-0.5">
                    {new Date(l.createdAt).toLocaleString("id-ID")} • {l.recordCount} record
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      l.status === "SUCCESS"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {l.status}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    {l.trigger}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Restore */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Konfirmasi Restore Database
              </h3>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              Tindakan ini akan <strong>MENIMPA SELURUH DATA</strong> database dengan
              isi backup. Pastikan Anda sudah menyimpan backup terbaru. Tindakan
              tidak dapat dibatalkan.
            </div>
            <div className="text-xs text-slate-300">
              Target:{" "}
              <span className="font-mono text-amber-300">
                {pendingFile ? pendingFile.name : restoreTarget}
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">
                Ketik <span className="font-mono text-white">RESTORE</span> untuk
                konfirmasi
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm font-mono focus:outline-none focus:border-amber-500"
                placeholder="RESTORE"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRestoreConfirm}
                disabled={restoring || confirmText.trim().toUpperCase() !== "RESTORE"}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2"
              >
                {restoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{restoring ? "Memulihkan..." : "Pulihkan Sekarang"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
