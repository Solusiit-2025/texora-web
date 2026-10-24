import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  CalendarDays,
  User,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import ArticleToc from "./ArticleToc";
import ArticleHeroGallery from "./ArticleHeroGallery";
import { RichContent } from "@/components/common/RichContent";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import {
  getStorefrontArticleBySlug,
  getRelatedArticles,
  getStorefrontProducts,
} from "@/lib/storefront-data";
import { getRequestLocale } from "@/lib/server-locale";
import { getAuthorProfile } from "@/config/authors";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const article = await getStorefrontArticleBySlug((await params).slug, locale);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan | XoraMateria", robots: { index: false } };
  }

  return buildPageMetadata({
    locale,
    path: `/artikel/${article.slug}`,
    // Judul artikel sudah memuat nama brand ("... | XoraMateria"), jadi tidak
    // perlu suffix lagi - meta title tidak kepotong di tengah kalimat.
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    keywords: article.tags,
    image: article.coverImage || undefined,
    schemaType: "article",
    ogType: "article",
    publishedTime: article.publishedAt || undefined,
    modifiedTime: article.updatedAt,
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const locale = await getRequestLocale();
  const copy = ARTICLE_COPY[locale] ?? ARTICLE_COPY.id;
  const t = (key: string, fallback?: string) =>
    translate(locale as Locale, key, fallback);
  const lp = (href: string) => (locale === "id" ? href : `/${locale}${href}`);

  const article = await getStorefrontArticleBySlug((await params).slug, locale);
  if (!article) notFound();

  const [relatedArticles, allProducts] = await Promise.all([
    getRelatedArticles(article.category, article.id, 3),
    getStorefrontProducts(),
  ]);

  const relatedProducts = allProducts.filter((p) =>
    article.relatedProducts.includes(p.slug)
  );

  const authorProfile = getAuthorProfile(article.author);

  const breadcrumbItems = [
    { name: copy.eyebrow, path: "/artikel" },
    { name: article.title, path: `/artikel/${article.slug}` },
  ];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumbItems),
    buildWebPageSchema({
      path: `/artikel/${article.slug}`,
      name: article.title,
      description: article.excerpt,
      breadcrumb: breadcrumbItems,
    }),
    buildLocalBusinessSchema(),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${SITE_URL}/artikel/${article.slug}#article`,
      headline: article.title,
      description: article.excerpt,
      image: article.coverImage ? `${SITE_URL}${article.coverImage}` : undefined,
      datePublished: article.publishedAt || article.updatedAt,
      dateModified: article.updatedAt,
      inLanguage: "id-ID",
      articleSection: copy.categories[article.category] || article.category,
      keywords: article.tags.join(", "),
      author: {
        "@type": "Organization",
        name: authorProfile.name,
        url: `${SITE_URL}/penulis`,
        jobTitle: authorProfile.role,
        description: authorProfile.bio,
        knowsAbout: authorProfile.expertise,
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/artikel/${article.slug}`,
      },
      isPartOf: { "@id": `${SITE_URL}/artikel#collection` },
    },
  ];

  const fmtDate = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <>
      <JsonLd schema={jsonLd} id={`ld-artikel-${article.slug}`} />

      <div className="texora-container py-10 space-y-8">
        <Breadcrumb
          items={[
            { label: copy.eyebrow, href: lp("/artikel") },
            { label: article.title },
          ]}
        />

        <article className="space-y-8">
          {/* Header */}
          <header className="border-b border-slate-800 pb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
                {copy.categories[article.category] || article.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-bold">
                {copy.types[article.articleType] || article.articleType}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
              {article.title}
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                {copy.writtenBy} <strong className="text-slate-300">{article.author}</strong>
                {article.authorRole && (
                  <span className="text-slate-500">· {article.authorRole}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {copy.publishedOn} {fmtDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readMinutes} {copy.readMinutes}
              </span>
            </div>
          </header>

          {/* Cover / galeri gambar */}
          {article.images.length > 0 ? (
            <div>
              <ArticleHeroGallery images={article.images} alt={article.title} />
              {article.images.length > 1 && (
                <p className="text-[10px] text-slate-600 mt-2 text-right">
                  {article.images.length} gambar · berganti otomatis
                </p>
              )}
            </div>
          ) : article.coverImage && (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] sm:max-h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          )}

          {/* Konten + Daftar Isi */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="space-y-4">
                <ArticleToc containerId="isi-artikel" title={copy.tocTitle} />
                <div className="hidden lg:block p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-white">{copy.ctaTitle}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {copy.ctaBody}
                  </p>
                  <Link
                    href={lp("/request-quote")}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-[11px] transition-all"
                  >
                    {copy.ctaButton}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9 order-1 lg:order-2">
              <div id="isi-artikel">
                <RichContent html={article.body} />
              </div>

              {/* Tag */}
              {article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA dalam artikel */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-brand-900/50 to-slate-900 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    {copy.ctaTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                    {copy.ctaBody}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link
                    href={lp("/request-quote")}
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-[11px] transition-all"
                  >
                    {copy.ctaButton}
                  </Link>
                  <a
                    href="/api/catalog/pdf"
                    download
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    {copy.pdfCta}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Profil penulis — sinyal E-E-A-T */}
          <section
            aria-labelledby="penulis-artikel"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <h2 id="penulis-artikel" className="sr-only">
              Tentang penulis
            </h2>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/15 text-[11px] font-bold text-brand-200">
                {authorProfile.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ditulis oleh
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {authorProfile.name}
                </p>
                <p className="text-[11px] text-brand-300">{authorProfile.role}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  {authorProfile.bio}
                </p>
                <Link
                  href={lp("/penulis")}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-300 hover:text-brand-200"
                >
                  Profil tim &amp; cara kami menulis
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* Kain yang dibahas */}
          {relatedProducts.length > 0 && (
            <section aria-labelledby="kain-dibahas" className="pt-2">
              <h2
                id="kain-dibahas"
                className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2"
              >
                <Layers className="w-5 h-5 text-brand-400" />
                {copy.relatedProductsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={lp(`/catalog/${p.slug}`)}
                    prefetch={false}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {p.composition} · {p.widthInch}"
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 ml-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artikel terkait */}
          {relatedArticles.length > 0 && (
            <section aria-labelledby="artikel-terkait" className="pt-2">
              <h2
                id="artikel-terkait"
                className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-accent-cyan" />
                {copy.relatedTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((a) => (
                  <Link
                    key={a.id}
                    href={lp(`/artikel/${a.slug}`)}
                    prefetch={false}
                    className="group p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      {copy.categories[a.category] || a.category}
                    </span>
                    <p className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {a.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      {a.readMinutes} {copy.readMinutes}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="pt-2">
            <Link
              href={lp("/artikel")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              ← {copy.backToArticles}
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
