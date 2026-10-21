import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileText, Sparkles } from "lucide-react";
import ArtikelClient from "./ArtikelClient";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { getStorefrontArticles, ARTICLE_CATEGORIES } from "@/lib/storefront-data";
import { getRequestLocale } from "@/lib/server-locale";
import { ARTICLE_COPY } from "@/lib/i18n/article-dictionary";
import { translate, type Locale } from "@/lib/i18n/dictionary";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildLocalBusinessSchema,
  SITE_URL,
} from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = ARTICLE_COPY[locale] ?? ARTICLE_COPY.id;

  return buildPageMetadata({
    locale,
    path: "/artikel",
    title: `${copy.title} | Texora`,
    description: copy.lead,
    keywords: [
      "panduan sublimasi",
      "artikel kain polyester",
      "tips cetak sublimasi",
      "belajar tekstil industri",
      "sublimation guide",
    ],
    schemaType: "article",
    ogType: "website",
  });
}

export default async function ArtikelPage() {
  const locale = await getRequestLocale();
  const copy = ARTICLE_COPY[locale] ?? ARTICLE_COPY.id;
  const t = (key: string, fallback?: string) =>
    translate(locale as Locale, key, fallback);
  const lp = (href: string) => (locale === "id" ? href : `/${locale}${href}`);

  const articles = await getStorefrontArticles({ lang: locale });

  const categories = ARTICLE_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: copy.categories[c.slug] || c.name,
  })).filter((c) => articles.some((a) => a.category === c.slug));

  const breadcrumbItems = [
    { name: copy.eyebrow, path: "/artikel" },
  ];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumbItems),
    buildWebPageSchema({
      path: "/artikel",
      name: copy.title,
      description: copy.lead,
      breadcrumb: breadcrumbItems,
    }),
    buildLocalBusinessSchema(),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/artikel#collection`,
      name: copy.title,
      description: copy.lead,
      url: `${SITE_URL}/artikel`,
      inLanguage: "id-ID",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: articles.length,
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/artikel/${a.slug}`,
          name: a.title,
        })),
      },
    },
  ];

  return (
    <>
      <JsonLd schema={jsonLd} id="ld-artikel" />

      <div className="texora-container py-10 space-y-8">
        <Breadcrumb items={[{ label: copy.eyebrow }]} />

        {/* Header */}
        <header className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {copy.title}
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-3xl leading-relaxed">
            {copy.lead}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            {articles.length} {copy.resultCount} ·{" "}
            <Link href={lp("/catalog")} className="text-brand-400 hover:text-brand-300">
              {t("nav.catalog", "Katalog Kain")}
            </Link>
          </p>
        </header>

        {/* Daftar artikel */}
        <ArtikelClient
          articles={articles.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            coverImage: a.coverImage,
            category: a.category,
            articleType: a.articleType,
            readMinutes: a.readMinutes,
            publishedAt: a.publishedAt,
            tags: a.tags,
          }))}
          categories={categories}
          copy={copy}
        />

        {/* CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-900/50 to-slate-900 border border-brand-500/30 flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
          <div className="max-w-2xl">
            <h2 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              {copy.ctaTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {copy.ctaBody}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={lp("/request-quote")}
              className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
            >
              {copy.ctaButton}
            </Link>
            <a
              href="/api/catalog/pdf"
              download
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              {copy.pdfCta}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
