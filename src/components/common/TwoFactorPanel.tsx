"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  QrCode,
} from "lucide-react";

type TwoFactorState = {
  enabled: boolean;
  enabledAt: string | null;
  remainingBackupCodes: number;
};

export function TwoFactorPanel() {
  const [state, setState] = useState<TwoFactorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Setup
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [setupCode, setSetupCode] = useState("");

  // Enable / disable
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/auth/2fa");
      const data = await res.json();
      if (data?.success && data.data) {
        setState(data.data);
      }
    } catch {
      setError("Gagal memuat status 2FA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const post = async (payload: any) => {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Permintaan gagal.");
    }
    return data;
  };

  const handleSetup = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await post({ action: "setup" });
      setSecret(data.data.secret);
      setQrDataUrl(data.data.qrDataUrl);
      setOtpauthUri(data.data.otpauth);
      setSetupCode("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnable = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await post({ action: "enable", code: setupCode.trim() });
      setBackupCodes(data.data?.backupCodes || null);
      setSecret("");
      setQrDataUrl("");
      setOtpauthUri("");
      setSetupCode("");
      await loadStatus();
      setSuccess(data.message || "2FA berhasil diaktifkan.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await post({
        action: "disable",
        code: verifyCode.trim(),
        password,
      });
      setVerifyCode("");
      setPassword("");
      await loadStatus();
      setSuccess(data.message || "2FA dinonaktifkan.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await post({ action: "regenerate-codes", code: verifyCode.trim() });
      setBackupCodes(data.data?.backupCodes || null);
      setVerifyCode("");
      await loadStatus();
      setSuccess(data.message || "Kode cadangan dibuat ulang.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  const downloadBackupCodes = () => {
    if (!backupCodes) return;
    const content = [
      "KODE CADANGAN 2FA - XORAMATERIA",
      "===========================================",
      "Simpan kode ini di tempat aman. Setiap kode hanya dapat dipakai SATU KALI.",
      "Kode ini hanya ditampilkan sekali. Jangan bagikan kepada siapa pun.",
      "",
      ...backupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}. ${c}`),
      "",
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kode-cadangan-2fa-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        <span>Memuat status autentikasi dua faktor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status Badge */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          state?.enabled
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}
      >
        {state?.enabled ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        )}
        <div>
          <span className="font-bold block">
            {state?.enabled
              ? "Autentikasi Dua Faktor (2FA) Aktif"
              : "Autentikasi Dua Faktor (2FA) Belum Aktif"}
          </span>
          <span className="text-[11px] opacity-90 leading-relaxed block mt-0.5">
            {state?.enabled
              ? `Aktif sejak ${state.enabledAt ? new Date(state.enabledAt).toLocaleDateString("id-ID") : "-"} • Sisa kode cadangan: ${state.remainingBackupCodes}`
              : "Gunakan Google Authenticator, Authy, atau 1Password untuk melindungi akun ini dari akses tidak sah."}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* ============ BELUM AKTIF: SETUP ============ */}
      {!state?.enabled && (
        <div className="space-y-4">
          {!qrDataUrl ? (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold text-white">Langkah 1 — Siapkan Aplikasi Autentikator</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Di smartphone Anda, buka <strong className="text-slate-300">Google Authenticator</strong>,{" "}
                <strong className="text-slate-300">Microsoft Authenticator</strong>, atau{" "}
                <strong className="text-slate-300">1Password</strong>. Pilih menu
                &quot;Tambah Akun&quot; → &quot;Masukkan Kode Setup&quot;. Klik tombol di bawah untuk
                mendapatkan QR Code dan kunci rahasia Anda.
              </p>
              <button
                type="button"
                onClick={handleSetup}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                <span>Buat QR Code &amp; Kunci Rahasia</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-brand-500/30 space-y-4">
              {/* QR */}
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="shrink-0">
                  <div className="p-3 bg-white rounded-2xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="QR Code Setup 2FA" className="w-44 h-44" />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5 max-w-[11rem]">
                    Scan dengan aplikasi autentikator Anda
                  </p>
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1.5">
                      Langkah 2 — Masukkan Kunci Rahasia Manual
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      Jika kamera tidak bisa-scan QR Code, masukkan kunci berikut secara manual
                      (kode&nbsp;manual setup) di aplikasi autentikator:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[11px] text-brand-300 tracking-wider break-all select-all">
                        {showSecret ? secret : secret.replace(/.(?=.{4})/g, "•")}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        title={showSecret ? "Sembunyikan" : "Tampilkan"}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shrink-0 transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(secret)}
                        title="Salin kunci"
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shrink-0 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-1.5">
                      Langkah 3 — Verifikasi Kode 6 Digit
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      Setelah memindai, aplikasi akan menampilkan kode 6 digit yang berubah setiap
                      30 detik. Masukkan kode tersebut di bawah.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={setupCode}
                        onChange={(e) =>
                          setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="000000"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleEnable}
                        disabled={actionLoading || setupCode.length !== 6}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>Aktifkan 2FA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <details className="text-[11px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-300 transition-colors">
                  Lihat tautan setup manual (otpauth://)
                </summary>
                <code className="block mt-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-400 break-all">
                  {otpauthUri}
                </code>
              </details>
            </div>
          )}
        </div>
      )}

      {/* ============ SUDAH AKTIF: KELOLA ============ */}
      {state?.enabled && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white">Buat Kode Cadangan Baru</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kode cadangan dipakai saat Anda tidak bisa mengakses aplikasi autentikator. Masukkan
              kode 6 digit yang sedang tampil untuk membuat 10 kode baru.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={actionLoading || verifyCode.length !== 6}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Buat Ulang Kode</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
            <h4 className="text-xs font-bold text-rose-300">Nonaktifkan 2FA</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Menonaktifkan akan mengurangi keamanan akun. Anda harus memasukkan password dan kode
              TOTP saat ini sebagai konfirmasi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password akun Anda"
                autoComplete="current-password"
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                inputMode="numeric"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Kode 6 digit"
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="button"
              onClick={handleDisable}
              disabled={actionLoading || !password || verifyCode.length !== 6}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Nonaktifkan 2FA</span>
            </button>
          </div>
        </div>
      )}

      {/* ============ TAMPILKAN KODE CADANGAN (SEKALI) ============ */}
      {backupCodes && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-200">
              Simpan Kode Cadangan Anda Sekarang
            </h4>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Kode ini <strong>hanya ditampilkan sekali</strong> dan tidak bisa dilihat lagi
            nanti. Unduh atau catat ke tempat aman (misalnya password manager).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {backupCodes.map((c) => (
              <code
                key={c}
                className="bg-slate-950 border border-amber-500/30 rounded-lg py-2 text-center font-mono text-[11px] text-amber-200"
              >
                {c}
              </code>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={downloadBackupCodes}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Kode (.txt)</span>
            </button>
            <button
              type="button"
              onClick={() => copyText(backupCodes.join("\n"))}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Salin Semua</span>
            </button>
            <button
              type="button"
              onClick={() => setBackupCodes(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs"
            >
              <span>Saya Sudah Menyimpannya</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
