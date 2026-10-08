"use client";

import Link from "next/link";
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
  MessageCircle,
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
  X,
  Printer,
  ShieldCheck,
  Send,
  FileCheck,
  Download,
  Percent,
  Check,
  Copy,
  Info
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

  // State untuk Modal Penawaran (SPH / Quotation)
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationTab, setQuotationTab] = useState<"form" | "preview">("form");
  const [quotationForm, setQuotationForm] = useState({
    leadId: "",
    quotationNumber: "SPH/TXR/2026/10-742",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    validUntil: "14 Hari Kalender dari Tanggal Terbit",
    companyName: "PT. Intech Mitra Abadi",
    contactPerson: "Ir. Bambang Trihatmojo",
    email: "procurement@intechmitra.co.id",
    phone: "+6281280212068",
    address: "Kawasan Industri MM2100, Cikarang Barat, Bekasi",
    fabricName: "Dryfit Milano 135 GSM (Sublimation Ready)",
    fabricWidth: "60 inch (152 cm)",
    meters: 1500,
    pricePerMeter: 32000,
    discountPercent: 0,
    includeTax: true,
    paymentTerm: "Tempo 30 Hari (TOP 30)",
    productionLeadTime: "3 - 5 Hari Kerja setelah PO & ACC Lab Dip",
    deliveryPoint: "FOB Gudang Texora Cikarang / Dikirim ke Lokasi Buyer",
    notes: "Harga sudah termasuk packing double plastic polybag per roll (50-60m). Bebas cacat weaving & dyeing standar ISO 105.",
  });

  // State untuk Modal Kontrak Penjualan B2B
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractTab, setContractTab] = useState<"form" | "preview">("form");
  const [contractForm, setContractForm] = useState({
    leadId: "",
    contractNumber: "KTR/TXR-B2B/2026/10-188",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    partyOneCompany: "PT. TEXORA VISI PRIMA",
    partyOneRep: "Hendra Wijaya, S.T.",
    partyOneRole: "Direktur Komersial & Operasional B2B",
    partyTwoCompany: "PT. Intech Mitra Abadi",
    partyTwoRep: "Ir. Bambang Trihatmojo",
    partyTwoRole: "Direktur Pengadaan / Kuasa Pengadaan",
    partyTwoAddress: "Kawasan Industri MM2100 Blok C-4, Cikarang Barat",
    fabricName: "Dryfit Milano 135 GSM (Sublimation Ready)",
    totalMeters: 1500,
    pricePerMeter: 32000,
    totalValue: 48000000,
    deliverySchedule: "Bertahap 3x Pengiriman (500 meter per tahap) dari Pabrik Texora",
    paymentTerms: "DP 30% saat kontrak ditandatangani, Pelunasan termin TOP 30 hari via Transfer BCA",
    bankAccount: "BCA No. Rek. 128-300-8899 a.n PT TEXORA VISI PRIMA (KCP Cikarang)",
    penaltyClause: "0.1% per hari keterlambatan pengiriman / pembayaran maksimal 5%",
    qualityStandard: "Grade A Tekstil Ekspor, Toleransi susut maksimal 2.5%, garansi retur roll cacat dalam 7 hari kerja",
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

  // Helper untuk membuka modal Penawaran (SPH)
  const openQuotationModalForLead = (lead: Lead) => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const unitPrice = lead.estimatedMeters > 0 
      ? Math.round(lead.estimatedValue / lead.estimatedMeters) 
      : 32000;

    setQuotationForm({
      leadId: lead.id,
      quotationNumber: `SPH/TXR/2026/10-${randomCode}`,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      validUntil: "14 Hari Kalender dari Tanggal Terbit",
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email || "procurement@" + lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".co.id",
      phone: lead.phone || "+628123456789",
      address: "Sentra Garmen & Tekstil, Indonesia",
      fabricName: lead.fabricInterest || "Kain Dryfit Milano 135 GSM",
      fabricWidth: "60 inch (152 cm)",
      meters: lead.estimatedMeters || 1000,
      pricePerMeter: unitPrice,
      discountPercent: 0,
      includeTax: true,
      paymentTerm: "Tempo 30 Hari (TOP 30)",
      productionLeadTime: "3 - 5 Hari Kerja setelah PO & ACC Lab Dip",
      deliveryPoint: "FOB Gudang Texora Cikarang / Dikirim ke Buyer",
      notes: "Harga sudah termasuk packing double wrap polybag. Bebas cacat weaving & dyeing standar ISO 105.",
    });
    setQuotationTab("form");
    setShowQuotationModal(true);
  };

  // Helper untuk membuka modal Kontrak Penjualan B2B
  const openContractModalForLead = (lead: Lead) => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const unitPrice = lead.estimatedMeters > 0 
      ? Math.round(lead.estimatedValue / lead.estimatedMeters) 
      : 32000;
    const totalVal = lead.estimatedValue || (lead.estimatedMeters * unitPrice);

    setContractForm({
      leadId: lead.id,
      contractNumber: `KTR/TXR-B2B/2026/10-${randomCode}`,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      partyOneCompany: "PT. TEXORA VISI PRIMA",
      partyOneRep: "Hendra Wijaya, S.T.",
      partyOneRole: "Direktur Komersial & Operasional B2B",
      partyTwoCompany: lead.companyName,
      partyTwoRep: lead.contactPerson,
      partyTwoRole: "Direktur Pengadaan / Kuasa Pembelian",
      partyTwoAddress: "Sentra Produksi Garmen, Jawa Barat",
      fabricName: lead.fabricInterest || "Kain Dryfit Milano 135 GSM",
      totalMeters: lead.estimatedMeters || 1000,
      pricePerMeter: unitPrice,
      totalValue: totalVal,
      deliverySchedule: "Bertahap sesuai jadwal produksi buyer dari Gudang Texora Cikarang",
      paymentTerms: "DP 30% saat kontrak ditandatangani, Pelunasan termin TOP 30 hari via Transfer BCA",
      bankAccount: "BCA No. Rek. 128-300-8899 a.n PT TEXORA VISI PRIMA (KCP Cikarang)",
      penaltyClause: "0.1% per hari keterlambatan pengiriman / pembayaran maksimal 5%",
      qualityStandard: "Grade A Tekstil Ekspor, Toleransi susut maksimal 2.5%, garansi ganti roll cacat dalam 7 hari",
    });
    setContractTab("form");
    setShowContractModal(true);
  };

  // Hitung total SPH
  const quotSubtotal = quotationForm.meters * quotationForm.pricePerMeter;
  const quotDiscountAmount = (quotSubtotal * quotationForm.discountPercent) / 100;
  const quotAfterDiscount = quotSubtotal - quotDiscountAmount;
  const quotTaxAmount = quotationForm.includeTax ? quotAfterDiscount * 0.11 : 0;
  const quotGrandTotal = quotAfterDiscount + quotTaxAmount;

  // Aksi Terbitkan SPH & Update Stage Lead ke QUOTATION_SENT
  const handlePublishQuotation = () => {
    if (!quotationForm.leadId) {
      setShowQuotationModal(false);
      return;
    }

    const logEntry = {
      id: `act-${Date.now()}`,
      leadId: quotationForm.leadId,
      authorName: "Sales Department",
      type: "EMAIL" as ActivityType,
      description: `Surat Penawaran Harga (SPH) #${quotationForm.quotationNumber} diterbitkan untuk ${quotationForm.meters}m kain senilai ${formatRupiah(quotGrandTotal)}. Masa berlaku: ${quotationForm.validUntil}.`,
      createdAt: "Baru saja",
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.id !== quotationForm.leadId) return l;
        return {
          ...l,
          stage: "QUOTATION_SENT" as LeadStage,
          estimatedValue: quotGrandTotal,
          estimatedMeters: quotationForm.meters,
          fabricInterest: quotationForm.fabricName,
          activities: [logEntry, ...l.activities],
          updatedAt: "Baru saja",
        };
      })
    );

    alert(`✅ Penawaran SPH #${quotationForm.quotationNumber} berhasil diterbitkan!\nPipeline otomatis dipindahkan ke status: Penawaran Terkirim.`);
    setShowQuotationModal(false);
  };

  // Aksi Finalisasi Kontrak & Auto-Win (WON)
  const handleFinalizeContract = () => {
    if (!contractForm.leadId) {
      setShowContractModal(false);
      return;
    }

    const logEntry = {
      id: `act-${Date.now()}`,
      leadId: contractForm.leadId,
      authorName: "Legal & Commercial Sales",
      type: "MEETING" as ActivityType,
      description: `Kontrak Penjualan Resmi #${contractForm.contractNumber} telah ditandatangani oleh Para Pihak (${contractForm.partyTwoCompany}). Nilai kontrak: ${formatRupiah(contractForm.totalValue)}. Status Deal: WON (Closing Menang).`,
      createdAt: "Baru saja",
    };

    setLeads(prev =>
      prev.map(l => {
        if (l.id !== contractForm.leadId) return l;
        return {
          ...l,
          stage: "WON" as LeadStage,
          estimatedValue: contractForm.totalValue,
          estimatedMeters: contractForm.totalMeters,
          fabricInterest: contractForm.fabricName,
          activities: [logEntry, ...l.activities],
          updatedAt: "Baru saja",
        };
      })
    );

    alert(`🏆 SELAMAT! Kontrak #${contractForm.contractNumber} resmi disepakati!\nLead "${contractForm.partyTwoCompany}" telah dipindahkan ke tahap WON (Closing Menang)!`);
    setShowContractModal(false);
  };

  // Print function
  const handlePrintDocument = () => {
    window.print();
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
            Kelola tahapan negosiasi, penerbitan Surat Penawaran Harga (SPH), dan Perjanjian Kontrak Jual Beli Tekstil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Nilai Pipeline:</span>
            <span className="text-sm font-black text-accent-cyan font-mono">
              {formatRupiah(leads.reduce((sum, l) => sum + l.estimatedValue, 0))}
            </span>
          </div>

          <button
            onClick={() => {
              if (leads.length > 0) openQuotationModalForLead(leads[0]);
              else setShowQuotationModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>+ Buat Penawaran (SPH)</span>
          </button>

          <button
            onClick={() => {
              if (leads.length > 0) openContractModalForLead(leads[0]);
              else setShowContractModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>+ Buat Kontrak B2B</span>
          </button>

          <button
            onClick={() => setShowNewLeadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lead</span>
          </button>
        </div>
      </div>

      {/* Omnichannel CRM Quick Hub */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
          <span className="text-slate-300 font-semibold">Saluran Komunikasi & Dokumen B2B:</span>
          <span className="text-slate-500 hidden sm:inline">• WhatsApp Gateway, Webmail Sales, SPH & Kontrak Digital</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/crm/inbox"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp CRM</span>
          </Link>

          <Link
            href="/portal/crm/webmail"
            className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-brand-400" />
            <span>Webmail Sales & SPH</span>
          </Link>

          <Link
            href="/portal/crm/customers"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Database 360°</span>
          </Link>
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

                      {/* Action Bar with SPH and Contract Shortcuts */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForActivity(lead)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                            title="Buka & Tambah Log Aktivitas"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Log</span>
                          </button>

                          {/* Tombol Buat Penawaran (SPH) */}
                          <button
                            type="button"
                            onClick={() => openQuotationModalForLead(lead)}
                            className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 font-semibold"
                            title={`Buat Surat Penawaran Harga (SPH) untuk ${lead.companyName}`}
                          >
                            <FileText className="w-3 h-3 text-cyan-400" />
                            <span>SPH</span>
                          </button>

                          {/* Tombol Buat Kontrak B2B */}
                          <button
                            type="button"
                            onClick={() => openContractModalForLead(lead)}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1 font-semibold"
                            title={`Buat Kontrak Perjanjian Jual Beli untuk ${lead.companyName}`}
                          >
                            <FileCheck className="w-3 h-3 text-emerald-400" />
                            <span>KTR</span>
                          </button>

                          <Link
                            href="/portal/crm/inbox"
                            className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title={`Chat WhatsApp dengan ${lead.contactPerson || lead.companyName}`}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Link>

                          <Link
                            href="/portal/crm/webmail"
                            className="p-1 rounded bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 transition-colors"
                            title={`Kirim Webmail / SPH ke ${lead.email || lead.companyName}`}
                          >
                            <Mail className="w-3 h-3" />
                          </Link>
                        </div>

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

      {/* ========================================================================= */}
      {/* MODAL 1: SURAT PENAWARAN HARGA (SPH / QUOTATION) */}
      {/* ========================================================================= */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-panel border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Surat Penawaran Harga (SPH Resmi)
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {quotationForm.quotationNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Prospek: <strong className="text-slate-200">{quotationForm.companyName}</strong> (PIC: {quotationForm.contactPerson})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setQuotationTab("form")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      quotationTab === "form" ? "bg-brand-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Formulir Edit
                  </button>
                  <button
                    onClick={() => setQuotationTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      quotationTab === "preview" ? "bg-brand-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dokumen Resmi (A4)
                  </button>
                </div>

                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {quotationTab === "form" ? (
                /* FORM EDIT PENAWARAN */
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Nomor SPH Resmi</label>
                      <input
                        value={quotationForm.quotationNumber}
                        onChange={(e) => setQuotationForm(p => ({ ...p, quotationNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Tanggal Dokumen</label>
                      <input
                        value={quotationForm.date}
                        onChange={(e) => setQuotationForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Masa Berlaku Penawaran</label>
                      <input
                        value={quotationForm.validUntil}
                        onChange={(e) => setQuotationForm(p => ({ ...p, validUntil: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-cyan-400">
                        <Building2 className="w-4 h-4" /> Data Pelanggan / Buyer B2B
                      </h4>
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Nama Perusahaan / Garmen</label>
                        <input
                          value={quotationForm.companyName}
                          onChange={(e) => setQuotationForm(p => ({ ...p, companyName: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">PIC Kontak</label>
                          <input
                            value={quotationForm.contactPerson}
                            onChange={(e) => setQuotationForm(p => ({ ...p, contactPerson: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">No. WhatsApp / HP</label>
                          <input
                            value={quotationForm.phone}
                            onChange={(e) => setQuotationForm(p => ({ ...p, phone: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Email PIC</label>
                        <input
                          value={quotationForm.email}
                          onChange={(e) => setQuotationForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Alamat Pabrik / Pengiriman</label>
                        <input
                          value={quotationForm.address}
                          onChange={(e) => setQuotationForm(p => ({ ...p, address: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-accent-cyan">
                        <DollarSign className="w-4 h-4" /> Rincian Kain & Penawaran Harga
                      </h4>
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Jenis Kain & Spesifikasi</label>
                        <input
                          value={quotationForm.fabricName}
                          onChange={(e) => setQuotationForm(p => ({ ...p, fabricName: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Volume (Meter)</label>
                          <input
                            type="number"
                            value={quotationForm.meters}
                            onChange={(e) => setQuotationForm(p => ({ ...p, meters: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Harga Satuan (Rp/meter)</label>
                          <input
                            type="number"
                            value={quotationForm.pricePerMeter}
                            onChange={(e) => setQuotationForm(p => ({ ...p, pricePerMeter: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Diskon Khusus B2B (%)</label>
                          <input
                            type="number"
                            value={quotationForm.discountPercent}
                            onChange={(e) => setQuotationForm(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id="taxToggle"
                            checked={quotationForm.includeTax}
                            onChange={(e) => setQuotationForm(p => ({ ...p, includeTax: e.target.checked }))}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                          />
                          <label htmlFor="taxToggle" className="text-slate-300 font-semibold cursor-pointer">
                            Termasuk PPN 11%
                          </label>
                        </div>
                      </div>

                      {/* Kalkulasi Ringkas */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal:</span>
                          <span>{formatRupiah(quotSubtotal)}</span>
                        </div>
                        {quotationForm.discountPercent > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Diskon ({quotationForm.discountPercent}%):</span>
                            <span>-{formatRupiah(quotDiscountAmount)}</span>
                          </div>
                        )}
                        {quotationForm.includeTax && (
                          <div className="flex justify-between text-slate-400">
                            <span>PPN 11%:</span>
                            <span>+{formatRupiah(quotTaxAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-slate-800">
                          <span>Total Penawaran:</span>
                          <span className="text-accent-cyan">{formatRupiah(quotGrandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Syarat & Ketentuan Tekstil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Term of Payment (Syarat Pembayaran)</label>
                      <select
                        value={quotationForm.paymentTerm}
                        onChange={(e) => setQuotationForm(p => ({ ...p, paymentTerm: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="Tempo 30 Hari (TOP 30)">Tempo 30 Hari (TOP 30) - B2B Term</option>
                        <option value="DP 50%, Pelunasan Sebelum Kirim">DP 50%, Pelunasan Sebelum Kirim</option>
                        <option value="Cash Before Delivery (CBD)">Cash Before Delivery (CBD)</option>
                        <option value="SKBDN / Letter of Credit (L/C)">SKBDN / Letter of Credit (L/C)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Lead Time Produksi / Pengiriman</label>
                      <input
                        value={quotationForm.productionLeadTime}
                        onChange={(e) => setQuotationForm(p => ({ ...p, productionLeadTime: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-slate-400 block mb-1 font-semibold">Catatan Kualitas & Jaminan Tekstil</label>
                      <textarea
                        rows={2}
                        value={quotationForm.notes}
                        onChange={(e) => setQuotationForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* PREVIEW DOKUMEN RESMI A4 SIAP CETAK */
                <div id="quotation-print-area" className="p-8 bg-white text-slate-900 rounded-xl shadow-lg font-sans text-xs space-y-6">
                  {/* Kop Surat Texora */}
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <img 
                          src="/icons/texora-logo.png" 
                          alt="PT. Texora Visi Prima" 
                          className="h-11 w-auto object-contain" 
                        />
                        <div>
                          <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">PT. TEXORA VISI PRIMA</h2>
                          <p className="text-[10px] text-slate-600 font-medium">Textile Manufacturer, Dyeing, Finishing & Sublimation Specialist</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">
                        Jl. Walang Baru VI Blok B1/2, RT 04 / RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara<br/>
                        Telp: +62 21-8983-TEXORA | Email: sales@texora.co.id | Website: www.texora.co.id
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded bg-slate-100 font-bold text-slate-800 text-[11px] border border-slate-300">
                        SURAT PENAWARAN HARGA (SPH)
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-slate-700 space-y-0.5">
                        <div><strong>No:</strong> {quotationForm.quotationNumber}</div>
                        <div><strong>Tanggal:</strong> {quotationForm.date}</div>
                        <div><strong>Berlaku:</strong> {quotationForm.validUntil}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ditujukan Kepada */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Kepada Yth:</span>
                      <strong className="text-slate-900 text-sm block">{quotationForm.companyName}</strong>
                      <div className="text-slate-700 mt-0.5">
                        Attn: {quotationForm.contactPerson}<br/>
                        Alamat: {quotationForm.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Kontak PIC Buyer:</span>
                      <div className="text-slate-700 mt-0.5">
                        Email: {quotationForm.email}<br/>
                        No. HP/WA: {quotationForm.phone}
                      </div>
                    </div>
                  </div>

                  {/* Kata Pengantar */}
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Dengan hormat,<br/>
                    Menindaklanjuti permintaan kebutuhan kain sublimasi dan garmen, perkenankan kami dari <strong>PT. Texora Visi Prima</strong> mengajukan surat penawaran harga terbaik dengan rincian spesifikasi sebagai berikut:
                  </p>

                  {/* Tabel Barang */}
                  <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-2 border-r border-slate-300">Deskripsi & Spesifikasi Produk</th>
                        <th className="p-2 border-r border-slate-300 w-24 text-center">Lebar</th>
                        <th className="p-2 border-r border-slate-300 w-24 text-right">Volume</th>
                        <th className="p-2 border-r border-slate-300 w-28 text-right">Harga (Rp/m)</th>
                        <th className="p-2 text-right w-32">Total (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 text-center">1</td>
                        <td className="p-2 border-r border-slate-300">
                          <strong className="text-slate-900 block">{quotationForm.fabricName}</strong>
                          <span className="text-[10px] text-slate-500">Grade A Tekstil Ekspor • Siap Cetak Sublimasi Cepat Kering (Quick-Dry)</span>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">{quotationForm.fabricWidth}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-semibold">{formatNumber(quotationForm.meters)} m</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">{formatRupiah(quotationForm.pricePerMeter)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatRupiah(quotSubtotal)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      {quotationForm.discountPercent > 0 && (
                        <tr className="border-b border-slate-200 text-emerald-700 bg-emerald-50/50">
                          <td colSpan={5} className="p-2 text-right font-semibold">Diskon Volume B2B ({quotationForm.discountPercent}%):</td>
                          <td className="p-2 text-right font-mono font-bold">-{formatRupiah(quotDiscountAmount)}</td>
                        </tr>
                      )}
                      {quotationForm.includeTax && (
                        <tr className="border-b border-slate-200 text-slate-700 bg-slate-50/50">
                          <td colSpan={5} className="p-2 text-right font-semibold">PPN 11% (Faktur Pajak CoreTax):</td>
                          <td className="p-2 text-right font-mono font-bold">+{formatRupiah(quotTaxAmount)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100 text-slate-900 text-xs font-black">
                        <td colSpan={5} className="p-2.5 text-right uppercase">Total Penawaran Resmi:</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700">{formatRupiah(quotGrandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Syarat & Ketentuan Penawaran */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-[10px] text-slate-700">
                    <strong className="text-slate-900 block text-[11px]">Syarat & Ketentuan Penawaran:</strong>
                    <div>1. <strong>Syarat Pembayaran:</strong> {quotationForm.paymentTerm}.</div>
                    <div>2. <strong>Lead Time Produksi:</strong> {quotationForm.productionLeadTime}.</div>
                    <div>3. <strong>Pengiriman:</strong> {quotationForm.deliveryPoint}.</div>
                    <div>4. <strong>Garansi Kualitas:</strong> {quotationForm.notes}</div>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-2 pt-6 text-[11px]">
                    <div>
                      <p className="text-slate-600">Disetujui Oleh (Buyer),</p>
                      <strong className="block text-slate-900 mt-0.5">{quotationForm.companyName}</strong>
                      <div className="h-16 flex items-end">
                        <div className="border-b border-slate-400 w-48 text-center pb-1 text-slate-400 italic">
                          (Materai & Tanda Tangan)
                        </div>
                      </div>
                      <p className="mt-1 text-slate-800 font-bold">{quotationForm.contactPerson}</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <p className="text-slate-600">Hormat Kami,</p>
                      <strong className="block text-slate-900 mt-0.5">PT. TEXORA VISI PRIMA</strong>
                      <div className="h-16 flex items-center justify-end pr-8">
                        <div className="px-3 py-1 rounded border-2 border-emerald-600 text-emerald-700 font-black text-[10px] uppercase tracking-wider transform -rotate-6">
                          TEXORA COMMERCIAL
                        </div>
                      </div>
                      <p className="mt-1 text-slate-800 font-bold">Hendra Wijaya, S.T.</p>
                      <span className="text-[10px] text-slate-500">Commercial & Sales Director</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Setelah diterbitkan, lead otomatis masuk ke status <strong>Penawaran Terkirim</strong>.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Cetak / PDF</span>
                </button>

                <Link
                  href="/portal/crm/webmail"
                  className="px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-4 h-4 text-brand-400" />
                  <span>Kirim via Webmail</span>
                </Link>

                <Link
                  href="/portal/crm/inbox"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Kirim Ringkasan WA</span>
                </Link>

                <button
                  type="button"
                  onClick={handlePublishQuotation}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Terbitkan & Pindah Stage</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PERJANJIAN KONTRAK JUAL BELI B2B (SALES CONTRACT) */}
      {/* ========================================================================= */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-panel border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Kontrak Perjanjian Jual Beli Tekstil (B2B Contract)
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {contractForm.contractNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pihak Pembeli: <strong className="text-slate-200">{contractForm.partyTwoCompany}</strong> (Nilai: {formatRupiah(contractForm.totalValue)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setContractTab("form")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      contractTab === "form" ? "bg-brand-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Formulir Klausul
                  </button>
                  <button
                    onClick={() => setContractTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      contractTab === "preview" ? "bg-brand-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Naskah Perjanjian (A4)
                  </button>
                </div>

                <button
                  onClick={() => setShowContractModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {contractTab === "form" ? (
                /* FORM EDIT KONTRAK */
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Nomor Registrasi Kontrak</label>
                      <input
                        value={contractForm.contractNumber}
                        onChange={(e) => setContractForm(p => ({ ...p, contractNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Tanggal Efektif Kontrak</label>
                      <input
                        value={contractForm.date}
                        onChange={(e) => setContractForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Para Pihak */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> Pihak Pertama (Penjual / Produsen)
                      </h4>
                      <div>
                        <label className="text-slate-400 block mb-1">Nama Perusahaan</label>
                        <input
                          disabled
                          value={contractForm.partyOneCompany}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 font-semibold cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Perwakilan / Pejabat Penandatangan</label>
                        <input
                          value={contractForm.partyOneRep}
                          onChange={(e) => setContractForm(p => ({ ...p, partyOneRep: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Jabatan</label>
                        <input
                          value={contractForm.partyOneRole}
                          onChange={(e) => setContractForm(p => ({ ...p, partyOneRole: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-accent-cyan">
                        <Building2 className="w-4 h-4" /> Pihak Kedua (Pembeli / Garmen Buyer)
                      </h4>
                      <div>
                        <label className="text-slate-400 block mb-1">Nama Perusahaan Pembeli</label>
                        <input
                          value={contractForm.partyTwoCompany}
                          onChange={(e) => setContractForm(p => ({ ...p, partyTwoCompany: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1">Wakil Penandatangan</label>
                          <input
                            value={contractForm.partyTwoRep}
                            onChange={(e) => setContractForm(p => ({ ...p, partyTwoRep: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Jabatan</label>
                          <input
                            value={contractForm.partyTwoRole}
                            onChange={(e) => setContractForm(p => ({ ...p, partyTwoRole: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Domisili Hukum / Alamat</label>
                        <input
                          value={contractForm.partyTwoAddress}
                          onChange={(e) => setContractForm(p => ({ ...p, partyTwoAddress: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objek Perjanjian & Nilai */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Objek Kain Tekstil</label>
                      <input
                        value={contractForm.fabricName}
                        onChange={(e) => setContractForm(p => ({ ...p, fabricName: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Total Volume Kontrak (Meter)</label>
                      <input
                        type="number"
                        value={contractForm.totalMeters}
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          setContractForm(p => ({ ...p, totalMeters: m, totalValue: m * p.pricePerMeter }));
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Total Nilai Kontrak (Rp)</label>
                      <input
                        type="number"
                        value={contractForm.totalValue}
                        onChange={(e) => setContractForm(p => ({ ...p, totalValue: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-accent-cyan"
                      />
                    </div>
                  </div>

                  {/* Klausul Legal Tekstil */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Jadwal Pengiriman (Pasal 2)</label>
                      <input
                        value={contractForm.deliverySchedule}
                        onChange={(e) => setContractForm(p => ({ ...p, deliverySchedule: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Termin & Cara Pembayaran (Pasal 3)</label>
                      <input
                        value={contractForm.paymentTerms}
                        onChange={(e) => setContractForm(p => ({ ...p, paymentTerms: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Standar Kualitas & Klaim Garansi Tekstil (Pasal 4)</label>
                      <input
                        value={contractForm.qualityStandard}
                        onChange={(e) => setContractForm(p => ({ ...p, qualityStandard: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* PREVIEW NASKAH PERJANJIAN HUKUM B2B */
                <div id="contract-print-area" className="p-8 bg-white text-slate-900 rounded-xl shadow-lg font-serif text-[11px] space-y-5 leading-relaxed">
                  
                  {/* Header Kontrak */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/icons/texora-logo.png" 
                        alt="PT. Texora Visi Prima" 
                        className="h-10 w-auto object-contain" 
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block font-sans">
                          PT. TEXORA VISI PRIMA
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">
                          Departemen Komersial & Legal Industri B2B
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase font-sans text-slate-950">
                        SURAT PERJANJIAN JUAL BELI TEKSTIL
                      </h2>
                      <p className="font-mono text-[10px] text-slate-700 mt-0.5">
                        Nomor: {contractForm.contractNumber}
                      </p>
                    </div>
                  </div>

                  {/* Pendahuluan */}
                  <p>
                    Pada hari ini, <strong>{contractForm.date}</strong>, telah dibuat dan ditandatangani Perjanjian Kerjasama Pengadaan Kain Tekstil (selanjutnya disebut "Perjanjian"), oleh dan antara:
                  </p>

                  <div className="space-y-3 pl-4">
                    <div>
                      <strong>1. {contractForm.partyOneCompany}</strong>, berkedudukan di Jl. Walang Baru VI Blok B1/2, RT 04 / RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara, dalam hal ini diwakili oleh <strong>{contractForm.partyOneRep}</strong>, bertindak dalam kapasitasnya sebagai {contractForm.partyOneRole}, selanjutnya disebut sebagai <strong>"PIHAK PERTAMA" (PENJUAL)</strong>.
                    </div>
                    <div>
                      <strong>2. {contractForm.partyTwoCompany}</strong>, berkedudukan di {contractForm.partyTwoAddress}, dalam hal ini diwakili oleh <strong>{contractForm.partyTwoRep}</strong>, bertindak dalam kapasitasnya sebagai {contractForm.partyTwoRole}, selanjutnya disebut sebagai <strong>"PIHAK KEDUA" (PEMBELI)</strong>.
                    </div>
                  </div>

                  <p>
                    PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama selanjutnya disebut sebagai "PARA PIHAK". PARA PIHAK sepakat untuk mengikatkan diri dalam Perjanjian ini dengan syarat-syarat dan ketentuan-ketentuan sebagai berikut:
                  </p>

                  {/* Pasal 1 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 1 — OBJEK PERJANJIAN & SPESIFIKASI</strong>
                    <p>
                      PIHAK PERTAMA setuju untuk memproduksi dan menjual, dan PIHAK KEDUA setuju untuk membeli produk tekstil berupa <strong>{contractForm.fabricName}</strong> dengan volume total sebanyak <strong>{formatNumber(contractForm.totalMeters)} meter</strong> dengan standar mutu Grade A ekspor industri tekstil.
                    </p>
                  </div>

                  {/* Pasal 2 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 2 — TOTAL NILAI KONTRAK & HARGA</strong>
                    <p>
                      Total nilai kontrak perjanjian ini adalah sebesar <strong>{formatRupiah(contractForm.totalValue)}</strong>. Harga bersifat mengikat dan tidak berubah selama periode pelaksanaan kontrak ini.
                    </p>
                  </div>

                  {/* Pasal 3 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 3 — JADWAL PENGIRIMAN & PENYERAHAN BARANG</strong>
                    <p>
                      Pengiriman objek kain tekstil dilakukan dengan ketentuan: <strong>{contractForm.deliverySchedule}</strong>. Penyerahan barang disertai dengan Surat Jalan resmi dan Berita Acara Serah Terima (BAST).
                    </p>
                  </div>

                  {/* Pasal 4 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 4 — TATA CARA PEMBAYARAN</strong>
                    <p>
                      Ketentuan pembayaran disepakati: <strong>{contractForm.paymentTerms}</strong>. Seluruh pembayaran wajib ditransfer secara sah ke rekening resmi PIHAK PERTAMA pada: <strong>{contractForm.bankAccount}</strong>.
                    </p>
                  </div>

                  {/* Pasal 5 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 5 — JAMINAN MUTU, KLAIM & RETUR</strong>
                    <p>
                      PIHAK PERTAMA menjamin bahwa: <strong>{contractForm.qualityStandard}</strong>. Apabila ditemukan cacat tenun/celup melebihi ambang batas toleransi, PIHAK PERTAMA berkewajiban mengganti roll kain baru tanpa biaya tambahan kepada PIHAK KEDUA.
                    </p>
                  </div>

                  {/* Pasal 6 */}
                  <div className="space-y-1">
                    <strong className="block font-sans text-slate-900 uppercase text-xs">PASAL 6 — PENYELESAIAN SENGKETA</strong>
                    <p>
                      Segala perselisihan yang timbul akan diselesaikan secara musyawarah untuk mufakat. Apabila tidak tercapai mufakat, PARA PIHAK sepakat memilih domisili hukum di Pengadilan Negeri Cikarang / Bekasi.
                    </p>
                  </div>

                  {/* Area Tanda Tangan */}
                  <div className="grid grid-cols-2 pt-6 font-sans text-[11px]">
                    <div>
                      <p className="text-slate-600 font-serif">PIHAK KEDUA (PEMBELI),</p>
                      <strong className="block text-slate-900 mt-0.5">{contractForm.partyTwoCompany}</strong>
                      
                      {/* Materai Placeholder */}
                      <div className="h-20 flex items-center pt-2">
                        <div className="w-20 h-14 border border-dashed border-red-400 bg-red-50 text-[9px] text-red-700 flex flex-col items-center justify-center font-mono">
                          <span>MATERAI</span>
                          <span className="font-bold">10.000</span>
                        </div>
                      </div>

                      <p className="mt-1 text-slate-900 font-bold">{contractForm.partyTwoRep}</p>
                      <span className="text-[10px] text-slate-500">{contractForm.partyTwoRole}</span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <p className="text-slate-600 font-serif">PIHAK PERTAMA (PENJUAL),</p>
                      <strong className="block text-slate-900 mt-0.5">{contractForm.partyOneCompany}</strong>
                      
                      <div className="h-20 flex items-center justify-end pr-6">
                        <div className="px-3 py-1 rounded border-2 border-emerald-700 text-emerald-800 font-black text-[10px] uppercase tracking-wider transform -rotate-3">
                          TEXORA LEGAL SEAL
                        </div>
                      </div>

                      <p className="mt-1 text-slate-900 font-bold">{contractForm.partyOneRep}</p>
                      <span className="text-[10px] text-slate-500">{contractForm.partyOneRole}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Finalisasi kontrak akan langsung memindahkan status lead menjadi <strong className="text-emerald-400">WON (Closing Menang)</strong>.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Cetak / PDF</span>
                </button>

                <Link
                  href="/portal/crm/webmail"
                  className="px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-4 h-4 text-brand-400" />
                  <span>Kirim Draft Webmail</span>
                </Link>

                <button
                  type="button"
                  onClick={handleFinalizeContract}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalisasi & Auto-Win (WON)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Activity & Follow-up Log for Sales Rep */}
      {selectedLeadForActivity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl bg-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Log Riwayat & Follow-up CRM</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-brand-400">{selectedLeadForActivity.companyName}</span>
                  <span className="text-[11px] text-slate-400">({selectedLeadForActivity.contactPerson})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lead = selectedLeadForActivity;
                    setSelectedLeadForActivity(null);
                    openQuotationModalForLead(lead);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  title="Buat SPH"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>SPH</span>
                </button>
                <Link
                  href="/portal/crm/inbox"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  title="Buka Chat WhatsApp"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp</span>
                </Link>
                <Link
                  href="/portal/crm/webmail"
                  className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  title="Kirim Webmail / SPH"
                >
                  <Mail className="w-3 h-3 text-brand-400" />
                  <span>Webmail</span>
                </Link>
                <button
                  onClick={() => setSelectedLeadForActivity(null)}
                  className="text-slate-400 hover:text-white p-1 ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
              
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "PHONE_CALL", label: "Telepon" },
                  { key: "WHATSAPP_MESSAGE", label: "WhatsApp" },
                  { key: "EMAIL", label: "Email / SPH" },
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
