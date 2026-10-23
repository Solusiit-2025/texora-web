"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Zap,
  Check,
  Copy,
  MessageCircle,
  User,
  Ruler,
  Layers,
  ChevronDown,
  ExternalLink,
  PackageCheck,
  Award,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CompanyLocationMap } from "@/components/common/CompanyLocationMap";
import { useI18n } from "@/lib/i18n/LanguageContext";

interface FabricOption {
  id: string;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  gsm: string;
}

const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: "Dryfit Milano",
    nameKey: "contact.fabric.dryfit",
    defaultName: "Dryfit Milano",
    descKey: "contact.fabric.dryfitDesc",
    defaultDesc: "Jersey & Sportswear",
    gsm: "135-150 GSM",
  },
  {
    id: "Voal Ultrafine",
    nameKey: "contact.fabric.voal",
    defaultName: "Voal Ultrafine",
    descKey: "contact.fabric.voalDesc",
    defaultDesc: "Hijab & Scarf Printing",
    gsm: "75-85 GSM",
  },
  {
    id: "Polyester Satin Silk",
    nameKey: "contact.fabric.satin",
    defaultName: "Polyester Satin Silk",
    descKey: "contact.fabric.satinDesc",
    defaultDesc: "Gaun & Scarf Premium",
    gsm: "85 GSM",
  },
  {
    id: "Scuba Heavyweight",
    nameKey: "contact.fabric.scuba",
    defaultName: "Scuba Heavyweight",
    descKey: "contact.fabric.scubaDesc",
    defaultDesc: "Jaket & Outerwear",
    gsm: "280 GSM",
  },
  {
    id: "Canvas Poly 8oz",
    nameKey: "contact.fabric.canvas",
    defaultName: "Canvas Poly 8oz",
    descKey: "contact.fabric.canvasDesc",
    defaultDesc: "Totebag & Merchandise",
    gsm: "240 GSM",
  },
  {
    id: "Lainnya",
    nameKey: "contact.fabric.other",
    defaultName: "Formula Kustom",
    descKey: "contact.fabric.otherDesc",
    defaultDesc: "Gramasi Sesuai Request",
    gsm: "Custom GSM",
  },
];

const QUANTITY_CHIPS = [
  { label: "100 - 300 m", value: "300", tag: "Roll Sample" },
  { label: "500 m", value: "500", tag: "Standard Batch" },
  { label: "1.000 m", value: "1000", tag: "Tier Grosir Pabrik 🔥" },
  { label: "> 3.000 m", value: "3000", tag: "Kontrak Industri ⚡" },
];

