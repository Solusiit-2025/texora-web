"use client";

import { useState, useEffect } from "react";
import {
  LayoutTemplate,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  FileText,
  Sliders,
  Sparkles,
  X,
  ExternalLink,
  Share2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type TabType = "hero" | "testimonials" | "faqs" | "content" | "social" | "pricing";

interface HeroSlideItem {
  id: string;
  order: number;
  tag: string;
  caption: string;
  alt: string;
  mainImage: string;
  secondaryImage: string;
  isActive: boolean;
}

interface TestimonialItem {
  id: string;
  name: string;
  org: string;
  quote: string;
  order: number;
  isActive: boolean;
}

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface SiteContentItem {
  id?: string;
  key: string;
  value: string;
  group: string;
  label: string;
}

interface SocialLinkItem {
  id: string;
  label: string;
  href: string;
  handle: string;
  isActive: boolean;
  order: number;
}

const DEFAULT_SOCIAL_FORM: SocialLinkItem[] = [
  { id: "tiktok", label: "TikTok Xora Materia", href: "https://www.tiktok.com/@xoramateria", handle: "@xoramateria", isActive: true, order: 1 },
  { id: "instagram", label: "Instagram Xora Hijab", href: "https://www.instagram.com/xora_hijab", handle: "@xora_hijab", isActive: true, order: 2 },
  { id: "facebook", label: "Facebook Xora Materia", href: "https://www.facebook.com/profile.php?id=61595062856326", handle: "Xora Materia", isActive: true, order: 3 },
  { id: "linkedin", label: "LinkedIn Xora Materia", href: "https://www.linkedin.com/in/xora-materia-9b7517440", handle: "xora-materia", isActive: true, order: 4 },
  { id: "youtube", label: "YouTube Texora", href: "https://www.youtube.com/@texoravisiprima", handle: "Texora Official", isActive: true, order: 5 },
  { id: "whatsapp", label: "WhatsApp Sales", href: "https://wa.me/6287889856066?text=Halo%20Texora%2C%20saya%20ingin%20bertanya%20tentang%20kain%20sublimasi.", handle: "+62 878-8985-6066", isActive: true, order: 6 },
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("hero");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItemData[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(DEFAULT_SOCIAL_FORM);

  // Modals state
  const [modalType, setModalType] = useState<"hero" | "testimonial" | "faq" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Forms
  const [heroForm, setHeroForm] = useState({
    tag: "",
    caption: "",
    alt: "",
    mainImage: "",
    secondaryImage: "",
    order: 1,
    isActive: true,
  });

  const [testiForm, setTestiForm] = useState({
    name: "",
    org: "",
    quote: "",
    order: 1,
    isActive: true,
  });

  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    order: 1,
    isActive: true,
  });

  // Site content state
  const [statsData, setStatsData] = useState<Array<{ v: string; k: string }>>([
    { v: "10.000 m", k: "Kapasitas harian" },
    { v: "18 jenis", k: "Kain siap sublim" },
    { v: "400+", k: "Mitra garmen" },
  ]);

  const [b2bData, setB2bData] = useState({
    title: "Butuh pasokan rutin di atas 5.000 meter per bulan?",
    description: "Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.",
    actionText: "Minta penawaran",
    actionLink: "/contact",
  });

  // Dynamic Pricing state for Management CMS
  const [pricingForm, setPricingForm] = useState({
    designServiceFee: 150000,
    sublimationPrintFee: 18000,
    designServiceTitle: "Jasa Desain Grafis & Pattern Repeat Texora",
    designServiceDescription: "Pola seamless repeat vector, penyesuaian skala motif, dan 2x revisi minor",
    revisionPolicy: "Termasuk 2x revisi minor & digital 3D proofing mockup sebelum naik mesin cetak.",
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccess, setPricingSuccess] = useState(false);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaving(true);
    try {
      const res = await fetch("/api/settings/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingForm),
      });
      const data = await res.json();
      if (data?.success) {
        setPricingSuccess(true);
        showNotice("success", "Tarif layanan dan jasa desain berhasil diperbarui!");
        setTimeout(() => setPricingSuccess(false), 3500);
      } else {
        showNotice("error", data?.error || "Gagal memperbarui tarif.");
      }
    } catch {
      showNotice("error", "Terjadi kesalahan jaringan saat menyimpan tarif.");
    } finally {
      setPricingSaving(false);
    }
  };

  const showNotice = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pricing settings
      fetch("/api/settings/pricing")
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && d.data) {
            setPricingForm(d.data);
          }
        })
        .catch(() => {});

      const res = await fetch("/api/cms");
      const json = await res.json();
      if (json.success && json.data) {
        setHeroSlides(json.data.heroSlides || []);
        setTestimonials(json.data.testimonials || []);
        setFaqs(json.data.faqs || []);
        setSiteContent(json.data.siteContent || []);
        if (Array.isArray(json.data.socialLinks) && json.data.socialLinks.length > 0) {
          const merged = DEFAULT_SOCIAL_FORM.map((def) => {
            const found = json.data.socialLinks.find((s: any) => s.id === def.id);
            return found
              ? {
                  id: def.id,
                  label: found.label || def.label,
                  href: found.href || def.href,
                  handle: found.handle || def.handle,
                  isActive: found.isActive !== false,
                  order: found.order ?? def.order,
                }
              : def;
          });
          setSocialLinks(merged);
        }

        const statsRow = json.data.siteContent?.find((s: any) => s.key === "homepage.stats");
        if (statsRow?.value) {
          try {
            setStatsData(JSON.parse(statsRow.value));
          } catch {}
        }

        const b2bRow = json.data.siteContent?.find((s: any) => s.key === "homepage.cta_b2b");
        if (b2bRow?.value) {
          try {
            setB2bData(JSON.parse(b2bRow.value));
          } catch {}
        }
      }
    } catch (err) {
      showNotice("error", "Gagal memuat konten CMS dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Hero Slide
  const handleOpenHeroModal = (item?: HeroSlideItem) => {
    if (item) {
      setEditingItem(item);
      setHeroForm({
        tag: item.tag,
        caption: item.caption,
        alt: item.alt,
        mainImage: item.mainImage,
        secondaryImage: item.secondaryImage,
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setHeroForm({
        tag: "",
        caption: "",
        alt: "",
        mainImage: "/images/hero/hero-printer.jpg",
        secondaryImage: "/images/hero/hero-printer-sub.jpg",
        order: heroSlides.length + 1,
        isActive: true,
      });
    }
    setModalType("hero");
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/cms";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? { type: "heroSlide", id: editingItem.id, data: heroForm }
        : { type: "heroSlide", data: heroForm };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("success", `Hero Slide berhasil ${editingItem ? "diperbarui" : "dibuat"}!`);
        setModalType(null);
        await loadData();
      } else {
        showNotice("error", json.error || "Gagal menyimpan Hero Slide.");
      }
    } catch (err: any) {
      showNotice("error", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHero = async (id: string, tag: string) => {
    if (!window.confirm(`Hapus slide "${tag}"?`)) return;
    try {
      const res = await fetch(`/api/cms?type=heroSlide&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotice("success", "Hero Slide berhasil dihapus.");
        await loadData();
      }
    } catch {
      showNotice("error", "Gagal menghapus.");
    }
  };

  // Handlers for Testimonials
  const handleOpenTestiModal = (item?: TestimonialItem) => {
    if (item) {
      setEditingItem(item);
      setTestiForm({
        name: item.name,
        org: item.org,
        quote: item.quote,
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setTestiForm({
        name: "",
        org: "",
        quote: "",
        order: testimonials.length + 1,
        isActive: true,
      });
    }
    setModalType("testimonial");
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? { type: "testimonial", id: editingItem.id, data: testiForm }
        : { type: "testimonial", data: testiForm };

      const res = await fetch("/api/cms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("success", `Testimoni berhasil ${editingItem ? "diperbarui" : "dibuat"}!`);
        setModalType(null);
        await loadData();
      } else {
        showNotice("error", json.error || "Gagal menyimpan.");
      }
    } catch (err: any) {
      showNotice("error", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (!window.confirm(`Hapus testimoni dari "${name}"?`)) return;
    try {
      const res = await fetch(`/api/cms?type=testimonial&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotice("success", "Testimoni berhasil dihapus.");
        await loadData();
      }
    } catch {
      showNotice("error", "Gagal menghapus.");
    }
  };

  // Handlers for FAQ
  const handleOpenFaqModal = (item?: FaqItemData) => {
    if (item) {
      setEditingItem(item);
      setFaqForm({
        question: item.question,
        answer: item.answer,
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFaqForm({
        question: "",
        answer: "",
        order: faqs.length + 1,
        isActive: true,
      });
    }
    setModalType("faq");
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? { type: "faq", id: editingItem.id, data: faqForm }
        : { type: "faq", data: faqForm };

      const res = await fetch("/api/cms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("success", `FAQ berhasil ${editingItem ? "diperbarui" : "dibuat"}!`);
        setModalType(null);
        await loadData();
      } else {
        showNotice("error", json.error || "Gagal menyimpan FAQ.");
      }
    } catch (err: any) {
      showNotice("error", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!window.confirm(`Hapus pertanyaan "${question.slice(0, 30)}..."?`)) return;
    try {
      const res = await fetch(`/api/cms?type=faq&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotice("success", "FAQ berhasil dihapus.");
        await loadData();
      }
    } catch {
      showNotice("error", "Gagal menghapus FAQ.");
    }
  };

  // Handler for Site Content
  const handleSaveSiteContent = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "siteContent",
          data: {
            key: "homepage.stats",
            group: "homepage",
            label: "Statistik Pabrik Homepage",
            value: JSON.stringify(statsData),
          },
        }),
      });

      await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "siteContent",
          data: {
            key: "homepage.cta_b2b",
            group: "homepage",
            label: "CTA Kontrak B2B",
            value: JSON.stringify(b2bData),
          },
        }),
      });

      showNotice("success", "Statistik & Banner B2B berhasil disimpan ke database!");
      await loadData();
    } catch (err: any) {
      showNotice("error", err.message || "Gagal menyimpan teks website.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for Social Links (disimpan ke DB via SiteContent social.links)
  const handleSaveSocialLinks = async () => {
    setSubmitting(true);
    try {
      // Validasi URL sederhana
      for (const s of socialLinks) {
        if (s.isActive && s.href && !/^https?:\/\/.+/i.test(s.href)) {
          showNotice("error", `URL ${s.label} harus diawali http(s)://`);
          setSubmitting(false);
          return;
        }
      }
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "socialLinks", data: socialLinks }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("success", "Tautan media sosial berhasil disimpan ke database!");
        await loadData();
      } else {
        showNotice("error", json.error || "Gagal menyimpan tautan sosial.");
      }
    } catch (err: any) {
      showNotice("error", err.message || "Gagal menyimpan tautan sosial.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
              : "bg-red-950/90 text-red-200 border-red-500/40"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>CMS Konten Storefront (PRD §3.2)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Content Management System
          </h1>
          <p className="text-xs text-slate-400">
            Kelola slider hero, ulasan testimoni mitra, daftar pertanyaan umum (FAQ), teks banner B2B, dan tautan media sosial storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Lihat Homepage</span>
          </a>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
            title="Muat ulang konten"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: "hero", label: "Hero Slider Utama", icon: ImageIcon, count: heroSlides.length },
          { key: "testimonials", label: "Testimoni Mitra", icon: MessageSquare, count: testimonials.length },
          { key: "faqs", label: "FAQ & Tanya Jawab", icon: HelpCircle, count: faqs.length },
          { key: "content", label: "Statistik & Banner B2B", icon: FileText, count: 2 },
          { key: "social", label: "Media Sosial", icon: Share2, count: socialLinks.filter((s) => s.isActive).length },
          { key: "pricing", label: "Tarif & Jasa Desain", icon: Sliders, count: "Atur" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-slate-950/30 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Memuat konten CMS dari database...</p>
        </div>
      )}

      {/* TAB 1: HERO SLIDER */}
      {!loading && activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Daftar Slide Showcase Hero</h2>
              <p className="text-xs text-slate-400">
                Slide berputar otomatis setiap 7.5 detik dengan efek rotasi smooth & crossfade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenHeroModal()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slide Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-brand-500/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                      {slide.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slide.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {slide.isActive ? "Aktif" : "Non-aktif"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenHeroModal(slide)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white"
                      title="Edit Slide"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHero(slide.id, slide.tag)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400"
                      title="Hapus Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={slide.mainImage} alt={slide.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-2 aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={slide.secondaryImage} alt="Detail" className="w-full h-full object-cover" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {slide.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {!loading && activeTab === "testimonials" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Ulasan &amp; Testimoni Mitra</h2>
              <p className="text-xs text-slate-400">
                Ulasan yang ditampilkan pada seksi &quot;Dari mitra kami&quot; di homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenTestiModal()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Testimoni</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      #{t.order || idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenTestiModal(t)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id, t.name)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <blockquote className="text-xs text-slate-200 italic leading-relaxed border-l-2 border-brand-500 pl-3">
                    &quot;{t.quote}&quot;
                  </blockquote>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FAQS */}
      {!loading && activeTab === "faqs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Pertanyaan Umum (FAQ)</h2>
              <p className="text-xs text-slate-400">
                Daftar pertanyaan seputar resolusi artwork, tier harga, proofing sampel, dan ekspedisi roll kain.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenFaqModal()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pertanyaan</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-white">{faq.question}</h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-7 leading-relaxed">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenFaqModal(faq)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-slate-300 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id, faq.question)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STATS & B2B BANNER */}
      {!loading && activeTab === "content" && (
        <div className="space-y-8 max-w-4xl">
          {/* Section 1: Stats */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              <span>Metrik Statistik Pabrik (Hero Section)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Angka pencapaian kapasitas pabrik yang tampil di bawah tombol CTA Hero.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {statsData.map((stat, i) => (
                <div key={i} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">
                    Metrik #{i + 1}
                  </label>
                  <input
                    type="text"
                    value={stat.v}
                    onChange={(e) => {
                      const updated = [...statsData];
                      updated[i].v = e.target.value;
                      setStatsData(updated);
                    }}
                    placeholder="Nilai (e.g. 10.000 m)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold"
                  />
                  <input
                    type="text"
                    value={stat.k}
                    onChange={(e) => {
                      const updated = [...statsData];
                      updated[i].k = e.target.value;
                      setStatsData(updated);
                    }}
                    placeholder="Label (e.g. Kapasitas harian)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: B2B Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Banner Penawaran Kontrak B2B (Footer Call to Action)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pengaturan teks penawaran khusus untuk mitra garmen skala besar dengan sistem termin.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Penawaran B2B</label>
                <input
                  type="text"
                  value={b2bData.title}
                  onChange={(e) => setB2bData({ ...b2bData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Fasilitas</label>
                <textarea
                  rows={2}
                  value={b2bData.description}
                  onChange={(e) => setB2bData({ ...b2bData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teks Tombol</label>
                  <input
                    type="text"
                    value={b2bData.actionText}
                    onChange={(e) => setB2bData({ ...b2bData, actionText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tautan Aksi</label>
                  <input
                    type="text"
                    value={b2bData.actionLink}
                    onChange={(e) => setB2bData({ ...b2bData, actionLink: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveSiteContent}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Perubahan Teks</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: MEDIA SOSIAL */}
      {!loading && activeTab === "social" && (
        <div className="space-y-6 max-w-4xl">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-brand-400" />
              <span>Tautan Media Sosial Storefront</span>
            </h3>
            <p className="text-xs text-slate-400">
              URL dibaca storefront (Footer & floating dock) langsung dari database — tanpa hardcode.
              Matikan toggle untuk menyembunyikan ikon. Perubahan tampil setelah Simpan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks.map((s, idx) => (
              <div
                key={s.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-brand-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {s.id} <span className="text-slate-500 font-mono">#{s.order}</span>
                  </span>
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.isActive}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[idx] = { ...updated[idx], isActive: e.target.checked };
                        setSocialLinks(updated);
                      }}
                      className="w-4 h-4 accent-brand-500 rounded"
                    />
                    <span className={s.isActive ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {s.isActive ? "Aktif" : "Non-aktif"}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Label Tampilan</label>
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="e.g. Instagram Xora Hijab"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">URL Profil (https://)</label>
                  <input
                    type="url"
                    value={s.href}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[idx] = { ...updated[idx], href: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">Handle / Nama Akun</label>
                  <input
                    type="text"
                    value={s.handle}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[idx] = { ...updated[idx], handle: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="@username"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-300 text-xs"
                  />
                </div>

                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[260px]">{s.href}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveSocialLinks}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Tautan Sosial ke Database</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: TARIF & BIAYA LAYANAN JASA DESAIN & SUBLIMASI */}
      {!loading && activeTab === "pricing" && (
        <form onSubmit={handleSavePricing} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Pengaturan Tarif Layanan & Jasa Desain (CMS Manajemen)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur biaya jasa desain grafis, tarif cetak sublimasi per meter, dan kebijakan revisi secara dinamis untuk seluruh simulator publik & keranjang belanja.
              </p>
            </div>

            {pricingSuccess && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tarif Berhasil Disimpan & Berlaku Realtime!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kartu 1: Jasa Desain Grafis */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Tarif Jasa Desain Tim Texora</h3>
                    <span className="text-[11px] text-slate-400">Biaya per motif / SPK</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-accent-cyan bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {formatRupiah(pricingForm.designServiceFee)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Biaya Jasa Desain (Rupiah) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={pricingForm.designServiceFee}
                    onChange={(e) => setPricingForm({ ...pricingForm, designServiceFee: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-10 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Biaya ini otomatis dikenakan jika pelanggan memilih &quot;Jasa Desain Tim Texora&quot; di simulator sublimasi.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Judul Layanan Tampilan Publik
                </label>
                <input
                  type="text"
                  value={pricingForm.designServiceTitle}
                  onChange={(e) => setPricingForm({ ...pricingForm, designServiceTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Deskripsi / Cakupan Layanan
                </label>
                <textarea
                  rows={2}
                  value={pricingForm.designServiceDescription}
                  onChange={(e) => setPricingForm({ ...pricingForm, designServiceDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Kartu 2: Tarif Cetak Sublimasi & Kebijakan */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-accent-cyan/20 text-accent-cyan">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Tarif Cetak Sublimasi Rotary</h3>
                    <span className="text-[11px] text-slate-400">Biaya per meter lari</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {formatRupiah(pricingForm.sublimationPrintFee)} /m
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Biaya Cetak & Rotary Heatpress per Meter (Rupiah) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={pricingForm.sublimationPrintFee}
                    onChange={(e) => setPricingForm({ ...pricingForm, sublimationPrintFee: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-10 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Biaya cetak per meter yang digunakan di simulator kustom sublimasi dan katalog kain.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Ketentuan Revisi & Proofing Desain
                </label>
                <textarea
                  rows={3}
                  value={pricingForm.revisionPolicy}
                  onChange={(e) => setPricingForm({ ...pricingForm, revisionPolicy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sinkronisasi Otomatis ke Storefront</span>
                </div>
                <p className="text-[11px]">
                  Nilai tarif di atas langsung terhubung ke simulator kustom sublimasi, rincian biaya keranjang belanja, dan invoice checkout.
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pricingSaving}
              className="px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl shadow-brand-500/25 transition-all"
            >
              {pricingSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Simpan & Terapkan Tarif Layanan</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL HERO SLIDE */}
      {modalType === "hero" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "Edit Hero Slide" : "Tambah Hero Slide Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tag / Kategori Slide</label>
                <input
                  type="text"
                  required
                  value={heroForm.tag}
                  onChange={(e) => setHeroForm({ ...heroForm, tag: e.target.value })}
                  placeholder="e.g. Mesin Cetak Sublim Digital"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Pabrik / Caption</label>
                <textarea
                  rows={2}
                  required
                  value={heroForm.caption}
                  onChange={(e) => setHeroForm({ ...heroForm, caption: e.target.value })}
                  placeholder="e.g. “Operator mengalibrasi profil warna ICC...”"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">SEO Alt Description</label>
                <input
                  type="text"
                  required
                  value={heroForm.alt}
                  onChange={(e) => setHeroForm({ ...heroForm, alt: e.target.value })}
                  placeholder="Deskripsi gambar untuk SEO Google"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Gambar Utama</label>
                  <input
                    type="text"
                    required
                    value={heroForm.mainImage}
                    onChange={(e) => setHeroForm({ ...heroForm, mainImage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Gambar Detail</label>
                  <input
                    type="text"
                    required
                    value={heroForm.secondaryImage}
                    onChange={(e) => setHeroForm({ ...heroForm, secondaryImage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor Urutan</label>
                  <input
                    type="number"
                    min={1}
                    value={heroForm.order}
                    onChange={(e) => setHeroForm({ ...heroForm, order: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveHero"
                    checked={heroForm.isActive}
                    onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                    className="w-4 h-4 accent-brand-500 rounded"
                  />
                  <label htmlFor="isActiveHero" className="text-slate-300 font-semibold cursor-pointer">
                    Aktifkan Slide di Homepage
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold"
                >
                  Simpan Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TESTIMONIAL */}
      {modalType === "testimonial" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "Edit Testimoni" : "Tambah Testimoni Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Klien / PIC</label>
                <input
                  type="text"
                  required
                  value={testiForm.name}
                  onChange={(e) => setTestiForm({ ...testiForm, name: e.target.value })}
                  placeholder="e.g. Budi Kurniawan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Perusahaan / Brand &amp; Kota</label>
                <input
                  type="text"
                  required
                  value={testiForm.org}
                  onChange={(e) => setTestiForm({ ...testiForm, org: e.target.value })}
                  placeholder="e.g. Apex Athletic Apparel, Bandung"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Ulasan</label>
                <textarea
                  rows={3}
                  required
                  value={testiForm.quote}
                  onChange={(e) => setTestiForm({ ...testiForm, quote: e.target.value })}
                  placeholder="Kesan terhadap kualitas kain, konsistensi warna sublimasi..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold"
                >
                  Simpan Testimoni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FAQ */}
      {modalType === "faq" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pertanyaan</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. Berapa resolusi minimal file untuk sublimasi?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jawaban Lengkap</label>
                <textarea
                  rows={4}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Penjelasan teknis dan prosedural..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold"
                >
                  Simpan Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
