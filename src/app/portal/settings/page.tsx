"use client";

import { useState } from "react";
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
  Bell
} from "lucide-react";

export default function PortalSettingsPage() {
  const [activeTab, setActiveTab] = useState<"RBAC" | "ERP" | "CLOUDFLARE" | "SECURITY">("RBAC");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ERP Webhook settings
  const [erpUrl, setErpUrl] = useState("https://api.erp.texora.co.id/webhooks/v1/orders");
  const [erpSecret, setErpSecret] = useState("whsec_live_984a1e94819df829b380a");
  const [erpSyncEnabled, setErpSyncEnabled] = useState(true);

  // Security settings
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);

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
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
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
