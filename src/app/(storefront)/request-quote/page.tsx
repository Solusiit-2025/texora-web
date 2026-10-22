import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, CheckCircle2, Clock, Package, ShieldCheck } from "lucide-react";
import RequestQuoteClient from "./RequestQuoteClient";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { getRequestLocale } from "@/lib/server-locale";
import { QUOTE_COPY } from "@/lib/i18n/quote-dictionary";
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
  searchParams: { product?: string; source?: string };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = QUOTE_COPY[locale] ?? QUOTE_COPY.id;

  return buildPageMetadata({
    locale,
    path: "/request-quote",
    title: `${copy.title} | XoraMateria`,
    description: copy.lead,
    keywords: [
      "minta penawaran kain",
      "harga kain sublimasi",
      "request for quote fabric",
      "harga grosir kain jakarta",
      "supplier kain teksil",
    ],
    schemaType: "article",
  });
}

export default async function RequestQuotePage({ searchParams }: PageProps) {
  const locale = await getRequestLocale();
  const copy = QUOTE_COPY[locale] ?? QUOTE_COPY.id;
  const source = (searchParams?.source || "website").slice(0, 40);
  const presetProduct = searchParams?.product;

  const products = await getStorefrontProducts();
  const productOptions = products.map((p) => ({
    id: p.slug,
    name: p.name,
    category: p.category,
    gsm: p.variants?.[0]?.gsm,
  }));

  // Prefix bahasa untuk link internal (server-side, konsisten dengan URL halaman).
  const lp = (href: string) => (locale === "id" ? href : `/${locale}${href}`);
  const t = (key: string, fallback?: string) =>
    translate(locale as Locale, key, fallback);

  const breadcrumbItems = [
    { name: "Katalog", path: "/catalog" },
    { name: copy.eyebrow, path: "/request-quote" },
  ];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumbItems),
    buildWebPageSchema({
      path: "/request-quote",
      name: copy.title,
      description: copy.lead,
      breadcrumb: breadcrumbItems,
    }),
    buildLocalBusinessSchema(),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/request-quote#service`,
      name: copy.title,
      serviceType: "Fabric quotation & sublimation printing",
      description: copy.lead,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: "Indonesia" },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: `${SITE_URL}/request-quote`,
        servicePhone: "+62-878-8985-6066",
      },
    },
  ];

  return (
    <>
      <JsonLd schema={jsonLd} id="ld-request-quote" />

      <div className="texora-container py-10 space-y-8">
        <Breadcrumb
          items={[
            { label: t("nav.catalog", "Katalog"), href: lp("/catalog") },
            { label: copy.eyebrow },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom kiri: penjelasan */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 bg-brand-500/10 border border-brand-500/25 rounded-full px-3 py-1">
                <Package className="w-3 h-3" />
                {copy.eyebrow}
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
                {copy.title}
              </h1>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {copy.lead}
              </p>
            </div>

            {/* Keunggulan */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-white">{copy.benefitsTitle}</h2>
              <ul className="space-y-2.5">
                {copy.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unduh katalog PDF */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/50 to-slate-900 border border-brand-500/25 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{copy.pdfCta}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {copy.pdfHint}
                  </p>
                </div>
              </div>
              <a
                href="/api/catalog/pdf"
                download
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{copy.pdfCta}</span>
              </a>
            </div>

            {/* Jaminan Kecepatan & Sample */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Clock className="w-4 h-4 text-accent-cyan mb-2" />
                <div className="text-xs font-bold text-white">{copy.statReply}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {copy.statReplyDesc}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2" />
                <div className="text-xs font-bold text-white">{copy.statFree}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {copy.statSampleDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom kanan: form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-800 shadow-2xl">
              <RequestQuoteClient
                products={productOptions}
                source={source}
                presetProduct={presetProduct}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
