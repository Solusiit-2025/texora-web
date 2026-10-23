"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Send,
  Globe,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Link2,
} from "lucide-react";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { RichContent } from "@/components/common/RichContent";
import { getImageFileDimensions, isLowResolutionImage } from "@/lib/image-gallery";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  galleryImages?: string | null;
  category: string;
  articleType: string;
  tags: string;
  relatedProducts: string;
  author: string;
  authorRole: string | null;
  readMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  category: string;
}

const CATEGORIES = [
  { value: "sportswear", label: "Sportswear & Activewear" },
  { value: "hijab-fashion", label: "Fashion & Hijab" },
  { value: "home-living", label: "Home Living & Dekorasi" },
  { value: "merchandise", label: "Merchandise & Event" },
  { value: "proses", label: "Proses, Teknis & Bisnis" },
];

const TYPES = [
  { value: "panduan", label: "Panduan" },
  { value: "tips", label: "Tips" },
  { value: "case-study", label: "Studi Kasus" },
  { value: "news", label: "Berita Pabrik" },
];

/** Batas galeri gambar artikel (sinkron dengan MAX_ARTICLE_IMAGES di api). */
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per gambar

const EMPTY_FORM = {
  id: "" as string,
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  images: [] as string[],
  category: "proses",
  articleType: "panduan",
  tags: "",
  relatedProducts: [] as string[],
  author: "Tim Tekstil XoraMateria",
  authorRole: "",
  seoTitle: "",
  seoDescription: "",
  isPublished: false,
};

type FormState = typeof EMPTY_FORM;

