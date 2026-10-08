"use client";

import { useEffect, useState } from "react";
import { MOCK_LEADS } from "@/lib/mock-data";
import { Lead, LeadStage, ActivityType } from "@/types";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { 
  TrendingUp, 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2,
  Calendar,
  X
} from "lucide-react";

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState<Lead | null>(null);
  
  // New activity form state
  const [activityType, setActivityType] = useState<ActivityType>("PHONE_CALL");
  const [activityDesc, setActivityDesc] = useState("");

  // New lead form state
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    companyName: "",
    contactPerson: "",
    title: "",
    fabricInterest: "",
    estimatedMeters: 0,
  });

  // Auto-prefill dari Social Listening (comment -> lead)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sosmed = params.get("sosmed");
    const pesan = params.get("pesan");
    if (sosmed || pesan) {
      setNewLeadForm({
        companyName: sosmed ? `@${sosmed} (Sosial Media)` : "Prospek Sosial Media",
        contactPerson: sosmed ? `@${sosmed}` : "",
        title: pesan || "",
        fabricInterest: "",
        estimatedMeters: 0,
      });
      setShowNewLeadModal(true);
    }
  }, []);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.companyName.trim() || !newLeadForm.title.trim()) return;
    const id = `lead-${Date.now()}`;
    const meters = newLeadForm.estimatedMeters || 0;
    const newLead: Lead = {
      id,
      title: newLeadForm.title.trim(),
      companyName: newLeadForm.companyName.trim(),
      contactPerson: newLeadForm.contactPerson.trim() || "-",
      email: "",
      phone: "",
      estimatedValue: meters * 28000,
      estimatedMeters: meters,
      fabricInterest: newLeadForm.fabricInterest.trim() || "Belum ditentukan",
      stage: "NEW_INQUIRY",
      assignedSalesName: "Rian Pratama",
      updatedAt: "Baru saja",
      activities: [
        {
          id: `act-${Date.now()}`,
          leadId: id,
          authorName: "Sales (Social Listening)",
          type: "NOTE",
          description: `Sumber: Social Listening — ${newLeadForm.title.trim()}`,
          createdAt: "Baru saja",
        },
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
    setNewLeadForm({ companyName: "", contactPerson: "", title: "", fabricInterest: "", estimatedMeters: 0 });
    setShowNewLeadModal(false);
  };

  const stages: { key: LeadStage; label: string; color: string }[] = [
    { key: "NEW_INQUIRY", label: "Inkuiri Baru", color: "border-slate-700 bg-slate-900/40" },
    { key: "REQUIREMENT_GATHERING", label: "Kebutuhan Sampel", color: "border-brand-500/40 bg-brand-950/20" },
    { key: "QUOTATION_SENT", label: "Penawaran Terkirim", color: "border-accent-cyan/40 bg-cyan-950/20" },
    { key: "NEGOTIATION", label: "Negosiasi Kontrak", color: "border-amber-500/40 bg-amber-950/20" },
    { key: "WON", label: "Closing Menang (Won)", color: "border-emerald-500/40 bg-emerald-950/20" },
  ];

  const moveStage = (leadId: string, direction: "prev" | "next") => {
    const stageOrder: LeadStage[] = [
      "NEW_INQUIRY",
      "REQUIREMENT_GATHERING",
      "QUOTATION_SENT",
      "NEGOTIATION",
      "WON",
    ];

    setLeads(prev =>
      prev.map(l => {
        if (l.id !== leadId) return l;
        const currentIdx = stageOrder.indexOf(l.stage);
        let targetIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
        if (targetIdx < 0 || targetIdx >= stageOrder.length) return l;
        return { ...l, stage: stageOrder[targetIdx], updatedAt: "Baru saja" };
      })
    );
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForActivity || !activityDesc.trim()) return;

    const newLog = {
      id: `act-${Date.now()}`,
      leadId: selectedLeadForActivity.id,
      authorName: "Rian Pratama (Sales)",
      type: activityType,
      description: activityDesc,
      createdAt: "Baru saja",
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.id !== selectedLeadForActivity.id) return l;
        return {
          ...l,
          activities: [newLog, ...l.activities],
          updatedAt: "Baru saja",
        };
      })
    );

    setActivityDesc("");
    setSelectedLeadForActivity(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & KPI Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-violet animate-pulse" />
            <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">
              PRD 3.3 — Customer Relationship Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Pipeline Penawaran & Prospek B2B (Kanban)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola tahapan negosiasi kontrak kain sublimasi, follow-up PIC garmen, dan pencatatan riwayat interaksi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Nilai Pipeline:</span>
            <span className="text-sm font-black text-accent-cyan font-mono">
              {formatRupiah(leads.reduce((sum, l) => sum + l.estimatedValue, 0))}
            </span>
          </div>
          <button
            onClick={() => setShowNewLeadModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const leadsInStage = leads.filter(l => l.stage === stage.key);
          const stageTotalValue = leadsInStage.reduce((acc, l) => acc + l.estimatedValue, 0);

          return (
            <div
              key={stage.key}
              className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[580px] ${stage.color} backdrop-blur-md`}
            >
              <div>
                
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {stage.label}
                    </h3>
                    <div className="text-[10px] font-mono text-accent-cyan font-bold mt-0.5">
                      {formatRupiah(stageTotalValue)}
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                    {leadsInStage.length}
                  </span>
                </div>

                {/* Cards in this stage */}
                <div className="space-y-3">
                  {leadsInStage.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-md space-y-2.5 transition-all text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block text-[13px] leading-tight">
                          {lead.companyName}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          PIC: {lead.contactPerson}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="text-slate-300 font-medium truncate">
                          {lead.fabricInterest}
                        </div>
                        <div className="flex justify-between font-mono text-slate-400">
                          <span>{formatNumber(lead.estimatedMeters)} m</span>
                          <span className="font-bold text-accent-cyan">{formatRupiah(lead.estimatedValue)}</span>
                        </div>
                      </div>

                      {/* Last Activity Preview */}
                      {lead.activities.length > 0 && (
                        <div className="text-[10px] text-slate-400 line-clamp-2 bg-slate-800/50 p-1.5 rounded">
                          <strong className="text-slate-300">Catatan: </strong>
                          {lead.activities[0].description}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForActivity(lead)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Aktivitas ({lead.activities.length})</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {stage.key !== "NEW_INQUIRY" && (
                            <button
                              onClick={() => moveStage(lead.id, "prev")}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                              title="Pindah ke tahap sebelumnya"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {stage.key !== "WON" && (
                            <button
                              onClick={() => moveStage(lead.id, "next")}
                              className="p-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold"
                              title="Pindah ke tahap berikutnya"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}

                  {leadsInStage.length === 0 && (
                    <div className="text-center py-10 text-[11px] text-slate-500 italic">
                      Tidak ada deal di tahap ini
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] text-slate-500 text-center">
                Pembaruan terinkronisasi
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Activity & Follow-up Log for Sales Rep */}
      {selectedLeadForActivity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl bg-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Log Riwayat & Follow-up CRM</h3>
                <p className="text-xs text-slate-400">{selectedLeadForActivity.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedLeadForActivity(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Previous Activities */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {selectedLeadForActivity.activities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-accent-cyan uppercase">{act.type.replace("_", " ")}</span>
                    <span>{act.createdAt}</span>
                  </div>
                  <p className="text-slate-200">{act.description}</p>
                </div>
              ))}

              {selectedLeadForActivity.activities.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  Belum ada log komunikasi tercatat.
                </div>
              )}
            </div>

            {/* Form to add new activity */}
            <form onSubmit={handleAddActivity} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <label className="font-bold text-slate-300 block">Tambah Catatan Interaksi Baru:</label>
              
              <div className="flex gap-2">
                {[
                  { key: "PHONE_CALL", label: "Telepon" },
                  { key: "WHATSAPP_MESSAGE", label: "WhatsApp" },
                  { key: "SAMPLE_FABRIC_SENT", label: "Kirim Sampel" },
                  { key: "MEETING", label: "Meeting" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActivityType(item.key as ActivityType)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      activityType === item.key ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                required
                placeholder="Tuliskan hasil pembicaraan, respon klien terhadap sampel kain, atau kesepakatan harga..."
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForActivity(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Simpan Log Aktivitas
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Tambah Lead Baru (termasuk dari Social Listening) */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Tambah Lead Prospek Baru</h3>
                <p className="text-xs text-slate-400">Lead akan masuk ke tahap Inkuiri Baru di kanban</p>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Perusahaan / Akun</label>
                <input
                  required
                  value={newLeadForm.companyName}
                  onChange={(e) => setNewLeadForm((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Contoh: PT. Apparel Prima / @username"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">PIC / Kontak Person</label>
                <input
                  value={newLeadForm.contactPerson}
                  onChange={(e) => setNewLeadForm((p) => ({ ...p, contactPerson: e.target.value }))}
                  placeholder="Contoh: Dimas Anggara / @username"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Kebutuhan / Catatan Prospek</label>
                <textarea
                  required
                  rows={2}
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: Cari kain dryfit 500 meter untuk jersey tim..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Minat Kain</label>
                  <input
                    value={newLeadForm.fabricInterest}
                    onChange={(e) => setNewLeadForm((p) => ({ ...p, fabricInterest: e.target.value }))}
                    placeholder="Contoh: Dryfit Milano 135 GSM"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Estimasi Meter</label>
                  <input
                    type="number"
                    min={0}
                    value={newLeadForm.estimatedMeters || ""}
                    onChange={(e) => setNewLeadForm((p) => ({ ...p, estimatedMeters: Number(e.target.value) }))}
                    placeholder="Contoh: 500"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Simpan Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