export default function ContactClient() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [inquiryCode, setInquiryCode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    fabricInterest: "Dryfit Milano",
    estimatedMeters: "500",
    requestSwatch: true,
    message: "",
  });

  const handleCopy = (text: string, type: "email" | "address") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const randomCode = `XORA-INQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setInquiryCode(randomCode);
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const createWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Halo Xora Materia, saya ${formData.name || "rekanan"} dari ${
        formData.company || "perusahaan"
      }.\nSaya baru saja mengirimkan permintaan penawaran [Kode: ${
        inquiryCode || "INQ-WEB"
      }] untuk bahan ${formData.fabricInterest} estimasi ${formData.estimatedMeters} meter.`
    );
    return `https://wa.me/6285810646157?text=${text}`;
  };

  const selectedFabricObj =
    FABRIC_OPTIONS.find((f) => f.id === formData.fabricInterest) || FABRIC_OPTIONS[0];

  return (
    <article className="texora-container py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: t("contact.breadcrumb", "Kontak Kami") }]} />

      {/* Hero Header: Enterprise B2B Positioning */}
      <header className="relative text-center max-w-4xl mx-auto space-y-6">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-brand-500/15 blur-3xl" />

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-widest shadow-lg shadow-black/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>{t("contact.badge", "Pabrik Tekstil & Layanan Konsultasi B2B")}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-[1.18]">
          {t("contact.title", "Konsultasi Pengadaan Kain & Cetak Sublimasi Industri")}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t(
            "contact.subtitle",
            "Diskusikan formulasi gramasi kain, profil kalibrasi warna ICC, serta kontrak suplai roll langsung dengan Account Executive & Technical Specialist pabrik Xora Materia."
          )}
        </p>

        {/* Primary WhatsApp CTA — sengaja di hero agar terlihat tanpa scroll */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            href="https://wa.me/6285810646157?text=Halo%20Xora%20Materia,%20saya%20ingin%20konsultasi%20pengadaan%20kain%20sublimasi."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
          <span className="text-[11px] text-slate-400">
            Respon cepat &lt; 15 menit pada jam kerja
          </span>
        </div>

        {/* Enterprise SLA & Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-2xl glass-panel border border-brand-500/20 bg-slate-900/80 flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("contact.trust1.title", "Respon Cepat")}</div>
              <div className="text-[11px] text-slate-400">{t("contact.trust1.desc", "< 15 Menit WhatsApp")}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-brand-500/20 bg-slate-900/80 flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("contact.trust2.title", "SPH Resmi")}</div>
              <div className="text-[11px] text-slate-400">{t("contact.trust2.desc", "Terbit dalam 1x24 Jam")}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-brand-500/20 bg-slate-900/80 flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("contact.trust3.title", "Sampel Gratis")}</div>
              <div className="text-[11px] text-slate-400">{t("contact.trust3.desc", "Buku Swatch Kain Fisik")}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-brand-500/20 bg-slate-900/80 flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-accent-violet/15 text-accent-violet flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("contact.trust4.title", "Kerahasiaan NDA")}</div>
              <div className="text-[11px] text-slate-400">{t("contact.trust4.desc", "Desain & Data Terlindungi")}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Grid: Fast-Track Channels (5 Cols) & Enterprise RFQ Terminal (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Direct Communication Hub */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Office & Workshop Facility */}
          <section
            aria-labelledby="office-info-heading"
            className="p-6 rounded-2xl sm:rounded-3xl glass-panel border border-slate-800 bg-slate-900/90 shadow-xl space-y-5 relative overflow-hidden transition-all duration-300 hover:border-brand-500/40"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" />
                <h2 id="office-info-heading" className="text-xs font-bold text-white uppercase tracking-wider">
                  {t("contact.office.tag", "Kantor Pusat & Workshop")}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("contact.office.status", "Operasional Buka")}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="font-display font-bold text-white text-base">Xora Materia</div>
                <p className="text-slate-300 mt-1 leading-relaxed text-xs">
                  Jl. Walang Baru VI No.3, RT.7/RW.7, Tugu Utara, Kec. Koja, Jkt Utara, Daerah Khusus Ibukota Jakarta 14260
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      "Xora Materia - Jl. Walang Baru VI No.3, RT.7/RW.7, Tugu Utara, Kec. Koja, Jkt Utara, 14260",
                      "address"
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors border border-slate-700"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">
                        {t("contact.office.copied", "Alamat Tersalin")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t("contact.office.copy", "Salin Alamat")}</span>
                    </>
                  )}
                </button>

                <a
                  href="#peta-lokasi"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 text-[11px] font-bold transition-colors border border-brand-500/30"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{t("contact.office.viewMap", "Lihat di Peta ↓")}</span>
                </a>
              </div>
            </div>
          </section>

          {/* Priority Corporate WhatsApp Desk */}
          <div className="p-6 rounded-2xl sm:rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  {t("contact.wa.badge", "Konsultasi Langsung PIC Pabrik")}
                </span>
                <div className="text-white font-bold text-sm sm:text-base">
                  {t("contact.wa.title", "Hotline WhatsApp Bisnis Resmi")}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t(
                "contact.wa.desc",
                "Hubungi langsung tim spesialis pabrik untuk konsultasi gramasi kain, cek stok roll ready, dan estimasi waktu produksi cepat."
              )}
            </p>

            {/* Quick 1-Click Inquiry Options */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {t("contact.wa.quickTopics", "Pilihan Konsultasi Cepat:")}
              </span>
              <a
                href="https://wa.me/6285810646157?text=Halo%20Xora%20Materia,%20saya%20ingin%20cek%20stok%20roll%20kain%20dan%20penawaran%20harga%20partai%20besar."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs transition-all group"
              >
                <span>📦 {t("contact.wa.topic1", "Cek Stok Roll & Tier Harga Pabrik")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://wa.me/6285810646157?text=Halo%20Xora%20Materia,%20saya%20ingin%20meminta%20Buku%20Sampel%20Swatch%20Kain%20Fisik%20Gratis."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs transition-all group"
              >
                <span>✨ {t("contact.wa.topic2", "Permintaan Buku Swatch Sample Fisik")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://wa.me/6285810646157?text=Halo%20Xora%20Materia,%20saya%20ingin%20konsultasi%20profil%20warna%20ICC%20dan%20proofing%20cetak%20sublimasi."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs transition-all group"
              >
                <span>🎨 {t("contact.wa.topic3", "Konsultasi Profil Warna & Proofing")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <a
              href="https://wa.me/6285810646157?text=Halo%20Xora%20Materia,%20saya%20ingin%20konsultasi%20pengadaan%20kain%20sublimasi%20industri."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              <span>{t("contact.wa.btn", "Mulai Chat WhatsApp: +62 858-1064-6157")}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          {/* Email & Jam Layanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div className="font-bold text-white text-xs">{t("contact.email.title", "Email Resmi RFQ & Tender")}</div>
              <button
                type="button"
                onClick={() => handleCopy("admin@texoraprima.com", "email")}
                className="text-xs text-brand-300 hover:underline block font-mono text-left"
              >
                {copiedEmail ? t("contact.copied", "Email Tersalin!") : "admin@texoraprima.com"}
              </button>
              <p className="text-[10px] text-slate-400">{t("contact.email.note", "Menerima berkas tender & SPH resmi.")}</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-accent-violet/15 text-accent-violet flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="font-bold text-white text-xs">{t("contact.hours.title", "Jam Operasional Pabrik")}</div>
              <p className="text-xs text-slate-300 font-medium">{t("contact.hours.days", "Senin – Sabtu")}</p>
              <p className="text-[10px] text-slate-400">{t("contact.hours.time", "08:00 – 17:00 WIB (Kunjungan & Sampel)")}</p>
            </div>
          </div>

          {/* Complimentary Swatch Promo Banner */}
          <div className="p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-950/60 via-slate-900 to-slate-950 border border-brand-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wide">
              <PackageCheck className="w-4 h-4 text-brand-400" />
              <span>{t("contact.swatch.title", "Buku Sampel Swatch Kain Fisik Gratis")}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t(
                "contact.swatch.desc",
                "Khusus brand fashion & konveksi aktif: dapatkan swatch book kain asli (Dryfit, Voal, Satin Silk, Scuba) beserta contoh cetak gradasi sublimasi secara gratis."
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-slate-700">Dryfit Milano</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-slate-700">Voal Ultrafine</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-slate-700">Satin Silk</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-slate-700">Heavy Scuba</span>
            </div>
          </div>
        </div>

        {/* Right Column: Professional B2B RFQ Terminal */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-brand-500/30 shadow-2xl relative overflow-hidden bg-slate-900/95 backdrop-blur-2xl">
            {/* Ambient Corner Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-500/15 blur-3xl" />

            {submitted ? (
              <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold">
                    {t("contact.success.ticket", "Tiket Inquiry:")} {inquiryCode}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    {t("contact.success.title", "Permintaan Penawaran Berhasil Terdaftar!")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    {t("contact.success.thankYou", "Terima kasih,")} <strong>{formData.name}</strong> ({formData.company || "Perusahaan"}). {t("contact.success.received", "Data kebutuhan kain Anda telah otomatis masuk ke Pipeline CRM Sales Xora Materia.")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 max-w-md mx-auto text-left text-xs text-slate-300 space-y-2.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-400" />
                    <span>{t("contact.success.next", "Langkah Selanjutnya:")}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>{t("contact.success.step1", "Account Executive kami akan memverifikasi spesifikasi teknis dan alokasi roll pabrik.")}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>{t("contact.success.step2", "Draft SPH resmi beserta jadwal pengiriman akan dikirimkan via WhatsApp / Email dalam 1-2 jam kerja.")}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={createWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t("contact.success.waBtn", "Fast-Track Konfirmasi via WhatsApp")}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        company: "",
                        phone: "",
                        email: "",
                        fabricInterest: "Dryfit Milano",
                        estimatedMeters: "500",
                        requestSwatch: true,
                        message: "",
                      });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
                  >
                    {t("contact.success.resetBtn", "Buat Permintaan Baru")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {/* Form Title & Tier Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider font-display">
                      {t("contact.form.title", "Formulir Konsultasi & Penawaran Resmi (SPH)")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {t("contact.form.subtitle", "Lengkapi kebutuhan pengadaan kain & cetak Anda untuk menerima SPH resmi tier pabrik.")}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/25 text-[11px] font-mono font-bold whitespace-nowrap">
                    {t("contact.form.tierBadge", "Pabrik Direct B2B")}
                  </span>
                </div>

                {/* Section 1: Contact PIC & Company Info */}
                <div className="space-y-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{t("contact.form.sectionPic", "01. Data PIC & Perusahaan")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">
                        {t("contact.form.name", "Nama Lengkap PIC *")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t("contact.form.namePlaceholder", "Contoh: Dimas Pratama")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">
                        {t("contact.form.company", "Nama Perusahaan / Brand *")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t("contact.form.companyPlaceholder", "Contoh: PT. Apparel Nusantara")}
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">
                        {t("contact.form.phone", "Nomor WhatsApp Aktif *")}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={t("contact.form.phonePlaceholder", "Contoh: 081298765432")}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">
                        {t("contact.form.email", "Email Resmi Perusahaan *")}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={t("contact.form.emailPlaceholder", "Contoh: purchasing@brand.com")}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Fabric Material Selection */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{t("contact.form.sectionFabric", "02. Pemilihan Bahan Kain Tekstil")}</span>
                    </label>
                    <span className="text-[11px] font-mono text-brand-300 font-bold">
                      {selectedFabricObj.gsm}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FABRIC_OPTIONS.map((f) => {
                      const isSelected = formData.fabricInterest === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, fabricInterest: f.id })}
                          className={`p-3 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? "bg-gradient-to-br from-brand-500/20 to-slate-900 border-brand-500 text-white shadow-lg ring-1 ring-brand-500/50"
                              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <div className="font-bold text-xs truncate flex items-center justify-between">
                            <span>{t(f.nameKey, f.defaultName)}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0 ml-1" />}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {t(f.descKey, f.defaultDesc)}
                          </div>
                          <div className="text-[10px] font-mono text-brand-300/80 mt-1">
                            {f.gsm}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Estimated Volume & Tier Chips */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{t("contact.form.sectionVolume", "03. Estimasi Volume Roll (Meter)")}</span>
                    </label>
                    <span className="text-[11px] font-mono text-brand-300 font-bold">
                      {formData.estimatedMeters ? `${formData.estimatedMeters} m` : t("contact.form.notSet", "Belum ditentukan")}
                    </span>
                  </div>

                  {/* Quantity Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUANTITY_CHIPS.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, estimatedMeters: chip.value })}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          formData.estimatedMeters === chip.value
                            ? "bg-brand-500 text-ink border-brand-400 font-bold shadow-md shadow-brand-500/20"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{chip.label}</div>
                        <div className={`text-[10px] ${formData.estimatedMeters === chip.value ? "text-ink/80 font-semibold" : "text-slate-400"}`}>
                          {chip.tag}
                        </div>
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="1"
                    placeholder={t("contact.form.volumePlaceholder", "Atau ketik kuantitas custom, misal: 2500")}
                    value={formData.estimatedMeters}
                    onChange={(e) => setFormData({ ...formData, estimatedMeters: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                  />
                </div>

                {/* Section 4: Free Fabric Swatch Sample Checkbox */}
                <label className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-slate-900 to-slate-900 border border-brand-500/30 cursor-pointer hover:border-brand-500/50 transition-all shadow-md">
                  <input
                    type="checkbox"
                    checked={formData.requestSwatch}
                    onChange={(e) => setFormData({ ...formData, requestSwatch: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-brand-500 focus:ring-brand-400 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                      {t("contact.form.swatchCheck", "Kirimkan Buku Sampel Swatch Kain Fisik Gratis")}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-0.5 leading-relaxed">
                      {t(
                        "contact.form.swatchSub",
                        "Sampel fisik potongan kain Dryfit, Voal, Satin Silk, dan Scuba beserta hasil cetak gradasi sublimasi akan dikirimkan kurir ke alamat perusahaan Anda."
                      )}
                    </span>
                  </div>
                </label>

                {/* Section 5: Technical Production Notes */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">
                    {t("contact.form.notes", "04. Detail Spesifikasi Teknis / Catatan Produksi:")}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t(
                      "contact.form.notesPlaceholder",
                      "Sebutkan target deadline pengiriman, lebar kain, format artwork (TIFF/PDF), profil warna ICC khusus, atau pertanyaan teknis lainnya..."
                    )}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t("contact.form.submitting", "Memproses Permintaan Penawaran Resmi...")}</span>
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t("contact.form.submit", "Kirim Permintaan Penawaran Resmi (SPH) & Sampel")}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>
                      {t(
                        "contact.form.security",
                        "Data perusahaan Anda dilindungi enkripsi SSL 256-bit dan terikat perjanjian kerahasiaan NDA resmi."
                      )}
                    </span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps Section: Interactive Location Coordinates */}
      <section id="peta-lokasi" aria-labelledby="maps-heading" className="space-y-4 pt-6 sm:pt-10 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-400">
              <MapPin className="w-3.5 h-3.5" /> {t("map.headingTag", "Navigasi Koordinat Google Maps")}
            </span>
            <h2 id="maps-heading" className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              {t("map.headingTitle", "Peta Lokasi Kantor & Fasilitas Produksi")}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            {t(
              "map.headingDesc",
              "Akses langsung koordinat navigasi Google Maps untuk kunjungan kantor, penjemputan barang kargo roll, dan konsultasi spesifikasi kain di workshop Jakarta Utara."
            )}
          </p>
        </div>

        <CompanyLocationMap />
      </section>
    </article>
  );
}