/** "hijab-fashion" → "Hijab Fashion" */
function prettifySlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Kunci perbandingan anti-duplikat (ignore case/huruf) */
function taxKey(v: string): string {
  return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Kunci bentuk jamak: "panduans"/"panduan" dianggap sama */
function taxPluralKey(v: string): string {
  return taxKey(v).replace(/(es|s)$/, "");
}

function parseArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function ArticleManager() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ArticleRow | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Taksonomi artikel (kategori & tipe) — dikelola via /api/article-taxonomy ──
  const [categories, setCategories] = useState<{ value: string; label: string }[]>(CATEGORIES);
  const [articleTypes, setArticleTypes] = useState<{ value: string; label: string }[]>(TYPES);
  const [showTaxModal, setShowTaxModal] = useState<null | "category" | "type">(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newTaxLabel, setNewTaxLabel] = useState("");
  const [taxError, setTaxError] = useState<string | null>(null);
  const [taxWarning, setTaxWarning] = useState<string | null>(null);
  const [savingTax, setSavingTax] = useState(false);

  const notify = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  }, []);

  // ── Galeri gambar artikel (maks 5, otomatis dikonversi ke .webp) ──
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // reset agar file yang sama bisa diunggah ulang
    if (!files.length || !form) return;

    const slots = MAX_IMAGES - form.images.length;
    if (slots <= 0) {
      notify("error", `Maksimal ${MAX_IMAGES} gambar per artikel.`);
      return;
    }
    const accepted = files.slice(0, slots);
    const skipped = files.length - accepted.length;

    for (const file of accepted) {
      if (!file.type.startsWith("image/")) {
        notify("error", `"${file.name}" ditolak — hanya file gambar (JPG/PNG/WebP/GIF).`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        notify("error", `"${file.name}" melebihi batas 5MB.`);
        continue;
      }
      // Peringatan resolusi rendah — kartu besar akan tampil kurang tajam.
      const dims = await getImageFileDimensions(file);
      if (isLowResolutionImage(dims.width, dims.height)) {
        notify(
          "error",
          `"${file.name}" beresolusi ${dims.width}×${dims.height}px — agak kecil. Idealnya ≥800px (mis. 1200×800) supaya tajam di kartu.`
        );
        continue; // jangan upload gambar yang pasti pecah
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("convert", "webp"); // server mengonversi JPG/PNG/GIF → .webp
      setUploadingImages(true);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json?.success) {
          setForm((f) =>
            f && f.images.length < MAX_IMAGES ? { ...f, images: [...f.images, json.url] } : f
          );
        } else {
          notify("error", json?.error || `Gagal mengunggah "${file.name}".`);
        }
      } catch {
        notify("error", `Gagal mengunggah "${file.name}" (periksa koneksi/sesi).`);
      } finally {
        setUploadingImages(false);
      }
    }
    if (skipped > 0) {
      notify("error", `${skipped} gambar dilewati — batas ${MAX_IMAGES} gambar sudah tercapai.`);
    }
  };


  // ── Handler taksonomi: live-check + simpan via /api/article-taxonomy ──
  const handleTaxLabelChange = (value: string) => {
    setNewTaxLabel(value);
    setTaxError(null);
    const key = taxKey(value);
    if (!key) {
      setTaxWarning(null);
      return;
    }
    const list = showTaxModal === "type" ? articleTypes : categories;
    const hit = list.find((c) => taxKey(c.value) === key);
    setTaxWarning(
      hit ? `Sudah ada "${hit.label}" — gunakan yang tersedia, jangan buat variasi.` : null
    );
  };

  const handleAddTaxonomy = async () => {
    const label = newTaxLabel.trim().replace(/\s+/g, " ");
    if (!label || !showTaxModal) return;
    setSavingTax(true);
    setTaxError(null);
    try {
      const res = await fetch("/api/article-taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: showTaxModal, label }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setTaxError(json.error || "Gagal menyimpan.");
        return;
      }
      setCategories(json.categories || []);
      setArticleTypes(json.types || []);
      if (json.kind === "category") {
        setForm((f) => (f ? { ...f, category: json.item.value } : f));
      } else {
        setForm((f) => (f ? { ...f, articleType: json.item.value } : f));
      }
      setShowTaxModal(null);
      setNewTaxLabel("");
      setTaxWarning(null);
      notify("success", `${json.item.label} ditambahkan & langsung terpilih.`);
    } catch {
      setTaxError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setSavingTax(false);
    }
  };


  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/articles?admin=1", { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        setArticles(json.data || []);
      } else {
        notify("error", json?.error || "Gagal memuat artikel.");
      }
      const rows: ArticleRow[] = json?.data || [];

      const pres = await fetch("/api/products", { cache: "no-store" });
      const pjson = await pres.json();
      if (pjson?.success) {
        setProducts(
          (pjson.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            category: p.category,
          }))
        );
      }

      // Nilai legacy di artikel lama ikut masuk dropdown (label dari slug).
      appendLegacyTaxonomy(rows);

      // Taksonomi tersimpan (custom dari admin).
      const tRes = await fetch("/api/article-taxonomy", { cache: "no-store" });
      const tJson = await tRes.json();
      if (tJson?.success) {
        setCategories(tJson.categories || CATEGORIES);
        setArticleTypes(tJson.types || TYPES);
        // Slugs legacy yang belum ada di list tersimpan tetap dilengkapi.
        const savedCats = new Set((tJson.categories || []).map((c: any) => c.value));
        const savedTypes = new Set((tJson.types || []).map((c: any) => c.value));
        setCategories((prev) => {
          const extra = rows
            .map((a: ArticleRow) => a.category)
            .filter((v: string) => v && !savedCats.has(v) && !prev.some((p) => p.value === v))
            .map((v: string) => ({ value: v, label: prettifySlug(v) }));
          return extra.length ? [...prev, ...extra] : prev;
        });
        setArticleTypes((prev) => {
          const extra = rows
            .map((a: ArticleRow) => a.articleType)
            .filter((v: string) => v && !savedTypes.has(v) && !prev.some((p) => p.value === v))
            .map((v: string) => ({ value: v, label: prettifySlug(v) }));
          return extra.length ? [...prev, ...extra] : prev;
        });
      }
    } catch {
      notify("error", "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  /** Slugs legacy dari artikel lama → ditambahkan ke dropdown (label dari slug). */
  const appendLegacyTaxonomy = (rows: ArticleRow[]) => {
    const catExtras = rows
      .map((a) => a.category)
      .filter((v) => v && !CATEGORIES.some((c) => c.value === v))
      .map((v) => ({ value: v, label: prettifySlug(v) }));
    const typeExtras = rows
      .map((a) => a.articleType)
      .filter((v) => v && !TYPES.some((t) => t.value === v))
      .map((v) => ({ value: v, label: prettifySlug(v) }));
    if (catExtras.length || typeExtras.length) {
      setCategories([...CATEGORIES, ...catExtras]);
      setArticleTypes([...TYPES, ...typeExtras]);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: articles.length,
      published: articles.filter((a) => a.isPublished).length,
      draft: articles.filter((a) => !a.isPublished).length,
    }),
    [articles]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (filter === "published" && !a.isPublished) return false;
      if (filter === "draft" && a.isPublished) return false;
      if (!q) return true;
      return [a.title, a.excerpt, a.slug, ...parseArray(a.tags)].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [articles, filter, query]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setShowPreview(false);
    setShowAdvanced(false);
  };

  const openEdit = (a: ArticleRow) => {
    // Galeri: cover lama + galleryImages (dedupe, maks 5) — backward-compat.
    const legacyImages = [
      ...(a.coverImage ? [a.coverImage] : []),
      ...parseArray(a.galleryImages),
    ].filter((v, i, arr) => v && arr.indexOf(v) === i);
    setForm({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      body: a.body,
      images: legacyImages.slice(0, MAX_IMAGES),
      category: a.category,
      articleType: a.articleType,
      tags: parseArray(a.tags).join(", "),
      relatedProducts: parseArray(a.relatedProducts),
      author: a.author || "Tim Tekstil XoraMateria",
      authorRole: a.authorRole || "",
      seoTitle: a.seoTitle || "",
      seoDescription: a.seoDescription || "",
      isPublished: a.isPublished,
    });
    setShowPreview(false);
    setShowAdvanced(false);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async (publish?: boolean) => {
    if (!form) return;
    if (!form.title.trim()) {
      notify("error", "Judul artikel wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
        coverImage: form.images[0] || null,
        galleryImages: form.images,
        category: form.category,
        articleType: form.articleType,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        relatedProducts: form.relatedProducts,
        author: form.author,
        authorRole: form.authorRole || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        isPublished: publish ?? form.isPublished,
      };

      const isNew = !form.id;
      const res = await fetch("/api/cms", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          ...(isNew ? { data: payload } : { id: form.id, data: payload }),
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        notify("error", json?.error || "Gagal menyimpan artikel.");
        return;
      }

      notify(
        "success",
        isNew
          ? "Artikel dibuat. Terjemahan ke 5 bahasa dijalankan di background."
          : "Artikel diperbarui."
      );
      setForm(null);
      await load();
    } catch {
      notify("error", "Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (a: ArticleRow) => {
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          id: a.id,
          data: {
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            body: a.body,
            coverImage: a.coverImage,
            category: a.category,
            articleType: a.articleType,
            tags: parseArray(a.tags),
            relatedProducts: parseArray(a.relatedProducts),
            author: a.author,
            authorRole: a.authorRole,
            seoTitle: a.seoTitle,
            seoDescription: a.seoDescription,
            isPublished: !a.isPublished,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        notify("error", json?.error || "Gagal mengubah status publikasi.");
        return;
      }
      notify(
        "success",
        !a.isPublished ? "Artikel dipublikasikan." : "Artikel dijadikan draft."
      );
      await load();
    } catch {
      notify("error", "Gagal mengubah status publikasi.");
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch("/api/cms?type=article&id=${confirmDelete.id}", {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        notify("error", json?.error || "Gagal menghapus artikel.");
        return;
      }
      notify("success", "Artikel dihapus.");
      setConfirmDelete(null);
      await load();
    } catch {
      notify("error", "Gagal menghapus artikel.");
    }
  };

  const inputCls =
    "w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors";
  const labelCls =
    "block text-slate-300 font-semibold mb-1.5 text-xs flex items-center justify-between gap-2";

  return (
    <div className="space-y-5">
      {/* Notifikasi */}
      {notification && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} aria-label="Tutup">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ringkasan + aksi */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { label: "Total", value: stats.total, cls: "text-slate-200" },
            { label: "Publish", value: stats.published, cls: "text-emerald-300" },
            { label: "Draft", value: stats.draft, cls: "text-amber-300" },
          ].map((s) => (
            <div
              key={s.label}
              className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2"
            >
              <span className={`text-sm font-bold ${s.cls}`}>{s.value}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Tulis Artikel Baru
        </button>
      </div>

      {/* Cari + filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, slug, atau tag artikel..."
            className="w-full bg-slate-900/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(
            [
              { key: "all", label: "Semua" },
              { key: "published", label: "Publish" },
              { key: "draft", label: "Draft" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filter === f.key
                  ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-14 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat artikel...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">
            {articles.length === 0
              ? "Belum ada artikel"
              : "Tidak ada artikel yang cocok"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {articles.length === 0
              ? "Mulai dengan artikel panduan — isi bisa ditulis sendiri atau disusun dengan bantuan AI."
              : "Coba kata kunci lain atau ganti filter."}
          </p>
          {articles.length === 0 && (
            <button
              type="button"
              onClick={openNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" /> Tulis Artikel Baru
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((a) => {
            const cat = categories.find((c) => c.value === a.category);
            return (
              <div
                key={a.id}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          a.isPublished
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {a.isPublished ? "PUBLISH" : "DRAFT"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-brand-500/15 text-brand-300 border-brand-500/30">
                        {cat?.label || a.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.readMinutes} mnt
                      </span>
                      <span className="text-[10px] text-slate-600 hidden sm:inline">
                        Diperbarui{" "}
                        {new Date(a.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      /artikel/{a.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {a.isPublished && (
                      <Link
                        href={`/artikel/${a.slug}`}
                        target="_blank"
                        title="Lihat di website"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => togglePublish(a)}
                      title={a.isPublished ? "Jadikan draft" : "Terbitkan"}
                      className={`p-2 rounded-lg transition-colors ${
                        a.isPublished
                          ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      {a.isPublished ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      title="Edit artikel"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(a)}
                      title="Hapus artikel"
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor (modal) */}
      {form && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-8">
          <div className="w-full max-w-5xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl my-4">
            {/* Header editor */}
            <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur z-10 rounded-t-3xl">
              <div>
                <h3 className="text-base font-bold text-white">
                  {form.id ? "Edit Artikel" : "Tulis Artikel Baru"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Isi artikel dengan bahasa Indonesia. Setelah disimpan, terjemahan
                  5 bahasa lain dibuat otomatis di background.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-semibold border transition-colors ${
                    showPreview
                      ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                      : "bg-slate-900 text-slate-300 border-slate-700"
                  }`}
                >
                  {showPreview ? "Kembali Edit" : "Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {showPreview ? (
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
                  <h2 className="text-xl font-bold text-white mb-1">{form.title || "Untitled"}</h2>
                  <p className="text-xs text-slate-400 italic mb-4">{form.excerpt}</p>
                  <RichContent html={form.body} />
                </div>
              ) : (
                <>
                  {/* Judul & slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Judul Artikel <span className="text-rose-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="Contoh: Bedakan Dryfit Milano, Jersey, dan Pique untuk Jersey Timothy"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Slug (URL)</label>
                      <input
                        className={`${inputCls} font-mono`}
                        value={form.slug}
                        onChange={(e) => set("slug", e.target.value)}
                        placeholder="otomatis dari judul"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        URL: /artikel/{form.slug || "..."}
                      </p>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className={labelCls}>
                      Ringkasan (Excerpt)
                      <span className="text-slate-500 font-normal">
                        {form.excerpt.length}/300
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-y`}
                      value={form.excerpt}
                      onChange={(e) => set("excerpt", e.target.value)}
                      placeholder="1-2 kalimat yang dipakai di kartu artikel & meta description Google."
                    />
                  </div>

                  {/* Kategori & tipe */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={labelCls}>Kategori</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaxModal("category");
                            setNewTaxLabel("");
                            setTaxError(null);
                            setTaxWarning(null);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Kategori
                        </button>
                      </div>
                      <select
                        className={inputCls}
                        value={
                          categories.some((c) => c.value === form.category)
                            ? form.category
                            : form.category || ""
                        }
                        onChange={(e) => set("category", e.target.value)}
                      >
                        {!categories.some((c) => c.value === form.category) && form.category && (
                          <option value={form.category}>{prettifySlug(form.category)}</option>
                        )}
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={labelCls}>Tipe</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaxModal("type");
                            setNewTaxLabel("");
                            setTaxError(null);
                            setTaxWarning(null);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Tipe
                        </button>
                      </div>
                      <select
                        className={inputCls}
                        value={form.articleType || ""}
                        onChange={(e) => set("articleType", e.target.value)}
                      >
                        {!articleTypes.some((t) => t.value === form.articleType) && form.articleType && (
                          <option value={form.articleType}>{prettifySlug(form.articleType)}</option>
                        )}
                        {articleTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Galeri gambar — maks 5, .webp, maks 5MB per gambar */}
                  <div>
                    <label className={labelCls}>
                      <span className="inline-flex flex-wrap items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Galeri Gambar (
                        {form.images.length}/{MAX_IMAGES})
                        <span className="text-slate-500 font-normal">
                          · maks 5 gambar · 5MB/gambar · JPG/PNG/GIF otomatis jadi .webp · pertama = cover
                        </span>
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {form.images.map((url, i) => (
                        <div
                          key={url}
                          className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-800 group"
                        >
                          <img
                            src={url}
                            alt={`Gambar ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-500/90 text-slate-950 text-[9px] font-bold">
                              COVER
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              set("images", form.images.filter((u) => u !== url))
                            }
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus gambar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {form.images.length < MAX_IMAGES && (
                        <label
                          className={`w-24 h-24 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
                            uploadingImages
                              ? "border-brand-500/60 bg-brand-500/5 cursor-wait"
                              : "border-slate-700 hover:border-brand-500/60 bg-slate-900/40"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp"
                            multiple
                            className="hidden"
                            onChange={handleGalleryUpload}
                            disabled={uploadingImages}
                          />
                          {uploadingImages ? (
                            <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                              <span className="text-[10px] text-slate-400 mt-1 text-center leading-tight">
                                JPG/PNG/GIF
                                <br />→ .webp otomatis
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className={labelCls}>
                      Isi Artikel
                      <span className="text-slate-500 font-normal">
                        gunakan Heading 2 &amp; 3 agar Daftar Isi otomatis
                      </span>
                    </label>
                    <RichTextEditor
                      value={form.body}
                      onChange={(html) => set("body", html)}
                    />
                  </div>

                  {/* Tag & produk terkait */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tag (pisahkan dengan koma)</label>
                      <input
                        className={inputCls}
                        value={form.tags}
                        onChange={(e) => set("tags", e.target.value)}
                        placeholder="sublimasi, dryfit, panduan"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <span className="inline-flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> Kain yang Dibahas
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowProducts((v) => !v)}
                        className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 hover:border-brand-500/50 transition-colors"
                      >
                        <span>
                          {form.relatedProducts.length > 0
                            ? `${form.relatedProducts.length} produk dipilih`
                            : "Pilih produk (opsional)"}
                        </span>
                        {showProducts ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {showProducts && (
                        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1">
                          {products.map((p) => {
                            const checked = form.relatedProducts.includes(p.slug);
                            return (
                              <label
                                key={p.id}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-900 cursor-pointer text-[11px] text-slate-300"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    set(
                                      "relatedProducts",
                                      checked
                                        ? form.relatedProducts.filter((s) => s !== p.slug)
                                        : [...form.relatedProducts, p.slug]
                                    )
                                  }
                                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
                                />
                                <span className="truncate">{p.name}</span>
                                <span className="ml-auto text-[10px] text-slate-600">
                                  {p.category}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advanced */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-300"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand-400" />
                        SEO & Penulis (opsional)
                      </span>
                      {showAdvanced ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {showAdvanced && (
                      <div className="px-4 pb-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>Penulis</label>
                            <input
                              className={inputCls}
                              value={form.author}
                              onChange={(e) => set("author", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Jabatan / Expertise</label>
                            <input
                              className={inputCls}
                              value={form.authorRole}
                              onChange={(e) => set("authorRole", e.target.value)}
                              placeholder="mis. Supervisor Dyeing & Printing"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>
                            SEO Title
                            <span className="text-slate-500 font-normal">
                              {form.seoTitle.length}/60
                            </span>
                          </label>
                          <input
                            className={inputCls}
                            value={form.seoTitle}
                            onChange={(e) => set("seoTitle", e.target.value)}
                            placeholder="Kosongkan untuk memakai judul artikel"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            Meta Description
                            <span className="text-slate-500 font-normal">
                              {form.seoDescription.length}/160
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            className={`${inputCls} resize-y`}
                            value={form.seoDescription}
                            onChange={(e) => set("seoDescription", e.target.value)}
                            placeholder="Kosongkan untuk memakai ringkasan artikel"
                          />
                        </div>

                        {/* Preview Google */}
                        <div className="rounded-xl bg-white p-4 text-slate-900">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Pratinjau Google
                          </p>
                          <p className="text-sm text-[#1a0dab] mt-1 leading-snug">
                            {form.seoTitle || form.title || "Judul artikel"}
                          </p>
                          <p className="text-[11px] text-[#188038] mt-0.5">
                            texora.co.id/artikel/{form.slug || "artikel"}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {form.seoDescription ||
                              form.excerpt ||
                              "Ringkasan artikel akan muncul di sini pada hasil pencarian Google."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer editor */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-slate-800 sticky bottom-0 bg-slate-950/95 backdrop-blur rounded-b-3xl">
              <p className="text-[10px] text-slate-500">
                <FileText className="w-3 h-3 inline" /> Simpan Draft = tidak
                tampil di website. Terbitkan = langsung tayang.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save(true)}
                  className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Simpan &amp; Terbitkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-300 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hapus artikel?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Artikel <strong className="text-slate-200">{confirmDelete.title}</strong>{" "}
              akan dihapus permanen dari website, termasuk hasil terjemahannya.
              Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={doDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tambah Kategori / Tipe artikel */}
      {showTaxModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-brand-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {showTaxModal === "category" ? "Tambah Kategori Artikel" : "Tambah Tipe Artikel"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Di-validasi otomatis (anti-duplikat & anti-variasi jamak).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaxModal(null)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                {showTaxModal === "category" ? "Nama Kategori" : "Nama Tipe"}
              </label>
              <input
                type="text"
                autoFocus
                value={newTaxLabel}
                onChange={(e) => handleTaxLabelChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !savingTax) handleAddTaxonomy();
                }}
                placeholder={showTaxModal === "category" ? "mis. Event & Pameran" : "mis. Wawancara"}
                maxLength={50}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-500"
              />
              {taxWarning && (
                <p className="text-[11px] text-amber-400 mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {taxWarning}
                </p>
              )}
              {taxError && (
                <p className="text-[11px] text-red-400 mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {taxError}
                </p>
              )}
              {taxWarning && !taxError && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Pilih saja dari dropdown &quot;{showTaxModal === "category" ? "Kategori" : "Tipe"}&quot; —
                  server juga memvalidasi ulang saat disimpan.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowTaxModal(null)}
                className="px-4 py-2 rounded-xl text-[11px] font-bold bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!newTaxLabel.trim() || savingTax}
                onClick={handleAddTaxonomy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold bg-brand-500 text-slate-950 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingTax ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {savingTax ? "Menyimpan..." : showTaxModal === "category" ? "Tambah Kategori" : "Tambah Tipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
