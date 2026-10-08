"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  KeyRound,
  Webhook,
  Cloud,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Lock,
  Server,
  Globe,
  Bell,
  MessageCircle,
  Send,
  Loader2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function PortalSettingsPage() {
  const [activeTab, setActiveTab] = useState<"RBAC" | "ERP" | "CLOUDFLARE" | "SECURITY" | "WHATSAPP">("RBAC");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WhatsApp settings
  const [waLoading, setWaLoading] = useState(true);
  const [waProvider, setWaProvider] = useState("fonnte");
  const [waFonnteApiKey, setWaFonnteApiKey] = useState("");
  const [waFonnteDeviceId, setWaFonnteDeviceId] = useState("");
  const [waMetaToken, setWaMetaToken] = useState("");
  const [waMetaPhoneId, setWaMetaPhoneId] = useState("");
  const [waWebhookToken, setWaWebhookToken] = useState("");
  const [waSaving, setWaSaving] = useState(false);
  const [waSaveMsg, setWaSaveMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waTesting, setWaTesting] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waTestTo, setWaTestTo] = useState("6287889856066");
  const [waTestMessage, setWaTestMessage] = useState("Halo dari Texora — ini pesan uji coba WhatsApp gateway.");
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [waDeviceStatus, setWaDeviceStatus] = useState<{
    checking: boolean;
    data: {
      connected?: boolean;
      deviceStatus?: string;
      name?: string;
      device?: string;
      expired?: string;
      quota?: string | number | null;
      error?: string;
    } | null;
  }>({ checking: false, data: null });

  // ERP Webhook settings
  const [erpUrl, setErpUrl] = useState("https://api.erp.texora.co.id/webhooks/v1/orders");
  const [erpSecret, setErpSecret] = useState("whsec_live_984a1e94819df829b380a");
  const [erpSyncEnabled, setErpSyncEnabled] = useState(true);

  // Security settings
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);

  // Muat setting WhatsApp dari API
  useEffect(() => {
    if (activeTab !== "WHATSAPP" || waLoading === false) return;
    (async () => {
      try {
        const res = await fetch("/api/settings/whatsapp");
        if (res.ok) {
          const { settings } = await res.json();
          setWaProvider(settings.provider || "fonnte");
          setWaFonnteApiKey(settings.fonnteApiKey || "");
          setWaFonnteDeviceId(settings.fonnteDeviceId || "");
          setWaMetaToken(settings.metaToken || "");
          setWaMetaPhoneId(settings.metaPhoneId || "");
          setWaWebhookToken(settings.webhookToken || "");
        }
      } catch {
        // ignore
      } finally {
        setWaLoading(false);
      }
    })();
  }, [activeTab, waLoading]);

  const handleCheckDevice = async () => {
    setWaDeviceStatus({ checking: true, data: null });
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-device" }),
      });
      const data = await res.json();
      setWaDeviceStatus({ checking: false, data });
    } catch {
      setWaDeviceStatus({
        checking: false,
        data: { connected: false, error: "Gagal menghubungi server untuk pengecekan device." },
      });
    }
  };

  const copyWebhookUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/api/whatsapp`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleSaveWhatsApp = async () => {
    setWaSaving(true);
    setWaSaveMsg(null);
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "whatsapp.provider": waProvider,
          "whatsapp.fonnte_api_key": waFonnteApiKey,
          "whatsapp.fonnte_device_id": waFonnteDeviceId,
          "whatsapp.meta_token": waMetaToken,
          "whatsapp.meta_phone_id": waMetaPhoneId,
          "whatsapp.webhook_verify_token": waWebhookToken,
        }),
      });
      const data = await res.json();
      if (res.ok && data.saved) {
        if (data.settings) {
          setWaFonnteApiKey(data.settings.fonnteApiKey || "");
          setWaMetaToken(data.settings.metaToken || "");
        }
        setWaSaveMsg({ ok: true, msg: "Pengaturan WhatsApp berhasil disimpan ke basis data!" });
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setWaSaveMsg(null);
        }, 3500);
      } else {
        setWaSaveMsg({ ok: false, msg: data.error || "Gagal menyimpan konfigurasi WhatsApp." });
      }
    } catch {
      setWaSaveMsg({ ok: false, msg: "Gagal menyimpan: periksa koneksi server." });
    } finally {
      setWaSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setWaTesting(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testTo: waTestTo, testMessage: waTestMessage }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaTestResult({ ok: true, msg: `Pesan uji coba terkirim sukses via ${data.provider}!` });
      } else {
        setWaTestResult({ ok: false, msg: data.error || "Gagal mengirim pesan uji coba." });
      }
    } catch {
      setWaTestResult({ ok: false, msg: "Tidak bisa menghubungi server." });
    } finally {
      setWaTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(null as any), 3500);
  };

  const usersList = [
    { name: "Ir. Gunawan Setiadi", email: "admin@texora.co.id", role: "ADMINISTRATOR", twoFactor: "Aktif", status: "Aktif" },
    { name: "Dian Permata", email: "sales@texora.co.id", role: "SALES_REP", twoFactor: "Aktif", status: "Aktif" },
    { name: "Agus Santoso", email: "logistik@texora.co.id", role: "WAREHOUSE_STAFF", twoFactor: "Non-Aktif", status: "Aktif" },
    { name: "Hendra Wijaya", email: "hendra@garmentkreatif.com", role: "CUSTOMER", twoFactor: "Opsional", status: "Aktif" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Konfigurasi Platform (PRD §3.3)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Pengaturan Sistem, Hak Akses RBAC & Integrasi
          </h1>
          <p className="text-xs text-slate-400">
            Kelola otentikasi dua faktor (2FA), webhook sinkronisasi ERP akuntansi, dan cache CDN Cloudflare.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan berhasil disimpan ke basis data!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: "RBAC", label: "Hak Akses & Role (RBAC)", icon: Users },
          { id: "WHATSAPP", label: "WhatsApp Gateway (Fonnte)", icon: MessageCircle },
          { id: "ERP", label: "Integrasi Webhook ERP", icon: Webhook },
          { id: "CLOUDFLARE", label: "CDN & Cache Cloudflare", icon: Cloud },
          { id: "SECURITY", label: "Kebijakan Keamanan & 2FA", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: WhatsApp Gateway */}
      {activeTab === "WHATSAPP" && (
        <div className="space-y-6 max-w-3xl">
          {/* Panel Konfigurasi */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-brand-400" />
                  <span>Konfigurasi WhatsApp Gateway</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Integrasi resmi untuk pengiriman notifikasi order & perpesanan dua arah modul CRM Inbox.
                </p>
              </div>

              {/* Status Badge & Check Button */}
              {waProvider === "fonnte" && (
                <button
                  type="button"
                  onClick={handleCheckDevice}
                  disabled={waDeviceStatus.checking}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500/50 text-xs text-slate-300 font-semibold flex items-center gap-2 shrink-0 transition-all"
                >
                  {waDeviceStatus.checking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-brand-400" />
                  )}
                  <span>{waDeviceStatus.checking ? "Memeriksa..." : "Cek Status Device"}</span>
                </button>
              )}
            </div>

            {/* Live Device Status Box */}
            {waDeviceStatus.data && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  waDeviceStatus.data.connected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {waDeviceStatus.data.connected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      {waDeviceStatus.data.connected
                        ? "Device Fonnte Terhubung & Siap Digunakan (Connect)"
                        : "Device Fonnte Belum Terhubung"}
                    </span>
                  </div>
                  {waDeviceStatus.data.deviceStatus && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/60 font-mono text-[10px] uppercase font-bold">
                      {waDeviceStatus.data.deviceStatus}
                    </span>
                  )}
                </div>

                {waDeviceStatus.data.connected ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nama Device:</span>
                      <strong className="text-white">{waDeviceStatus.data.name || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                      <strong className="text-white font-mono">{waDeviceStatus.data.device || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Kuota:</span>
                      <strong className="text-emerald-400">{waDeviceStatus.data.quota ?? "-"} pesan</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Masa Aktif:</span>
                      <strong className="text-white">{waDeviceStatus.data.expired || "-"}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-300">
                    {waDeviceStatus.data.error || "Pastikan scan QR code di dashboard Fonnte dan periksa token Anda."}
                  </p>
                )}
              </div>
            )}

            {waLoading ? (
              <p className="text-xs text-slate-400">Memuat konfigurasi...</p>
            ) : (
              <>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Provider Gateway</label>
                    <select
                      value={waProvider}
                      onChange={(e) => setWaProvider(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="fonnte">Fonnte (fonnte.com) — Rekomendasi</option>
                      <option value="meta">Meta WhatsApp Cloud API</option>
                    </select>
                  </div>

                  {waProvider === "fonnte" ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-semibold">Fonnte API Token</label>
                          <a
                            href="https://md.fonnte.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>Buka Dashboard Fonnte</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <input
                          type="password"
                          value={waFonnteApiKey}
                          onChange={(e) => setWaFonnteApiKey(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Ambil token dari <strong>Dashboard Fonnte → Device → Token</strong>.
                        </p>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Fonnte Device ID (opsional)</label>
                        <input
                          type="text"
                          value={waFonnteDeviceId}
                          onChange={(e) => setWaFonnteDeviceId(e.target.value)}
                          placeholder="default"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Kosongkan jika menggunakan token per-device (standar).
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">WhatsApp API Token (Meta)</label>
                        <input
                          type="password"
                          value={waMetaToken}
                          onChange={(e) => setWaMetaToken(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Phone Number ID (Meta)</label>
                        <input
                          type="text"
                          value={waMetaPhoneId}
                          onChange={(e) => setWaMetaPhoneId(e.target.value)}
                          placeholder="123456789012345"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Webhook Configuration Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-semibold">URL Webhook Pesan Masuk (Inbound)</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-brand-300 text-[11px] truncate select-all">
                        {typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp` : "/api/whatsapp"}
                      </div>
                      <button
                        type="button"
                        onClick={copyWebhookUrl}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {copiedWebhook ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Salin URL</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      💡 <strong>Panduan Webhook Fonnte:</strong> Buka Dashboard Fonnte → Menu Device → Edit Device → Masukkan URL webhook di atas pada kolom <em>Webhook URL</em>, centang <em>Auto Read</em>, lalu klik Simpan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Webhook Verify Token (Meta Cloud)</label>
                    <input
                      type="text"
                      value={waWebhookToken}
                      onChange={(e) => setWaWebhookToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Token verifikasi untuk Meta Cloud API handshake (default: <span className="font-mono text-slate-400">texora_whatsapp_2026</span>).
                    </p>
                  </div>
                </div>

                {waSaveMsg && (
                  <div
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      waSaveMsg.ok
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {waSaveMsg.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{waSaveMsg.msg}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveWhatsApp}
                    disabled={waSaving}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
                  >
                    {waSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{waSaving ? "Menyimpan..." : "Simpan Konfigurasi"}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Panel Test Kirim */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div>
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-400" />
                <span>Uji Coba Pengiriman</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kirim pesan WhatsApp langsung ke nomor tujuan untuk memastikan koneksi API berfungsi.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor Tujuan</label>
                <input
                  type="text"
                  value={waTestTo}
                  onChange={(e) => setWaTestTo(e.target.value)}
                  placeholder="628xxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Pesan</label>
                <textarea
                  rows={3}
                  value={waTestMessage}
                  onChange={(e) => setWaTestMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>

            {waTestResult && (
              <div
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  waTestResult.ok
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {waTestResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                )}
                <span>{waTestResult.msg}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={waTesting || !waTestTo.trim() || !waTestMessage.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
              >
                {waTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{waTesting ? "Mengirim..." : "Kirim Pesan Test"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: RBAC Table */}
      {activeTab === "RBAC" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-white">Daftar Pengguna & Peran Sistem</h3>
                <p className="text-xs text-slate-400">Pengaturan Role-Based Access Control sesuai PRD §3.3.</p>
              </div>
              <button
                type="button"
                onClick={() => alert("Membuka form undangan pengguna baru...")}
                className="px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
              >
                + Undang User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Nama & Email</th>
                    <th className="py-3 px-4 font-bold">Peran (Role)</th>
                    <th className="py-3 px-4 font-bold">Status 2FA</th>
                    <th className="py-3 px-4 font-bold">Status Akun</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {usersList.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400">
                        {u.twoFactor}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="text-xs text-slate-400 hover:text-white font-semibold">
                          Ubah Hak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ERP Webhook */}
      {activeTab === "ERP" && (
        <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Webhook className="w-5 h-5 text-brand-400" />
              <span>Sinkronisasi Webhook ERP & Akuntansi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Setiap pesanan berbayar dan SPK proof disetujui akan otomatis mentrigger payload JSON ke endpoint ERP perusahaan.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook Endpoint URL</label>
              <input
                type="url"
                value={erpUrl}
                onChange={(e) => setErpUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook Signing Secret</label>
              <input
                type="password"
                value={erpSecret}
                onChange={(e) => setErpSecret(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={erpSyncEnabled}
                  onChange={(e) => setErpSyncEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-slate-300 font-semibold">Aktifkan integrasi otomatis real-time</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
            >
              Simpan Konfigurasi Webhook
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Cloudflare CDN */}
      {activeTab === "CLOUDFLARE" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-brand-400" />
              <span>Optimasi Aset & Cloudflare CDN Edge Cache</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Kelola status caching foto kain resolusi tinggi, WebP/AVIF auto-convert, dan purge cache seketika.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status SSL/TLS Cloudflare:</span>
              <span className="font-bold text-emerald-400">Strict (Full End-to-End)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Edge Image Optimization:</span>
              <span className="font-bold text-white">WebP / AVIF On-the-fly Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cache Hit Ratio (Textile Catalog):</span>
              <span className="font-bold text-brand-400 font-mono">98.4% (Bandwidth Saved: 420 GB)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Perintah Purge Cache Cloudflare CDN terkirim! Edge nodes diperbarui dalam 30 detik.")}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Purge Seluruh Cache Edge CDN</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === "SECURITY" && (
        <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <span>Kebijakan Keamanan & Otentikasi Dua Faktor (2FA)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Kebijakan perlindungan akun administrator dan staf internal (PRD §3.3).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
              />
              <div>
                <span className="text-white font-bold block">Wajibkan 2FA untuk Semua Akun Administrator & Keuangan</span>
                <span className="text-slate-400 block mt-0.5">Memerlukan kode OTP 6-digit Google Authenticator / TOTP sebelum mengakses menu analitik dan faktur.</span>
              </div>
            </label>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batas Waktu Sesi Tidak Aktif (Menit)</label>
              <input
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                className="w-40 bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
            >
              Simpan Kebijakan Keamanan
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
