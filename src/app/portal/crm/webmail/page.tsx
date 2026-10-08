"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Tag,
  Search,
  RefreshCw,
  Plus,
  Paperclip,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  MessageCircle,
  MoreVertical,
  Reply,
  ReplyAll,
  Forward,
  Sparkles,
  X,
  ChevronDown,
  Filter,
  Check,
  AlertCircle,
  Download,
  Eye,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  customerId?: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body: string;
  date: string;
  time: string;
  unread: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash" | "sph";
  tags: string[];
  attachments?: { name: string; size: string; type: string }[];
  replies?: {
    id: string;
    senderName: string;
    senderEmail: string;
    time: string;
    body: string;
  }[];
}

const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: "mail-1",
    senderName: "Bambang Sudiro",
    senderEmail: "procurement@intechmitra.co.id",
    senderCompany: "PT. Intech Mitra Abadi",
    customerId: "cust-5",
    to: ["sales@texora.co.id"],
    cc: ["finance@intechmitra.co.id"],
    subject: "Permohonan Surat Penawaran Resmi (SPH) — Kain Dryfit Milano 135 GSM 1.500m",
    snippet:
      "Yth. Tim Sales PT. Texora Visi Prima, Melalui email ini kami dari tim pengadaan PT. Intech Mitra Abadi mengajukan permintaan penawaran resmi...",
    body: `Yth. Tim Sales & Komersial PT. Texora Visi Prima,

Dengan hormat,

Menindaklanjuti komunikasi awal kami via WhatsApp, melalui email resmi ini PT. Intech Mitra Abadi bermaksud mengajukan permintaan Surat Penawaran Resmi (SPH) untuk kebutuhan repeat order kain:

1. Jenis Kain: Dryfit Milano (Polyester Microfiber)
2. Gramasi: 135 GSM, Lebar 160 cm
3. Volume Kebutuhan: 1.500 meter
4. Penggunaan: Jersey apparel korporat & running gear
5. Alamat Pengiriman: Plant Cikarang — Kawasan Industri Jababeka V, Cikarang Timur, Bekasi

Mohon informasi rincian:
- Penawaran harga per meter tier B2B (volume 1.500m)
- Kesanggupan jadwal pengiriman bertahap (per 500 meter)
- Term pembayaran TOP 30 hari via bank transfer
- Lampiran sertifikasi Oeko-Tex / Lab Dip jika tersedia

Terima kasih atas kerja samanya. Kami menantikan penawaran resmi dari pihak Texora.

Salam hormat,
Bambang Sudiro
Procurement & Supply Chain Lead
PT. Intech Mitra Abadi
Telp: (021) 8984-2068 | WhatsApp: +62 812-8021-2068`,
    date: "8 Okt 2026",
    time: "20:45",
    unread: true,
    starred: true,
    folder: "inbox",
    tags: ["B2B Tier", "SPH Request", "Intech Mitra"],
    attachments: [
      { name: "RFQ-Intech-DryfitMilano-1500m.pdf", size: "348 KB", type: "pdf" },
      { name: "Spesifikasi-Teknis-Garment.xlsx", size: "124 KB", type: "xlsx" },
    ],
    replies: [
      {
        id: "rep-1",
        senderName: "Dian Permata (Sales Rep Texora)",
        senderEmail: "sales@texora.co.id",
        time: "8 Okt 2026, 21:30",
        body: `Yth. Bapak Bambang Sudiro,

Terima kasih atas email dan rincian RFQ dari PT. Intech Mitra Abadi.
Kami konfirmasikan bahwa stok kain Dryfit Milano 135 GSM siap produksi pada batch minggu ini dengan kapasitas penuh.
Surat Penawaran Resmi (SPH) dengan harga tier B2B Rp 32.000/meter dan opsi pengiriman bertahap 3x 500m ke Plant Cikarang sedang kami siapkan dan kami lampirkan pada balasan ini.

Salam hangat,
Dian Permata — Account Executive PT. Texora Visi Prima`,
      },
    ],
  },
  {
    id: "mail-2",
    senderName: "Hendra Wijaya",
    senderEmail: "hendra@garmentkreatif.com",
    senderCompany: "CV. Sablon Juara Bandung",
    customerId: "cust-2",
    to: ["sales@texora.co.id"],
    subject: "Konfirmasi Approval Digital Proofing — Batch Jersey Trail 400 Pcs",
    snippet:
      "Halo Mbak Dian & Tim Texora, Mockup digital proofing warna neon cyan dan magenta sudah kami setujui bersama tim desainer...",
    body: `Halo Mbak Dian & Tim Texora,

Hasil digital proofing sublimasi untuk 400 pcs jersey trail (kain Serena Dryfit) sudah kami review bersama desainer kami.
Warna Neon Cyan dan Vivid Magenta di preview 3D WebGL sangat sesuai dengan ekspektasi client kami.

Kami memberikan persetujuan (Approved) untuk langsung dinaikkan ke mesin cetak sublimasi industri hari Jumat ini.

Mohon estimasi selesai cetak dan nomor resi pengiriman kargo ke Bandung jika sudah diserahkan ke ekspedisi.

Terima kasih,
Hendra Wijaya — Production Manager CV. Sablon Juara`,
    date: "8 Okt 2026",
    time: "18:12",
    unread: false,
    starred: true,
    folder: "inbox",
    tags: ["Digital Proof", "Sublimasi"],
    attachments: [
      { name: "Approved-Proof-Jersey-Trail-V3.pdf", size: "1.2 MB", type: "pdf" },
    ],
  },
  {
    id: "mail-3",
    senderName: "Finance & Tax Team",
    senderEmail: "tax@srirejekiteks.co.id",
    senderCompany: "PT. Sri Rejeki Tekstil",
    customerId: "cust-3",
    to: ["sales@texora.co.id", "accounting@texora.co.id"],
    subject: "Konfirmasi Faktur Pajak CoreTax PPN 11% — Invoice #INV-2026-089",
    snippet:
      "Yth. Bagian Keuangan PT. Texora Visi Prima, Kami telah menerima dokumen e-Faktur dan bukti potong CoreTax PPN untuk transaksi pembelian kain...",
    body: `Yth. Bagian Keuangan & Pajak PT. Texora Visi Prima,

Dengan ini kami konfirmasikan bahwa Faktur Pajak CoreTax PPN 11% untuk Invoice #INV-2026-089 (Transaksi 2.000 Meter Kain Parasut Taslan) telah berhasil kami validasi di sistem DJP CoreTax.

Pembayaran sisa termin kedua sebesar Rp 45.000.000 telah kami jadwalkan transfer pada hari Senin, 12 Oktober 2026.

Mohon konfirmasi bukti potong pajak terlampir.

Hormat kami,
Divisi Akuntansi & Pajak
PT. Sri Rejeki Tekstil`,
    date: "7 Okt 2026",
    time: "14:20",
    unread: false,
    starred: false,
    folder: "inbox",
    tags: ["CoreTax", "Invoice"],
    attachments: [
      { name: "BuktiPotong-DJP-INV089.pdf", size: "210 KB", type: "pdf" },
    ],
  },
  {
    id: "mail-4",
    senderName: "Mega Garment Nusantara",
    senderEmail: "purchasing@megagarment.id",
    senderCompany: "PT. Mega Garment Nusantara",
    customerId: "cust-4",
    to: ["sales@texora.co.id"],
    subject: "Inquiry Kebutuhan Kain Fleece Cotton 280 GSM untuk Hoodies Ekspor",
    snippet:
      "Selamat siang tim sales Texora, kami sedang mencari supplier kain fleece cotton 280 GSM tubular untuk kuota ekspor 5.000 pcs...",
    body: `Selamat siang Tim Sales PT. Texora Visi Prima,

Kami dari PT. Mega Garment Nusantara sedang membutuhkan supply kain Fleece Cotton 280 GSM dengan spesifikasi anti-pilling untuk project hoodie ekspor ke Korea Selatan sebanyak 5.000 pcs (estimasi 4.500 kg kain).

Apakah Texora menyediakan stok roll ready atau sistem PO celup warna khusus (Navy Blue & Charcoal Grey)?
Bisa tolong dikirimkan katalog warna, handfeel sample swatch, dan pricelist tiering-nya?

Salam,
Rini Wulandari
Senior Merchandiser — PT. Mega Garment Nusantara`,
    date: "6 Okt 2026",
    time: "11:05",
    unread: false,
    starred: false,
    folder: "inbox",
    tags: ["Inquiry Baru", "Ekspor"],
  },
  {
    id: "mail-5",
    senderName: "Dian Permata (Sales Texora)",
    senderEmail: "sales@texora.co.id",
    to: ["procurement@intechmitra.co.id"],
    subject: "Surat Penawaran Resmi (SPH) #SPH-2026-X102 — PT. Intech Mitra Abadi",
    snippet:
      "Yth. Bapak Bambang Sudiro, Terlampir kami sampaikan Surat Penawaran Resmi (SPH) untuk 1.500 meter Kain Dryfit Milano 135 GSM...",
    body: `Yth. Bapak Bambang Sudiro
PT. Intech Mitra Abadi

Terlampir kami sampaikan Surat Penawaran Resmi (SPH) #SPH-2026-X102 tertanggal 8 Oktober 2026 untuk kebutuhan kain Dryfit Milano 135 GSM sebanyak 1.500 meter.

Harga penawaran: Rp 32.000 / meter (Belum termasuk PPN 11%)
Term pembayaran: TOP 30 Hari
Delivery: Bertahap per 500 meter ke Plant Cikarang mulai batch Senin depan.

Silakan ditinjau dan ditandatangani untuk kami proses SPK produksinya.

Salam hormat,
Dian Permata
PT. Texora Visi Prima`,
    date: "8 Okt 2026",
    time: "21:40",
    unread: false,
    starred: true,
    folder: "sent",
    tags: ["SPH Resmi", "Intech Mitra"],
    attachments: [
      { name: "SPH-2026-X102-Intech-Dryfit.pdf", size: "520 KB", type: "pdf" },
    ],
  },
];

