"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  User, 
  Lock, 
  Activity, 
  FileCheck, 
  Cpu, 
  Layers,
  Database
} from "lucide-react";

export default function AuditLogsPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const mockAuditLogs = [
    {
      id: "log-101",
      timestamp: "2026-10-03 22:15:40",
      user: "Hendra Wijaya (Customer B2B)",
      role: "CUSTOMER",
      ipAddress: "182.253.110.42",
      action: "DIGITAL_PROOF_APPROVED",
      details: "Menyetujui Digital Proofing Cetak untuk SPK TEX-202610-001 (Dryfit Milano 135 GSM 500m)",
      severity: "INFO",
    },
    {
      id: "log-102",
      timestamp: "2026-10-03 21:40:12",
      user: "Pricilia Kishin Hassanand (Admin)",
      role: "ADMINISTRATOR",
      ipAddress: "103.21.244.18",
      action: "2FA_AUTHENTICATION_SUCCESS",
      details: "Berhasil login dengan Autentikasi Dua Faktor (TOTP 2FA) ke Enterprise Portal",
      severity: "SECURITY",
    },
    {
      id: "log-103",
      timestamp: "2026-10-03 20:30:05",
      user: "Rian Pratama (Sales Rep)",
      role: "SALES_REP",
      ipAddress: "36.88.192.88",
      action: "CRM_LEAD_STAGE_PROGRESSION",
      details: "Memindahkan status prospek PT. Apparel Prima ke NEGOTIATION (Nilai: Rp 68.750.000)",
      severity: "BUSINESS",
    },
    {
      id: "log-104",
      timestamp: "2026-10-03 18:22:10",
      user: "Bambang Santoso (Warehouse)",
      role: "WAREHOUSE_STAFF",
      ipAddress: "10.0.1.45 (Gudang Dayeuhkolot)",
      action: "ROLL_STOCK_DEDUCTED",
      details: "Pemotongan 50 meter kain dari Roll Barcode ROL-DFM-135-0981 untuk antrean mesin cetak",
      severity: "INVENTORY",
    },
    {
      id: "log-105",
      timestamp: "2026-10-03 16:05:00",
      user: "System Webhook (Payment Gateway)",
      role: "SYSTEM",
      ipAddress: "103.22.200.5",
      action: "PAYMENT_WEBHOOK_VERIFIED",
      details: "Pembayaran Virtual Account BCA Rp 18.500.000 untuk TEX-202610-001 terverifikasi lunas",
      severity: "FINANCIAL",
    },
  ];

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesFilter = filterType === "ALL" || log.severity === filterType;
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              PRD V2 3.4 — Audit Trails & System Security
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Log Audit & Jejak Aktivitas Administratif
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan menyeluruh setiap tindakan persetujuan proofing, transaksi keuangan, 2FA admin, dan pemotongan stok bahan baku.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "SECURITY", "BUSINESS", "FINANCIAL", "INVENTORY"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? "bg-brand-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari aktor pengguna, nama aksi, atau detail insiden..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu & IP Address</th>
                <th className="py-3.5 px-4">Pengguna & Peran</th>
                <th className="py-3.5 px-4">Kategori Aksi</th>
                <th className="py-3.5 px-4">Deskripsi Aktivitas</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-white text-xs">{log.timestamp}</div>
                    <div className="font-mono text-slate-500 text-[10px] mt-0.5">{log.ipAddress}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-xs">{log.user}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono mt-0.5 inline-block">
                      {log.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-accent-cyan text-[11px]">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 text-xs max-w-md">
                    {log.details}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                      log.severity === "SECURITY"
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : log.severity === "FINANCIAL"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : log.severity === "INVENTORY"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-brand-500/20 text-brand-300 border-brand-500/40"
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
