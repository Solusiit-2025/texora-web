import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { isPriceHidden, stripProductPrices } from "@/lib/catalog-visibility";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeRows, localizeObject } from "@/lib/content-translator";
import {
  getCategorySeo,
  type CategorySeoContent,
} from "@/lib/category-seo";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildFaqSchema,
  buildLocalBusinessSchema,
  SITE_URL,
} from "@/lib/seo-metadata";
import { formatRupiah, formatNumber } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

// Dinamis: konten kategori ikut diterjemahkan per URL berprefik bahasa
// (/de/kategori/...), jadi tidak bisa di-SSG (prerender statis).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategorySeo(params.slug);

  if (!category) {
    return { title: "Kategori Tidak Ditemukan | XoraMateria", robots: { index: false } };
  }

  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: `/kategori/${category.slug}`,
    title: category.metaTitle,
    description: category.metaDescription,
    keywords: category.keywords,
    schemaType: "article",
    ogType: "article",
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const category = getCategorySeo(params.slug);
  if (!category) notFound();

  // Tahap 2: localize konten kategori utk URL berprefik bahasa.
  const lang = await getContentLocale();
  const allProductsRaw = await getStorefrontProducts();
  let products = allProductsRaw.filter(
    (p) => p.category === category.dbCategory
  );

  // Sembunyikan harga bila admin mengaktifkannya (setting terpusat dari portal).
  if (await isPriceHidden()) {
    products = stripProductPrices(products);
  }

  let c = category;
  if (lang) {
    // title & intro utk heading/page body
    const localizedHead = await localizeObject(
      "categorySeo",
      category.slug,
      { title: category.title, intro: category.intro },
      ["title", "intro"],
      lang
    );
    c = {
      ...category,
      title: String(localizedHead.title) || category.title,
      intro: String(localizedHead.intro) || category.intro,
    };
    // benefit / guide / faqs: flatten -> batch -> susun kembali
    const flat: Array<{ key: string; text: string }> = [];
    category.benefits.forEach((b, i) => {
      flat.push({ key: `b${i}-t`, text: b.title }, { key: `b${i}-b`, text: b.body });
    });
    category.guide.forEach((g, i) => {
      flat.push({ key: `g${i}-h`, text: g.heading }, { key: `g${i}-t`, text: g.body });
    });
    category.faqs.forEach((f, i) => {
      flat.push({ key: `f${i}-q`, text: f.question }, { key: `f${i}-a`, text: f.answer });
    });
    const localized = await localizeRows("categorySeo", flat, (r) => r.key, ["text"], lang);
    const byKey = new Map(localized.map((r) => [r.key, r.text]));
    c = {
      ...c,
      benefits: category.benefits.map((b, i) => ({
        title: byKey.get(`b${i}-t`) || b.title,
        body: byKey.get(`b${i}-b`) || b.body,
      })),
      guide: category.guide.map((g, i) => ({
        heading: byKey.get(`g${i}-h`) || g.heading,
        body: byKey.get(`g${i}-t`) || g.body,
      })),
      faqs: category.faqs.map((f, i) => ({
        question: byKey.get(`f${i}-q`) || f.question,
        answer: byKey.get(`f${i}-a`) || f.answer,
      })),
    };
    products = await localizeRows("product", products, (p: any) => p.slug, ["description"], lang);
  }

  const breadcrumbItems = [
    { name: "Katalog", path: "/catalog" },
    { name: category.name, path: `/kategori/${category.slug}` },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    path: `/kategori/${category.slug}`,
    name: category.title,
    description: category.metaDescription,
    breadcrumb: breadcrumbItems,
  });
  const faqSchema = buildFaqSchema(category.faqs);
  const businessSchema = buildLocalBusinessSchema();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/kategori/${category.slug}#itemlist`,
    name: category.title,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/catalog/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, itemListSchema, faqSchema, businessSchema]}
        id={`ld-kategori-${category.slug}`}
      />

      <article className="texora-container py-10 space-y-10">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Katalog", href: "/catalog" }, { label: category.name }]} />

        {/* Header */}
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1.5">
            Kategori Kain
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {category.title}
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-3xl leading-relaxed">
            {category.intro}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            {products.length} jenis kain tersedia &middot; Harga grosir bertingkat per meter
          </p>
        </header>

        {/* Keunggulan */}
        <section aria-labelledby="keunggulan-kategori-heading">
          <h2
            id="keunggulan-kategori-heading"
            className="text-lg font-display font-bold text-white mb-4"
          >
            Mengapa {category.name} XoraMateria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.benefits.map((b) => (
              <div
                key={b.title}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <h3 className="text-sm font-bold text-white">{b.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grid Produk */}
        {products.length > 0 && (
          <section aria-labelledby="produk-kategori-heading">
            <h2
              id="produk-kategori-heading"
              className="text-lg font-display font-bold text-white mb-4"
            >
              Kain {category.name} Siap Sublimasi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((fabric) => {
                const defaultVariant = fabric.variants[0];
                const lowestPrice = fabric.priceTiers.length
                  ? fabric.priceTiers[fabric.priceTiers.length - 1].unitPrice
                  : fabric.basePricePerMeter;

                return (
                  <article
                    key={fabric.id}
                    className="rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between overflow-hidden group hover:border-brand-500/40 transition-colors"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                        <Image
                          src={fabric.thumbnailUrl}
                          alt={`${fabric.name} — kain ${fabric.composition} siap sublimasi, lebar ${fabric.widthInch} inci, kategori ${fabric.category}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                            {fabric.category}
                          </span>
                          {defaultVariant && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                              {defaultVariant.gsm} GSM
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-white group-hover:text-accent-cyan transition-colors">
                          {fabric.name}
                        </h3>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Komposisi:</span>
                            <span className="font-semibold text-slate-200">
                              {fabric.composition}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Anyaman:</span>
                            <span className="font-semibold text-slate-200">
                              {fabric.weaveType || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Lebar Standar:</span>
                            <span className="font-semibold text-slate-200">
                              {fabric.widthInch} Inch
                            </span>
                          </div>
                          {defaultVariant && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stok:</span>
                              <span className="font-semibold text-emerald-400">
                                {formatNumber(defaultVariant.stockMeters)} m
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        {lowestPrice > 0 ? (
                          <>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">
                              Harga Terbaik
                            </span>
                            <span className="text-base font-extrabold text-white font-mono">
                              {formatRupiah(lowestPrice)}
                              <span className="text-xs text-slate-400 font-normal"> /m</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] italic text-slate-400 leading-snug">
                            Silakan ajukan penawaran untuk informasi harga.
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/catalog/${fabric.slug}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Spesifikasi
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Panduan (konten edukatif - depth SEO) */}
        <section aria-labelledby="panduan-kategori-heading">
          <h2
            id="panduan-kategori-heading"
            className="text-lg font-display font-bold text-white mb-4"
          >
            Panduan Teknis {category.name}
          </h2>
          <div className="space-y-5">
            {category.guide.map((g) => (
              <div
                key={g.heading}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800"
              >
                <h3 className="text-sm font-bold text-white mb-2">{g.heading}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ (dirender server agar terbaca crawler & AI) */}
        {category.faqs.length > 0 && (
          <section aria-labelledby="faq-kategori-heading">
            <h2
              id="faq-kategori-heading"
              className="text-lg font-display font-bold text-white mb-4"
            >
              Pertanyaan Umum {category.name}
            </h2>
            <div className="space-y-3">
              {category.faqs.map((f) => (
                <div
                  key={f.question}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800"
                >
                  <h3 className="text-sm font-bold text-white mb-1.5">{f.question}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-brand-900/50 to-slate-900 border border-brand-500/30 text-center">
          <h2 className="text-lg font-display font-bold text-white">
            Butuh Penawaran Harga Grosir {category.name}?
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
            Tim sales kami siap membantu pemilihan GSM, simulasi motif, dan sampleran swatch
            gratis untuk mitra terverifikasi.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
            >
              Minta Penawaran
            </Link>
            <Link
              href="/custom-sublimation"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Coba Visualizer Sublimasi
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