export default function WebmailCrmPage() {
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS);
  const [activeFolder, setActiveFolder] = useState<"inbox" | "sent" | "drafts" | "starred" | "sph" | "trash">("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("mail-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Compose Modal state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      // Folder filter
      if (activeFolder === "starred") {
        if (!mail.starred) return false;
      } else if (activeFolder === "sph") {
        if (!mail.tags.some((t) => t.toLowerCase().includes("sph"))) return false;
      } else {
        if (mail.folder !== activeFolder) return false;
      }

      // Tag filter
      if (filterTag !== "ALL") {
        if (filterTag === "UNREAD" && !mail.unread) return false;
        if (filterTag === "ATTACHMENTS" && (!mail.attachments || mail.attachments.length === 0)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = mail.subject.toLowerCase().includes(q);
        const matchSender = mail.senderName.toLowerCase().includes(q) || mail.senderEmail.toLowerCase().includes(q);
        const matchCompany = mail.senderCompany?.toLowerCase().includes(q) || false;
        const matchBody = mail.body.toLowerCase().includes(q);
        if (!matchSubject && !matchSender && !matchCompany && !matchBody) return false;
      }

      return true;
    });
  }, [emails, activeFolder, filterTag, searchQuery]);

  const selectedEmail = useMemo(() => {
    return emails.find((m) => m.id === selectedEmailId) || filteredEmails[0] || null;
  }, [emails, selectedEmailId, filteredEmails]);

  // Handle Mark as Read / Toggle Star
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  const handleSelectEmail = (mail: EmailMessage) => {
    setSelectedEmailId(mail.id);
    if (mail.unread) {
      setEmails((prev) =>
        prev.map((m) => (m.id === mail.id ? { ...m, unread: false } : m))
      );
    }
  };

  const handleDeleteEmail = (id: string) => {
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: "trash" } : m))
    );
    showToast("Email berhasil dipindahkan ke Sampah.");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Kotak surat tersinkronisasi dengan server IMAP/SMTP Texora.");
    }, 800);
  };

  // Submit quick reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      senderName: "Dian Permata (Sales Rep Texora)",
      senderEmail: "sales@texora.co.id",
      time: "Baru saja",
      body: replyText.trim(),
    };

    setEmails((prev) =>
      prev.map((m) =>
        m.id === selectedEmail.id
          ? {
              ...m,
              replies: [...(m.replies || []), newReply],
            }
          : m
      )
    );

    setReplyText("");
    setIsReplying(false);
    showToast(`Balasan berhasil dikirim ke ${selectedEmail.senderEmail}`);
  };

  // AI draft generator
  const handleGenerateAIReply = () => {
    if (!selectedEmail) return;
    const aiText = `Yth. ${selectedEmail.senderName},

Terima kasih banyak atas email Anda mengenai ${selectedEmail.subject}.

Kami telah meninjau kebutuhan Bapak/Ibu dan mengonfirmasikan bahwa spesifikasi kain serta volume yang diminta siap diproses oleh lini produksi PT. Texora Visi Prima.
Surat Penawaran Resmi (SPH) dengan harga tiering terbaik serta draft jadwal pengiriman telah kami siapkan.

Apakah ada waktu yang nyaman besok pagi untuk diskusi teknis singkat via telepon atau WhatsApp (+62 852-8170-2489)?

Salam hangat,
Tim Sales & Komersial PT. Texora Visi Prima`;

    setReplyText(aiText);
    setIsReplying(true);
    showToast("Draft balasan profesional berhasil dibuat oleh AI.");
  };

  // Send Compose Modal
  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    const newMail: EmailMessage = {
      id: `mail-${Date.now()}`,
      senderName: "Dian Permata (Sales Texora)",
      senderEmail: "sales@texora.co.id",
      to: [composeTo.trim()],
      subject: composeSubject.trim(),
      snippet: composeBody.slice(0, 100) + "...",
      body: composeBody,
      date: "Hari ini",
      time: "Baru saja",
      unread: false,
      starred: false,
      folder: "sent",
      tags: ["Terkirim CRM"],
      attachments: composeAttachments.map((f) => ({ name: f, size: "450 KB", type: "pdf" })),
    };

    setEmails((prev) => [newMail, ...prev]);
    setShowComposeModal(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachments([]);
    showToast(`Email berhasil dikirim ke ${composeTo}!`);
  };

  const unreadCount = emails.filter((m) => m.folder === "inbox" && m.unread).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm">{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Webmail Korporat CRM — Texora B2B Mailbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Webmail & Komunikasi Email Sales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kirim penawaran resmi (SPH), terima RFQ pelanggan, dan kirim balasan langsung tanpa keluar dari portal CRM.
          </p>
        </div>

        {/* Mail Account Info & Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="font-semibold text-white font-mono">sales@texora.co.id</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>IMAP / SMTP Server Aktif</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Sinkronisasi Kotak Masuk"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-brand-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 font-black" />
            <span>Tulis Email Baru</span>
          </button>
        </div>
      </div>

      {/* MAIN THREE-COLUMN MAILBOX CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[72vh]">
        
        {/* COLUMN 1: FOLDERS & LABELS (Width: 2.5 / 12) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Compose Big Button (Mobile) */}
          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="w-full lg:hidden py-3 rounded-2xl bg-brand-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Email Baru</span>
          </button>

          {/* Mailbox Folders Card */}
          <div className="p-3 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Folder Utama
            </div>

            {[
              { id: "inbox", label: "Kotak Masuk", icon: Inbox, badge: unreadCount },
              { id: "sent", label: "Email Terkirim", icon: Send },
              { id: "starred", label: "Berbintang / Prioritas", icon: Star },
              { id: "sph", label: "Penawaran SPH Resmi", icon: FileText, tagColor: "text-amber-400" },
              { id: "drafts", label: "Draf Penawaran", icon: Clock },
              { id: "trash", label: "Sampah", icon: Trash2 },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFolder === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : f.tagColor || "text-slate-400"}`} />
                    <span>{f.label}</span>
                  </div>
                  {f.badge !== undefined && f.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? "bg-slate-950 text-white" : "bg-brand-500 text-slate-950"
                      }`}
                    >
                      {f.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick CRM Accounts Card */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Pelanggan B2B Prioritas</span>
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
            </div>

            <div className="space-y-1.5 text-xs">
              <Link
                href="/portal/crm/customers/cust-5"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="truncate">PT. Intech Mitra Abadi</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 shrink-0" />
              </Link>

              <Link
                href="/portal/crm/customers/cust-2"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="truncate">CV. Sablon Juara</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 shrink-0" />
              </Link>

              <Link
                href="/portal/crm/customers/cust-3"
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  <span className="truncate">PT. Sri Rejeki Tekstil</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 shrink-0" />
              </Link>
            </div>

            {/* Storage Quota Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>Penyimpanan Mailbox:</span>
                <span className="font-mono text-slate-300">1.4 GB / 15 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full w-[9.3%]" />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: EMAIL LIST (Width: 4 / 12) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          
          {/* Search & Filter Header */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari subjek, pengirim, atau isi email..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: "ALL", label: "Semua" },
                { id: "UNREAD", label: "Belum Dibaca" },
                { id: "ATTACHMENTS", label: "Ada Lampiran" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTag(f.id)}
                  className={`px-2.5 py-1 rounded-xl font-semibold shrink-0 transition-colors ${
                    filterTag === f.id
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Emails Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[64vh] pr-1">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Mail className="w-10 h-10 mx-auto opacity-30 text-brand-400" />
                <p className="text-xs">Tidak ada email dalam kategori ini.</p>
              </div>
            ) : (
              filteredEmails.map((mail) => {
                const isSelected = selectedEmail?.id === mail.id;
                return (
                  <div
                    key={mail.id}
                    onClick={() => handleSelectEmail(mail)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left relative ${
                      isSelected
                        ? "bg-slate-900/90 border-brand-500/50 shadow-md ring-1 ring-brand-500/30"
                        : mail.unread
                        ? "bg-slate-900/50 hover:bg-slate-900 border-slate-800/80"
                        : "bg-slate-950/40 hover:bg-slate-900/40 border-slate-900"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {mail.unread && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-brand-400 shadow-sm shadow-brand-400/50" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => toggleStar(mail.id, e)}
                          className="text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${mail.starred ? "text-amber-400 fill-amber-400" : ""}`} />
                        </button>
                        <span className={`text-xs truncate ${mail.unread ? "font-bold text-white" : "font-semibold text-slate-200"}`}>
                          {mail.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {mail.time}
                      </span>
                    </div>

                    {/* Company Badge if B2B */}
                    {mail.senderCompany && (
                      <div className="mb-1">
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium truncate max-w-[200px]">
                          {mail.senderCompany}
                        </span>
                      </div>
                    )}

                    <h4 className={`text-xs mb-1 line-clamp-1 ${mail.unread ? "font-bold text-white" : "text-slate-300 font-medium"}`}>
                      {mail.subject}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {mail.snippet}
                    </p>

                    {/* Footer attachments & tags */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      {mail.attachments && mail.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>{mail.attachments.length} file</span>
                        </span>
                      )}

                      {mail.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READING & REPLY PANE (Width: 5 / 12) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col overflow-hidden">
          {!selectedEmail ? (
            <div className="flex-1 flex items-center justify-center text-center p-8 text-slate-500">
              <div>
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-30 text-brand-400" />
                <p className="text-sm">Pilih email dari daftar untuk membaca isi pesan.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
              
              {/* Email Detail Top Action Bar */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Pindahkan ke Sampah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => toggleStar(selectedEmail.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    title="Bintang / Tandai Prioritas"
                  >
                    <Star className={`w-4 h-4 ${selectedEmail.starred ? "text-amber-400 fill-amber-400" : ""}`} />
                  </button>
                </div>

                {/* Quick CRM Bridges */}
                <div className="flex items-center gap-2">
                  {selectedEmail.customerId && (
                    <Link
                      href={`/portal/crm/customers/${selectedEmail.customerId}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
                      title="Buka Profil Pelanggan 360°"
                    >
                      <Building2 className="w-3.5 h-3.5 text-brand-400" />
                      <span>Profil CRM 360°</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                  )}

                  <Link
                    href="/portal/crm/inbox"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Buka Chat WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </Link>
                </div>
              </div>

              {/* Email Content Header */}
              <div className="p-5 border-b border-slate-800/80 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedEmail.subject}
                </h2>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                      {selectedEmail.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{selectedEmail.senderName}</span>
                        {selectedEmail.senderCompany && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                            {selectedEmail.senderCompany}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        &lt;{selectedEmail.senderEmail}&gt;
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                    <div>{selectedEmail.date}</div>
                    <div>{selectedEmail.time}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <div>Kepada: <span className="text-slate-300">{selectedEmail.to.join(", ")}</span></div>
                  {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                    <div>Cc: <span className="text-slate-400">{selectedEmail.cc.join(", ")}</span></div>
                  )}
                </div>
              </div>

              {/* Attachments Bar if any */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-brand-400" />
                    <span>Lampiran Dokumen ({selectedEmail.attachments.length} File):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 hover:border-brand-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-medium text-slate-200 truncate">{att.name}</p>
                            <p className="text-[10px] text-slate-500">{att.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast(`Mengunduh file ${att.name}...`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-slate-400 transition-colors shrink-0"
                          title="Unduh File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Body */}
              <div className="p-5 sm:p-6 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal space-y-4">
                {selectedEmail.body}
              </div>

              {/* Thread History / Previous Replies */}
              {selectedEmail.replies && selectedEmail.replies.length > 0 && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Reply className="w-3.5 h-3.5 text-brand-400" />
                    <span>Riwayat Balasan ({selectedEmail.replies.length})</span>
                  </h4>

                  {selectedEmail.replies.map((rep) => (
                    <div key={rep.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-300">{rep.senderName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{rep.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {rep.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* REPLY ACTION BOX */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 mt-auto space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Balas Email:</span>
                    <button
                      type="button"
                      onClick={handleGenerateAIReply}
                      className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                      title="Bantu buat draf balasan profesional dengan AI"
                    >
                      <Sparkles className="w-3 h-3 text-brand-400" />
                      <span>✨ Buat Draf AI</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Balas ke: {selectedEmail.senderEmail}
                  </span>
                </div>

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Tulis balasan untuk ${selectedEmail.senderName}...`}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => showToast("File SPH resmi dilampirkan ke balasan.")}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                        title="Lampirkan Dokumen"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lampirkan SPH/PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-brand-500/10"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Balasan</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* MODAL: COMPOSE NEW EMAIL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Tulis Pesan Email Baru</h3>
                  <p className="text-[11px] text-slate-400">Dari: sales@texora.co.id</p>
                </div>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCompose} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* To */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kepada (Email Tujuan):</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="contoh: procurement@intechmitra.co.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subjek Email:</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="contoh: Surat Penawaran Resmi (SPH) Kain Dryfit Milano 135 GSM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Quick Template Chips */}
              <div>
                <span className="text-[11px] text-slate-400 mb-1.5 block">Template Cepat Penjualan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: "SPH Dryfit Milano",
                      subj: "Surat Penawaran Resmi (SPH) Kain Dryfit Milano — PT. Texora Visi Prima",
                      body: `Yth. Tim Procurement,\n\nTerlampir kami sampaikan Surat Penawaran Resmi (SPH) untuk kebutuhan kain Dryfit Milano 135 GSM volume 1.500m dengan harga tiering B2B Rp 32.000/meter dan term pembayaran TOP 30 hari.\n\nSalam hormat,\nTim Sales PT. Texora Visi Prima`,
                    },
                    {
                      label: "Konfirmasi Proof Sublim",
                      subj: "Konfirmasi Digital Proofing & Jadwal Cetak Sublimasi",
                      body: `Yth. Pelanggan Texora,\n\nDigital proofing untuk pesanan custom jersey Anda telah selesai ditinjau. Mohon konfirmasi approval agar proses cetak sublimasi industri dapat segera dinaikkan ke antrean produksi.\n\nTerima kasih.`,
                    },
                    {
                      label: "Faktur Pajak CoreTax",
                      subj: "Faktur Penjualan & Bukti Potong CoreTax PPN 11%",
                      body: `Yth. Bagian Keuangan,\n\nTerlampir kami sampaikan salinan Faktur Pajak resmi yang telah tervalidasi di sistem DJP CoreTax untuk transaksi pesanan kain Anda.\n\nSalam hormat,\nDivisi Finance Texora`,
                    },
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setComposeSubject(tpl.subj);
                        setComposeBody(tpl.body);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 border border-slate-700 text-slate-300 text-[11px] transition-colors"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Pesan:</label>
                <textarea
                  rows={8}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Tulis pesan penawaran resmi atau komunikasi dengan pelanggan..."
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const sampleFiles = ["SPH-Resmi-Texora-2026.pdf", "Katalog-Kain-Dryfit-2026.pdf", "Invoice-DP-Texora.pdf"];
                    const randomFile = sampleFiles[composeAttachments.length % sampleFiles.length];
                    setComposeAttachments([...composeAttachments, randomFile]);
                    showToast(`File ${randomFile} berhasil dilampirkan.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5 text-brand-400" />
                  <span>+ Lampirkan Dokumen PDF / SPH</span>
                </button>

                {composeAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {composeAttachments.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/30 text-[11px]">
                        <FileText className="w-3 h-3" />
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => setComposeAttachments(composeAttachments.filter((_, idx) => idx !== i))}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Email</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
