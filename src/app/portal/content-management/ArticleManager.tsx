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
import { ImageUpload } from "@/components/common/ImageUpload";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
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

const EMPTY_FORM = {
  id: "" as string,
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImage: "",
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

  const notify = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  }, []);

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
    } catch {
      notify("error", "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

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
    setForm({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      body: a.body,
      coverImage: a.coverImage || "",
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
        coverImage: form.coverImage || null,
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
            const cat = CATEGORIES.find((c) => c.value === a.category);
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

                  {/* Kategori, tipe, cover */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Kategori</label>
                      <select
                        className={inputCls}
                        value={form.category}
                        onChange={(e) => set("category", e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tipe</label>
                      <select
                        className={inputCls}
                        value={form.articleType}
                        onChange={(e) => set("articleType", e.target.value)}
                      >
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Gambar Cover
                        </span>
                      </label>
                      <ImageUpload
                        value={form.coverImage}
                        onChange={(url) => set("coverImage", url)}
                        onError={(m) => notify("error", m)}
                      />
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
    </div>
  );
}
