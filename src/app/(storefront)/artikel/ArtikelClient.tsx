"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, CalendarDays, ArrowRight, BookOpen } from "lucide-react";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import type { ArticleCopy } from "@/lib/i18n/article-dictionary";

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  images: string[];
  category: string;
  articleType: string;
  readMinutes: number;
  publishedAt: string | null;
  tags: string[];
}

/** Durasi auto-rotate carousel gambar kartu (ms) — senada hero slider (7.5s). */
const CAROUSEL_INTERVAL = 7500;

export default function ArtikelClient({
  articles,
  categories,
  copy,
}: {
  articles: ArticleCardData[];
  categories: { slug: string; name: string }[];
  copy: ArticleCopy;
}) {
  const { locale } = useI18n();
  const localePath = useLocalePath();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return [a.title, a.excerpt, ...a.tags].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [articles, category, query]);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString(
      locale === "id" ? "id-ID" : locale,
      { day: "numeric", month: "short", year: "numeric" }
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter + pencarian */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              category === "all"
                ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {copy.filterAll} · {articles.length}
          </button>
          {categories.map((c) => {
            const count = articles.filter((a) => a.category === c.slug).length;
            if (count === 0) return null;
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {c.name} · {count}
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-80">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="w-full bg-slate-900/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        {filtered.length} {copy.resultCount}
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">{copy.emptyTitle}</p>
          <p className="text-xs text-slate-400 mt-1">{copy.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, idx) => (
            <article
              key={a.id}
              className="group flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-brand-500/40 transition-colors"
            >
              <div className="relative">
                {a.images.length > 0 ? (
                  <ImageCarousel
                    images={a.images}
                    alt={a.title}
                    aspect="16/9"
                    interval={CAROUSEL_INTERVAL + (idx % 3) * 1200}
                    slideMs={1100}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="aspect-[16/9] bg-slate-950 flex items-center justify-center text-slate-700">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                    {copy.categories[a.category] || a.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                    {copy.types[a.articleType] || a.articleType}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-base font-bold text-white group-hover:text-accent-cyan transition-colors leading-snug">
                  <Link href={localePath(`/artikel/${a.slug}`)} prefetch={false}>
                    {a.title}
                  </Link>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-3">
                  {a.excerpt}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {fmtDate(a.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {a.readMinutes} {copy.readMinutes}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Link
                  href={localePath(`/artikel/${a.slug}`)}
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300 hover:text-brand-200 transition-colors"
                >
                  {copy.minRead}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
