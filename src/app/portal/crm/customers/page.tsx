"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Package
} from "lucide-react";

export default function CustomersDirectoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const customers = MOCK_CUSTOMERS;

  const filtered = customers.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) ||
         c.company.toLowerCase().includes(search.toLowerCase()) ||
         c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              PRD 3.3 — Database Profil Klien 360°
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Manajemen Akun Pelanggan & Mitra Garmen
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Database legalitas perusahaan B2B, preferensi bahan kain, dan akumulasi nilai transaksi.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari perusahaan, nama, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Perusahaan & PIC</th>
                <th className="py-3.5 px-4">Kategori Akun</th>
                <th className="py-3.5 px-4">Bahan Favorit</th>
                <th className="py-3.5 px-4">Total Akumulasi</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/portal/crm/customers/${c.id}`)}
                  className="hover:bg-slate-900/50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/portal/crm/customers/${c.id}`}
                      className="font-bold text-white text-sm hover:text-brand-300 transition-colors"
                    >
                      {c.company}
                    </Link>
                    <div className="text-slate-400 text-[11px] mt-0.5">PIC: {c.name}</div>
                    <div className="text-slate-500 font-mono text-[10px]">NPWP: {c.taxId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-brand-500/10 text-brand-300 border border-brand-500/30 font-semibold text-[11px]">
                      {c.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {c.favoriteFabric}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-accent-cyan">{formatRupiah(c.totalSpent)}</div>
                    <div className="text-slate-400 text-[11px]">{c.totalMeters.toLocaleString()} Meter</div>
                  </td>
                  <td className="py-3.5 px-4 space-y-1 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {c.status}
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
