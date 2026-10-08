"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_CUSTOMER_ACTIVITIES } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, ShieldCheck,
  Package, Clock, ShoppingBag, MessageSquare, FileText,
  Star, Calendar, FileDown,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Aktif: "bg-emerald-500/15 text-emerald-400",
    "Baru": "bg-sky-500/15 text-sky-400",
    "Baru Bergabung": "bg-sky-500/15 text-sky-400",
    Nonaktif: "bg-slate-500/15 text-slate-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${colors[status] || "bg-slate-500/15 text-slate-400"}`}>
      {status}
    </span>
  );
}

const TYPE_ICONS: Record<string, any> = {
  PHONE_CALL: Clock,
  MEETING: MessageSquare,
  EMAIL: Mail,
  WHATSAPP_MESSAGE: MessageSquare,
  SAMPLE_FABRIC_SENT: Package,
};

export default function CustomerDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const id = (params as any)?.id || (typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>).id : "");

  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  const activities = MOCK_CUSTOMER_ACTIVITIES[id] || [];
  const orders = MOCK_ORDERS.filter(o => o.customerCompany === customer?.company);

  if (!customer) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-400 mb-4">Pelanggan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-brand-400 hover:text-brand-300 text-sm font-bold">← Kembali</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 transition-colors" title="Kembali">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">PRD 3.3 — Database Profil Klien 360°</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">{customer.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{customer.company} — {customer.tier}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={customer.status} />
          <button className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition-colors">
            Kirim Pesan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Perusahaan */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" /> Data Perusahaan & Legalitas
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500 mb-0.5">Nama Perusahaan</div>
                <div className="text-white font-semibold">{customer.company}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-0.5">NPWP</div>
                <div className="text-white font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-400" /> {customer.taxId}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-0.5">Alamat</div>
                <div className="text-white flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 text-brand-400 shrink-0" /> {customer.address}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-0.5">Bergabung</div>
                <div className="text-white flex items-center gap-1"><Calendar className="w-3 h-3 text-brand-400" /> {customer.joinedAt}</div>
              </div>
            </div>
          </div>

          {/* Riwayat Sales Order */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-400" /> Riwayat Sales Order ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <p className="text-slate-500 text-xs">Belum ada order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">No SO</th>
                      <th className="py-2.5 px-3">Kain & Meter</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 text-brand-300 font-mono font-bold">{o.orderNumber}</td>
                        <td className="py-2.5 px-3 text-slate-300">{o.items.map(it => it.fabricName).join(", ")} × {o.items.reduce((s, it) => s + it.lengthMeters, 0)}m</td>
                        <td className="py-2.5 px-3 text-white font-semibold">{formatRupiah(o.totalAmount)}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400">{o.status.replace("_", " ")}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Timeline Interaksi */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" /> Timeline Interaksi
            </h2>
            {activities.length === 0 ? (
              <p className="text-slate-500 text-xs">Belum ada interaksi tercatat.</p>
            ) : (
              <div className="space-y-0 border-l-2 border-slate-800 ml-3">
                {activities.map((a, i) => {
                  const Icon = TYPE_ICONS[a.type] || MessageSquare;
                  return (
                    <div key={i} className="relative pl-5 pb-5">
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 bg-slate-900 border-brand-400" />
                      <div className="text-[11px] text-slate-500">{a.createdAt}</div>
                      <div className="text-xs text-white font-semibold mt-0.5 flex items-center gap-1"><Icon className="w-3 h-3 text-brand-400" /> {a.type.replace("_", " ")}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.description}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          {/* Statistik */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-400" /> Statistik
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-400">Total Belanja</span>
                <span className="text-lg font-extrabold text-white">{formatRupiah(orders.reduce((s, o) => s + o.totalAmount, 0))}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-400">Total Meter</span>
                <span className="text-lg font-extrabold text-white">{orders.reduce((s, o) => s + o.items.reduce((s2, it) => s2 + it.lengthMeters, 0), 0).toLocaleString("id-ID")} m</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-400">Jumlah SO</span>
                <span className="text-lg font-extrabold text-white">{orders.length}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-400">Bahan Favorit</span>
                <span className="text-sm font-bold text-brand-300 flex items-center gap-1"><Package className="w-3 h-3" /> {customer.favoriteFabric}</span>
              </div>
            </div>
          </div>

          {/* Kontak */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" /> Kontak
            </h2>
            <div className="space-y-3 text-xs">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" /> {customer.phone}
              </a>
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" /> {customer.email}
              </a>
            </div>
          </div>

          {/* Dokumen */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" /> Dokumen
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors text-xs text-slate-300">
                <span className="flex items-center gap-2"><FileDown className="w-3.5 h-3.5 text-brand-400" /> Faktur Pajak</span>
                <span className="text-[10px] text-slate-500">PDF</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors text-xs text-slate-300">
                <span className="flex items-center gap-2"><FileDown className="w-3.5 h-3.5 text-brand-400" /> Quotation</span>
                <span className="text-[10px] text-slate-500">PDF</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors text-xs text-slate-300">
                <span className="flex items-center gap-2"><FileDown className="w-3.5 h-3.5 text-brand-400" /> Sampel Swatch</span>
                <span className="text-[10px] text-slate-500">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
