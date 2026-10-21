"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Layers,
  Sliders,
  Sparkles,
  X,
  ExternalLink,
  Share2,
  BookOpen,
  Activity,
  Shuffle,
  Languages,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ImageUpload } from "@/components/common/ImageUpload";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { RichContent } from "@/components/common/RichContent";
import { SeoHealthPanel } from "@/components/common/SeoHealthPanel";
import { RedirectManager } from "@/components/common/RedirectManager";
import { TranslationManager } from "@/components/common/TranslationManager";
import ArticleManager from "./ArticleManager";
import { CmsTabBar } from "@/components/portal/CmsTabBar";

type TabType =
  | "hero"
  | "testimonials"
  | "faqs"
  | "content"
  | "social"
  | "pricing"
  | "pages"
  | "artikel"
  | "seo"
  | "translations";

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

/**
 * Modul halaman yang dapat dinonaktifkan dari dashboard.
 * Sumber data: `seo.pages[path].enabled` (sumber tunggal, sinkron dengan tab SEO & AI).
 */
const MODULE_TOGGLES: Array<{ path: string; label: string; description: string }> = [
  {
    path: "/custom-sublimation",
    label: "Kustom Sublimasi",
    description:
      "Simulator visualizer & pemesanan sublimasi kustom. Menu nav disembunyikan, halaman menampilkan pesan tidak tersedia, dan modul dikeluarkan dari sitemap.",
  },
  {
    path: "/track-order",
    label: "Lacak Pesanan",
    description:
      "Halaman pelacakan SPK & nomor resi kargo. Menu nav disembunyikan dan modul dikeluarkan dari sitemap.",
  },
  {
    path: "/catalog",
    label: "Katalog Produk",
    description:
      "Katalog kain sublimasi. Menonaktifkan modul menyembunyikan katalog dari navigasi dan search engine.",
  },
  {
    path: "/about",
    label: "Tentang Kami",
    description:
      "Profil perusahaan & kapasitas produksi. Disembunyikan dari navigasi dan sitemap.",
  },
  {
    path: "/contact",
    label: "Hubungi Kami",
    description:
      "Form kontak & informasi penjualan B2B. Disembunyikan dari navigasi dan sitemap.",
  },
];

function ContentManagementInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("hero");

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab && ["hero","testimonials","faqs","content","social","pricing","pages","artikel","seo","catalog","translations"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItemData[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(DEFAULT_SOCIAL_FORM);

  // Modals state
  const [modalType, setModalType] = useState<"hero" | "testimonial" | "faq" | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [seoData, setSeoData] = useState<any>(null);
  const [seoSelectedPage, setSeoSelectedPage] = useState<string>("/");
  const [currentRole, setCurrentRole] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated && d.user) setCurrentRole(d.user.role);
      })
      .catch(() => {});
  }, []);
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

  const [pagesData, setPagesData] = useState({
    aboutHeroImage: "/images/hero/hero-rotary.jpg",
    aboutTitle: "Satu atap, dari bahan mentah hingga gulungan siap kargo.",
    aboutDescription:
      "Berpusat di Tugu Utara, Tanjung Priok, Jakarta Utara, kami menggabungkan penyediaan kain poliester siap sublimasi dengan jasa cetak roll-ke-roll.",
    aboutCaption: "“Kalender rotary 210°C mengunci tinta dispersi ke dalam serat benang, menghasilkan warna yang menyatu — bukan menempel di permukaan kain.”",
    contactAddress: "Tugu Utara, Tanjung Priok, Jakarta Utara",
    contactEmail: "sales@texora.co.id",
    contactPhone: "+62 878-8985-6066",
    footerCopyright: "© 2026 PT. Texora Visi Prima. All rights reserved.",
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

      // Load SEO settings
      fetch("/api/seo")
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && d.data) {
            setSeoData(d.data);
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

        const pagesRow = json.data.siteContent?.find((s: any) => s.key === "site.pages");
        if (pagesRow?.value) {
          try {
            setPagesData((prev) => ({ ...prev, ...JSON.parse(pagesRow.value) }));
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

  const handleSavePagesContent = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "siteContent",
          data: {
            key: "site.pages",
            group: "pages",
            label: "Konten Halaman Statis (About/Contact/Footer)",
            value: JSON.stringify(pagesData),
          },
        }),
      });
      showNotice("success", "Konten halaman statis berhasil disimpan!");
      await loadData();
    } catch (err: any) {
      showNotice("error", err.message || "Gagal menyimpan konten halaman.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleModule = async (path: string) => {
    if (!seoData) return;
    const currentEnabled = seoData.pages?.[path]?.enabled !== false;
    const nextEnabled = !currentEnabled;

    // Optimistic update
    const optimistic = {
      ...seoData,
      pages: {
        ...seoData.pages,
        [path]: { ...seoData.pages[path], enabled: nextEnabled },
      },
    };
    setSeoData(optimistic);
    setSubmitting(true);

    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: optimistic }),
      });
      const json = await res.json();
      if (json?.success) {
        setSeoData(json.data);
        showNotice(
          "success",
          `Modul ${path} berhasil ${nextEnabled ? "diaktifkan" : "dinonaktifkan"}.`
        );
      } else {
        // Rollback
        setSeoData(seoData);
        showNotice("error", json?.error || "Gagal mengubah visibilitas modul.");
      }
    } catch (err: any) {
      setSeoData(seoData);
      showNotice("error", err.message || "Gagal mengubah visibilitas modul.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSeo = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: seoData }),
      });
      const json = await res.json();
      if (json?.success) {
        setSeoData(json.data);
        showNotice("success", "Pengaturan SEO berhasil disimpan!");
      } else {
        showNotice("error", json?.error || "Gagal menyimpan SEO.");
      }
    } catch (err: any) {
      showNotice("error", err.message || "Gagal menyimpan SEO.");
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

  const CMS_GUIDE_DETAILS: Record<
    string,
    { title: string; desc: string; steps: string[]; fields?: { label: string; hint: string }[]; tips?: string[] }
  > = {
    hero: {
      title: "Panduan Hero Slider",
      desc: "Modul untuk mengelola slide showcase utama di homepage. Slide berputar otomatis dengan efek crossfade.",
      steps: [
        "Klik 'Tambah Slide Baru' untuk membuat slide.",
        "Isi kolom sesuai penjelasan di bawah.",
        "Klik Simpan. Edit/hapus slide via ikon di kartu slide.",
        "Gunakan preview gambar untuk memastikan tampilan.",
      ],
      fields: [
        { label: "Tag / Kategori", hint: "Label kecil di atas slide, mis. 'Mesin Cetak Sublim Digital'." },
        { label: "Caption", hint: "Kalimat penjelas slide, ditampilkan di bawah judul." },
        { label: "SEO Alt", hint: "Teks alternatif gambar untuk SEO & aksesibilitas." },
        { label: "URL Gambar Utama", hint: "Gambar utama slide (kiri/large)." },
        { label: "URL Gambar Detail", hint: "Gambar pendukung (kanan/kecil)." },
        { label: "Nomor Urutan", hint: "Urutan tampil slide (1 tampil pertama)." },
        { label: "Aktif", hint: "Nonaktifkan untuk menyembunyikan slide tanpa menghapus." },
      ],
    },
    testimonials: {
      title: "Panduan Testimoni Mitra",
      desc: "Modul untuk mengelola ulasan mitra yang tampil di homepage.",
      steps: [
        "Klik 'Tambah Testimoni' untuk menambah ulasan.",
        "Isi kolom sesuai penjelasan di bawah.",
        "Edit/hapus via ikon di kartu testimoni.",
        "Non-aktifkan testimoni yang tidak ingin ditampilkan.",
      ],
      fields: [
        { label: "Nama", hint: "Nama pemberi ulasan, mis. 'Budi Kurniawan'." },
        { label: "Organisasi", hint: "Nama perusahaan mitra, mis. 'Apex Athletic Apparel'." },
        { label: "Kutipan", hint: "Isi ulasan/quote yang tampil." },
        { label: "Urutan", hint: "Urutan tampil testimoni." },
        { label: "Aktif", hint: "Nonaktifkan untuk menyembunyikan tanpa menghapus." },
      ],
    },
    faqs: {
      title: "Panduan FAQ",
      desc: "Modul untuk mengelola daftar pertanyaan umum dengan penyunting teks kaya (rich text).",
      steps: [
        "Klik 'Tambah Pertanyaan' untuk menambah FAQ.",
        "Tulis pertanyaan pada kolom Pertanyaan.",
        "Susun jawaban pada editor kaya: tebal, miring, heading, daftar, tautan, atau blok kode.",
        "Klik Simpan Pertanyaan.",
        "Edit/hapus via ikon di item FAQ.",
      ],
      fields: [
        { label: "Pertanyaan", hint: "Pertanyaan yang sering ditanyakan pelanggan." },
        { label: "Jawaban Lengkap", hint: "Editor teks kaya. Mendukung heading, daftar poin/nomor, kutipan, tautan, dan kode. Konten otomatis disanitasi (anti-XSS)." },
        { label: "Urutan", hint: "Urutan tampil pertanyaan." },
        { label: "Aktif", hint: "Nonaktifkan untuk menyembunyikan." },
      ],
    },
    content: {
      title: "Panduan Statistik & Banner B2B",
      desc: "Modul untuk mengatur metrik statistik pabrik dan banner CTA B2B di homepage.",
      steps: [
        "Ubah nilai & label statistik (3 metrik).",
        "Ubah judul, deskripsi, teks tombol, dan link banner B2B.",
        "Klik 'Simpan Perubahan Teks' untuk menerapkan.",
      ],
      fields: [
        { label: "Metrik (Nilai & Label)", hint: "Angka pencapaian, mis. nilai '10.000 m', label 'Kapasitas harian'." },
        { label: "Judul Penawaran B2B", hint: "Judul banner CTA bagian bawah homepage." },
        { label: "Deskripsi Fasilitas", hint: "Penjelasan singkat fasilitas B2B." },
        { label: "Teks Tombol", hint: "Label tombol, mis. 'Minta penawaran'." },
        { label: "Tautan Aksi", hint: "Tujuan link saat tombol diklik." },
      ],
    },
    social: {
      title: "Panduan Media Sosial",
      desc: "Modul untuk mengelola tautan media sosial storefront (footer & floating dock).",
      steps: [
        "Ubah Label, URL (https://), dan Handle akun.",
        "Aktifkan/non-aktifkan toggle untuk menyembunyikan ikon.",
        "Klik 'Simpan Tautan Sosial ke Database'.",
      ],
      fields: [
        { label: "Label Tampilan", hint: "Nama akun yang tampil, mis. 'Instagram Xora Hijab'." },
        { label: "URL Profil", hint: "Harus diawali https://." },
        { label: "Handle", hint: "Username akun, mis. '@xora_hijab'." },
        { label: "Aktif", hint: "Nonaktifkan untuk menyembunyikan ikon." },
      ],
    },
    pricing: {
      title: "Panduan Tarif & Jasa Desain",
      desc: "Modul untuk mengatur tarif layanan secara dinamis.",
      steps: [
        "Ubah biaya jasa desain dan tarif cetak sublimasi per meter.",
        "Ubah judul layanan, deskripsi, dan kebijakan revisi.",
        "Klik 'Simpan & Terapkan Tarif Layanan'.",
        "Nilai otomatis tersinkron ke simulator & keranjang.",
      ],
      fields: [
        { label: "Biaya Jasa Desain", hint: "Harga jasa desain per motif/SPK (Rupiah)." },
        { label: "Judul Layanan", hint: "Nama layanan yang tampil di storefront." },
        { label: "Deskripsi Layanan", hint: "Cakupan layanan jasa desain." },
        { label: "Tarif Cetak/m", hint: "Biaya cetak & rotary heatpress per meter." },
        { label: "Ketentuan Revisi", hint: "Kebijakan revisi & proofing desain." },
      ],
    },
    pages: {
      title: "Panduan Halaman Statis & Visibilitas Modul",
      desc: "Modul untuk mengelola konten halaman About, Contact, Footer, sekaligus mengaktifkan atau menonaktifkan modul website (Kustom Sublimasi, Lacak Pesanan, Katalog, Tentang Kami, Hubungi Kami) langsung dari dashboard.",
      steps: [
        "Bagian 'Visibilitas Modul Halaman': geser toggle untuk mengaktifkan/menonaktifkan modul. Perubahan langsung tersimpan (tidak perlu klik tombol simpan).",
        "Ubah URL gambar hero About, judul, deskripsi, caption.",
        "Ubah alamat, email, telepon untuk halaman Contact.",
        "Ubah copyright footer.",
        "Klik 'Simpan Konten Halaman'.",
      ],
      fields: [
        { label: "Toggle Visibilitas", hint: "Hanya Administrator yang bisa mengubah. Modul nonaktif: menu nav hilang, halaman menampilkan 'Halaman sedang tidak tersedia', dan modul dikeluarkan dari sitemap." },
        { label: "URL Gambar Hero About", hint: "Gambar utama halaman Tentang Kami." },
        { label: "Judul About", hint: "Judul utama bagian profil." },
        { label: "Deskripsi About", hint: "Paragraf penjelasan profil perusahaan." },
        { label: "Caption/Quote", hint: "Kutipan di atas gambar." },
        { label: "Alamat/Email/Telepon", hint: "Info kontak halaman Hubungi Kami." },
        { label: "Copyright Footer", hint: "Teks hak cipta di footer." },
      ],
    },
    artikel: {
      title: "Panduan Artikel & Pusat Panduan Tekstil",
      desc: "Modul untuk menulis artikel edukatif yang menjangkau calon buyer sebelum mereka siap menawar. Setiap artikel bisa ditautkan ke produk katalog dan diakhiri ajakan meminta penawaran.",
      steps: [
        "Klik 'Tulis Artikel Baru' untuk membuat artikel.",
        "Isi judul (kunci SEO), ringkasan, dan isi artikel dengan Heading 2/3 agar daftar isi otomatis.",
        "Pilih kategori & tipe, lalu hubungkan kain yang dibahas ke produk katalog.",
        "Gunakan tombol 'Preview' untuk melihat tampilan sebelum disimpan.",
        "Klik 'Simpan & Terbitkan' agar tayang, atau 'Simpan Draft' untuk menyimpan dulu.",
        "Terjemahan ke 5 bahasa lain dibuat otomatis di background setelah disimpan.",
      ],
      fields: [
        { label: "Judul Artikel", hint: "Targetkan satu kata kunci utama, mis. 'cara memilih kain sublimasi'." },
        { label: "Ringkasan (Excerpt)", hint: "1-2 kalimat, dipakai di kartu artikel dan meta description." },
        { label: "Kategori", hint: "Mengikuti taksonomi kain: sportswear, hijab, home living, merchandise, proses." },
        { label: "Kain yang Dibahas", hint: "Menautkan artikel ke produk katalog untuk internal linking dan konversi." },
        { label: "SEO & Penulis", hint: "Opsional: SEO title/description khusus + nama & jabatan penulis." },
      ],
    },
    seo: {
      title: "Panduan SEO & AI Settings",
      desc: "Modul untuk mengelola metadata SEO, structured data, dan kesiapan AI crawler agar konten ramah Google, ChatGPT, Claude, Perplexity, dan mesin pencari lain.",
      steps: [
        "Buka 'SEO & AI Health Check' di bagian atas untuk melihat skor & temuan audit.",
        "Pilih halaman dari daftar untuk mengedit metadata.",
        "Isi Meta Title (maks 60) & Description (maks 160).",
        "Isi Excerpt - ini yang dikutip oleh AI assistant saat menjawab pertanyaan pengguna.",
        "Pilih tipe schema yang sesuai (Product untuk katalog, FAQ untuk halaman FAQ).",
        "Klik 'Simpan Pengaturan SEO'.",
        "Klik 'Audit Ulang' untuk memastikan skor membaik.",
      ],
      fields: [
        { label: "SEO & AI Health Check", hint: "Skor 0-100 yang menilai metadata, structured data, AI-readiness (llms.txt, AI Plugin, allowlist crawler), technical SEO, dan kelengkapan konten." },
        { label: "Meta Title", hint: "Judul di hasil pencarian, ideal 15-60 karakter." },
        { label: "Meta Description", hint: "Ringkasan di hasil pencarian, ideal 120-160 karakter." },
        { label: "Excerpt", hint: "Ringkasan singkat untuk kutipan bot AI. Wajib diisi agar AI dapat mengutip konten Anda dengan akurat." },
        { label: "Tipe Schema", hint: "Structured data: Article/FAQ/Product/Organization. Mengaktifkan rich result Google." },
        { label: "Custom Slug", hint: "URL ramah SEO (opsional)." },
        { label: "Status Aktif", hint: "Hanya Administrator yang dapat mengubah. Modul nonaktif otomatis noindex & dikeluarkan dari sitemap." },
      ],
    },
  };

  const CMS_MODULE_TIPS: Record<string, string[]> = {
    hero: [
      "Gunakan resolusi tinggi (min 1920px) dan rasio 16:9 untuk gambar utama agar tajam di layar besar.",
      "Batasi teks pada slide: satu pesan utama per slide agar mudah dicerna.",
      "Urutkan slide paling penting di urutan pertama.",
      "Sertakan CTA yang jelas dan arahkan ke halaman yang relevan.",
    ],
    testimonials: [
      "Pilih ulasan yang spesifik dan menyebut manfaat nyata (angka, hasil).",
      "Gunakan nama asli + perusahaan untuk meningkatkan kepercayaan.",
      "Rutin perbarui testimoni agar terlihat aktif.",
    ],
    faqs: [
      "Gunakan pertanyaan yang benar-benar sering ditanya pelanggan.",
      "Jawab singkat, jelas, dan langsung ke inti.",
      "Manfaatkan FAQ untuk SEO: jawaban yang baik bisa tampil di 'People Also Ask' Google.",
      "Pakai editor kaya untuk memecah jawaban panjang menjadi daftar poin agar mudah dipindai.",
      "Tambahkan tautan ke halaman katalog atau contact dari dalam jawaban untuk memberi CTA internal.",
    ],
    content: [
      "Angka statistik harus realistis dan bisa dipertanggungjawabkan.",
      "Judul banner B2B harus mengandung kata kunci layanan utama.",
    ],
    social: [
      "Pastikan semua URL mengarah ke profil yang benar.",
      "Nonaktifkan platform yang tidak aktif agar tidak terkesan kosong.",
    ],
    pricing: [
      "Tetapkan tarif yang kompetitif dan konsisten dengan katalog.",
      "Jelaskan kebijakan revisi agar tidak ada miskomunikasi.",
    ],
    pages: [
      "Tulis deskripsi profil perusahaan dengan kata kunci lokasi & layanan.",
      "Sertakan info kontak yang lengkap dan akurat.",
      "Matikan modul yang belum siap tayang agar pengunjung tidak menemukan halaman kosong.",
      "Setelah mengaktifkan modul, cek di tab SEO & AI bahwa metadata halaman sudah sesuai.",
      "Perubahan toggle bersifat instan — tidak perlu menekan tombol simpan.",
    ],
    artikel: [
      "Tulis artikel untuk pertanyaan yang sering masuk ke tim sales, bukan untuk sekadar mengulang deskripsi produk.",
      "Setiap artikel harus ditautkan ke minimal satu produk katalog (field 'Kain yang Dibahas').",
      "Akhiri dengan ajakan bertindak: tombol Minta Penawaran & Unduh Katalog PDF sudah terpasang otomatis.",
      "Gunakan Heading 2 dan 3, jangan Heading 1, supaya struktur artikel rapi dan daftar isi terbentuk.",
      "Jadwalkan publikasi bertahap agar website selalu punya konten baru tanpa menumpuk.",
    ],
    seo: [
      "Tulis Meta Title < 60 karakter dan Meta Description < 160 karakter.",
      "Gunakan kata kunci utama di awal title dan description.",
      "Pilih schema sesuai jenis konten agar AI memahami struktur data.",
      "Excerpt adalah bahan kutipan AI assistant - tulis dalam 1-2 kalimat yang factually lengkap.",
      "Website sudah menyediakan /llms.txt, /llms-full.txt, dan manifest AI Plugin secara otomatis.",
      "20 AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, dll) sudah diizinkan di robots.txt.",
      "Pantau skor SEO & AI Health Check secara berkala - targetkan Grade A (90+).",
    ],
  };

  const CMS_SEO_TIPS: Record<string, string[]> = {
    artikel: [
      "Satu artikel = satu kata kunci utama. Jangan menggabungkan topik dalam satu artikel.",
      "Gunakan Heading 2/3 yang mengandung kata kunci turunan, misalnya 'Setting Heat Press 210 Derajat'.",
      "Isi meta description dengan ringkasan yang menyebut sumber produk Texora.",
      "Tambahkan tautan ke produk katalog agar artikel memperkuat topical authority.",
      "Artikel yang menyebut angka teknis (suhu, GSM, MOQ) lebih banyak dikutip AI assistant.",
    ],
    hero: [
      "Isi kolom SEO Alt dengan deskripsi gambar yang mengandung kata kunci.",
      "Nama file gambar sebaiknya deskriptif, bukan IMG_001.jpg.",
    ],
    testimonials: [
      "Testimoni dengan kata kunci produk akan memperkuat sinyal SEO lokal.",
    ],
    faqs: [
      "Gunakan markup FAQPage (tersedia di tab SEO & AI) agar jawaban bisa jadi rich result.",
    ],
    content: [
      "Sertakan kata kunci di judul dan deskripsi banner B2B.",
    ],
    social: [
      "Konsistensi nama akun memperkuat branding dan kepercayaan.",
    ],
    pricing: [
      "Harga yang jelas membantu Google menampilkan info akurat di hasil pencarian.",
    ],
    pages: [
      "Gunakan heading (judul) yang berjenjang dan mengandung kata kunci.",
      "Tambahkan structured data Organization agar profil perusahaan terbaca AI.",
      "Modul yang dinonaktifkan otomatis diberi meta robots noindex dan dikeluarkan dari sitemap.xml.",
      "Aktifkan kembali modul beserta metadata SEO-nya agar ranking tidak ikut hilang.",
    ],
    seo: [
      "Pastikan sitemap.xml dan robots.txt diperbarui otomatis.",
      "Gunakan structured data (JSON-LD) untuk Article/FAQ/Product/Breadcrumb.",
      "Izinkan AI crawler (GPTBot, PerplexityBot) merayapi halaman publik.",
    ],
  };

  const CMS_GUIDES: Record<string, string> = {
    hero: "Kelola slide utama homepage. Tambah/edit/hapus slide, atur gambar utama & detail, tag, caption, urutan, dan status aktif. Klik 'Tambah Slide Baru' untuk membuat slide baru.",
    testimonials: "Kelola ulasan mitra yang tampil di homepage. Tambah testimoni, edit kutipan/nama/organisasi, atur urutan, dan status aktif.",
    faqs: "Kelola daftar pertanyaan umum. Tambah/edit/hapus pertanyaan & jawaban, atur urutan dan status aktif.",
    content: "Atur metrik statistik pabrik (angka & label) dan banner CTA B2B (judul, deskripsi, teks tombol, link). Klik 'Simpan Perubahan Teks' untuk menerapkan.",
    social: "Kelola tautan media sosial storefront (label, URL, handle, aktif/non-aktif). Klik 'Simpan Tautan Sosial ke Database' setelah mengubah.",
    pricing: "Atur tarif jasa desain, tarif cetak sublimasi per meter, judul layanan, dan kebijakan revisi. Nilai langsung tersinkron ke simulator & keranjang.",
    pages: "Kelola konten halaman statis: gambar & teks About, info kontak, dan copyright footer. Klik 'Simpan Konten Halaman' setelah mengubah.",
    seo: "Atur metadata SEO & AI: meta title, description, excerpt, tipe schema, dan slug per halaman. Lihat preview hasil pencarian Google secara langsung.",
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
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Panduan penggunaan"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>Panduan</span>
          </button>
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

      {/* Tab bar horizontal (selalu terlihat, tidak menunggu data) */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <CmsTabBar activeTab={activeTab} />
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
                  <RichContent
                    html={faq.answer}
                    className="text-xs text-slate-400 pl-7 leading-relaxed"
                  />
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
        <div className="space-y-6 w-full">
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* TAB 7: HALAMAN STATIS */}
      {!loading && activeTab === "pages" && (
        <div className="space-y-6 w-full">
          {/* VISIBILITAS MODUL - Nonaktifkan modul dari dashboard */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-brand-400" />
                  Visibilitas Modul Halaman
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Matikan modul yang belum siap dipakai. Modul nonaktif akan hilang dari menu
                  navigasi, menampilkan halaman &quot;Halaman sedang tidak tersedia&quot; saat
                  diakses langsung, dan dikeluarkan dari sitemap search engine.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {MODULE_TOGGLES.map((mod) => {
                const enabled = seoData?.pages?.[mod.path]?.enabled !== false;
                const canToggle = currentRole === "ADMINISTRATOR";
                return (
                  <div
                    key={mod.path}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{mod.label}</span>
                        <code className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                          {mod.path}
                        </code>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            enabled
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {enabled ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    {canToggle ? (
                      <button
                        type="button"
                        onClick={() => handleToggleModule(mod.path)}
                        disabled={submitting}
                        title={enabled ? "Klik untuk menonaktifkan modul" : "Klik untuk mengaktifkan modul"}
                        className={`relative w-12 h-6 rounded-full shrink-0 transition-colors disabled:opacity-50 ${
                          enabled ? "bg-emerald-500" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            enabled ? "translate-x-[1.5rem]" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 shrink-0 text-right leading-tight">
                        Hanya Administrator
                        <br />
                        yang dapat mengubah
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {currentRole !== "ADMINISTRATOR" && (
              <p className="text-[10px] text-amber-400/80 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Anda dapat melihat status modul, namun hanya Administrator yang dapat
                  mengaktifkan atau menonaktifkannya.
                </span>
              </p>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Konten Halaman About</h3>
            <div className="space-y-3 text-xs">
              <div>
                <ImageUpload
                  label="Gambar Hero About"
                  value={pagesData.aboutHeroImage}
                  onChange={(url) => setPagesData({ ...pagesData, aboutHeroImage: url })}
                  onError={(m) => showNotice("error", m)}
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul About</label>
                <input value={pagesData.aboutTitle} onChange={(e) => setPagesData({ ...pagesData, aboutTitle: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi About</label>
                <textarea rows={3} value={pagesData.aboutDescription} onChange={(e) => setPagesData({ ...pagesData, aboutDescription: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caption/Quote About</label>
                <textarea rows={2} value={pagesData.aboutCaption} onChange={(e) => setPagesData({ ...pagesData, aboutCaption: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Konten Halaman Contact</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alamat</label>
                <input value={pagesData.contactAddress} onChange={(e) => setPagesData({ ...pagesData, contactAddress: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input value={pagesData.contactEmail} onChange={(e) => setPagesData({ ...pagesData, contactEmail: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telepon/WhatsApp</label>
                <input value={pagesData.contactPhone} onChange={(e) => setPagesData({ ...pagesData, contactPhone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Footer</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Copyright Footer</label>
                <input value={pagesData.footerCopyright} onChange={(e) => setPagesData({ ...pagesData, footerCopyright: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSavePagesContent}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Konten Halaman</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW GAMBAR */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* MODAL PANDUAN */}
      {showGuide && CMS_GUIDE_DETAILS[activeTab] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full max-h-[85vh] overflow-y-auto glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-400" />
                {CMS_GUIDE_DETAILS[activeTab].title}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{CMS_GUIDE_DETAILS[activeTab].desc}</p>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Langkah-langkah</p>
              <ol className="space-y-2 text-xs text-slate-200 list-decimal list-inside">
                {CMS_GUIDE_DETAILS[activeTab].steps.map((s, i) => (
                  <li key={i} className="leading-relaxed">{s}</li>
                ))}
              </ol>
            </div>
            {CMS_GUIDE_DETAILS[activeTab].fields && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Penjelasan Kolom</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {CMS_GUIDE_DETAILS[activeTab].fields!.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-brand-400 font-bold shrink-0">{f.label}:</span>
                      <span className="text-slate-300 leading-relaxed">{f.hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2 rounded-xl bg-brand-500/5 border border-brand-500/20 p-3">
              <p className="text-[10px] uppercase font-bold text-brand-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Tips Pengelolaan Profesional
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {(CMS_MODULE_TIPS[activeTab] || []).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
              <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Tips SEO &amp; AI Optimizer
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {(CMS_SEO_TIPS[activeTab] || []).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SEO & AI SETTINGS */}
      {/* TAB: ARTIKEL / PUSAT PANDUAN TEKSTIL */}
      {!loading && activeTab === "artikel" && (
        <section aria-label="Manajemen Artikel">
          <div className="mb-4">
            <h2 className="text-lg font-display font-bold text-white">
              Artikel &amp; Pusat Panduan Tekstil
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Artikel edukatif yang menjangkau calon buyer sebelum mereka siap
              menawar. Tiap artikel bisa ditautkan ke produk katalog dan diakhiri
              CTA &quot;Minta Penawaran&quot;. Setelah disimpan, isi diterjemahkan
              otomatis ke 5 bahasa lain (English, 中文, 日本語, Deutsch, العربية).
            </p>
          </div>
          <ArticleManager />
        </section>
      )}

      {!loading && activeTab === "seo" && seoData && (
        <div className="space-y-6 w-full">
          {/* SEO & AI Health Check */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                SEO &amp; AI Health Check
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Pemeriksaan otomatis terhadap metadata, structured data (JSON-LD), kesiapan AI
                crawler, technical SEO, dan kualitas konten. Skor diperbarui setiap Anda
                melakukan audit ulang.
              </p>
            </div>
            <SeoHealthPanel />
          </div>

          {/* Redirect Manager */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-brand-400" />
                Redirect Manager
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Alihkan URL lama ke URL baru (status 301) agar peringkat SEO tidak hilang saat
                struktur URL berubah. Perubahan berlaku otomatis tanpa deploy ulang.
              </p>
            </div>
            <RedirectManager />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Daftar Halaman */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white">Halaman</h3>
              {Object.keys(seoData.pages || {}).map((path) => {
                const enabled = seoData.pages[path]?.enabled !== false;
                return (
                  <div
                    key={path}
                    className={`rounded-xl border transition-colors ${
                      seoSelectedPage === path ? "border-brand-500/40 bg-brand-500/10" : "border-transparent hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setSeoSelectedPage(path)}
                        className="flex-1 text-left text-xs font-semibold text-slate-300 hover:text-white truncate"
                      >
                        {path}
                      </button>
                      {currentRole === "ADMINISTRATOR" ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSeoData({
                              ...seoData,
                              pages: {
                                ...seoData.pages,
                                [path]: { ...seoData.pages[path], enabled: !enabled },
                              },
                            })
                          }
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            enabled
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                          title={enabled ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                        >
                          {enabled ? "Aktif" : "Nonaktif"}
                        </button>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            enabled
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {enabled ? "Aktif" : "Nonaktif"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editor */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Editor Metadata</h3>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Meta Title (max 60)</label>
                <input
                  value={seoData.pages[seoSelectedPage]?.title || ""}
                  maxLength={60}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      pages: { ...seoData.pages, [seoSelectedPage]: { ...seoData.pages[seoSelectedPage], title: e.target.value } },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Meta Description (max 160)</label>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={seoData.pages[seoSelectedPage]?.description || ""}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      pages: { ...seoData.pages, [seoSelectedPage]: { ...seoData.pages[seoSelectedPage], description: e.target.value } },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Excerpt / Ringkasan</label>
                <textarea
                  rows={2}
                  value={seoData.pages[seoSelectedPage]?.excerpt || ""}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      pages: { ...seoData.pages, [seoSelectedPage]: { ...seoData.pages[seoSelectedPage], excerpt: e.target.value } },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Tipe Schema</label>
                <select
                  value={seoData.pages[seoSelectedPage]?.schemaType || "none"}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      pages: { ...seoData.pages, [seoSelectedPage]: { ...seoData.pages[seoSelectedPage], schemaType: e.target.value } },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                >
                  <option value="none">None</option>
                  <option value="article">Article</option>
                  <option value="faq">FAQ</option>
                  <option value="product">Product</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Custom Slug</label>
                <input
                  value={seoData.pages[seoSelectedPage]?.slug || ""}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      pages: { ...seoData.pages, [seoSelectedPage]: { ...seoData.pages[seoSelectedPage], slug: e.target.value } },
                    })
                  }
                  placeholder="opsional"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                />
              </div>
            </div>

            {/* SERP Preview */}
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Preview Hasil Google</h3>
                <div className="bg-white rounded-xl p-4 text-[#1a0dab]">
                  <p className="text-[11px] text-[#006621] truncate">
                    {`texora.co.id${seoSelectedPage === "/" ? "" : seoSelectedPage}`}
                  </p>
                  <p className="text-base leading-snug font-medium cursor-pointer">
                    {seoData.pages[seoSelectedPage]?.title || ""}
                  </p>
                  <p className="text-xs text-[#545454] leading-snug mt-1">
                    {seoData.pages[seoSelectedPage]?.description || ""}
                  </p>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white">Pengaturan Global</h3>
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Judul Situs</label>
                <input
                  value={seoData.global?.title || ""}
                  onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, title: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <label className="text-[10px] font-bold uppercase text-slate-500 block mt-2">Keywords</label>
                <input
                  value={seoData.global?.keywords || ""}
                  onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, keywords: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <label className="text-[10px] font-bold uppercase text-slate-500 block mt-2">OG Image URL</label>
                <input
                  value={seoData.global?.ogImage || ""}
                  onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, ogImage: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveSeo}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Pengaturan SEO</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: TERJEMAHAN (AI Content Translation) */}
      {!loading && activeTab === "translations" && (
        <div className="space-y-6 w-full">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-400" />
                Manajemen Terjemahan Multi-Bahasa
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Konten CMS Anda diterjemahkan otomatis ke 5 bahasa oleh Google Gemini dan
                di-cache di database. Di sini Anda bisa memantau, menyunting manual, atau
                memicu terjemahan ulang seluruh konten.
              </p>
            </div>
            <TranslationManager />
          </div>
        </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ImageUpload
                  label="Gambar Utama"
                  value={heroForm.mainImage}
                  onChange={(url) => setHeroForm({ ...heroForm, mainImage: url })}
                  onError={(m) => showNotice("error", m)}
                />
                <ImageUpload
                  label="Gambar Detail"
                  value={heroForm.secondaryImage}
                  onChange={(url) => setHeroForm({ ...heroForm, secondaryImage: url })}
                  onError={(m) => showNotice("error", m)}
                />
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
                <RichTextEditor
                  label="Jawaban Lengkap"
                  value={faqForm.answer || ""}
                  onChange={(html) => setFaqForm({ ...faqForm, answer: html })}
                  placeholder="Penjelasan teknis dan prosedural..."
                  minHeight={180}
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

/**
 * Wrapper dengan Suspense boundary.
 * `useSearchParams()` pada halaman ini (untuk sub-tab `?tab=seo`) memaksa
 * client-side rendering, sehingga harus dibungkus Suspense agar build
 * production (static prerender) tidak gagal.
 */
export default function ContentManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8 space-y-6">
          <div className="h-10 w-64 rounded-xl bg-slate-900/60 animate-pulse" />
          <div className="h-96 rounded-3xl bg-slate-900/60 animate-pulse" />
        </div>
      }
    >
      <ContentManagementInner />
    </Suspense>
  );
}
