import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { getRequestLocale } from "@/lib/server-locale";
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
  return buildPageMetadata({
    locale,
    path: "/kategori",
    title: "Kategori Kain Sublimasi — Panduan & Katalog | XoraMateria",
    description:
      "Panduan lengkap memilih kain sublimasi sesuai kebutuhan: sportswear & jersey, voal & satin hijab, home living & dekorasi, hingga merchandise, banner, dan flag event.",
    keywords: [
      "kategori kain sublimasi",
      "panduan memilih kain sublimasi",
      "jenis kain siap sublimasi",
      "kain polyester printing",
    ],
    schemaType: "article",
  });
}

export default async function CategoryIndexPage() {
  const products = await getStorefrontProducts();

  const countByCategory = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Kategori", path: "/kategori" },
  ]);
  const webPageSchema = buildWebPageSchema({
    path: "/kategori",
    name: "Kategori Kain Sublimasi",
    description:
      "Panduan lengkap memilih kain sublimasi sesuai kebutuhan industri dan fashion.",
    breadcrumb: [{ name: "Kategori", path: "/kategori" }],
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/kategori#itemlist`,
    name: "Kategori Kain Sublimasi XoraMateria",
    itemListElement: CATEGORY_SEO.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/kategori/${c.slug}`,
      name: c.title,
    })),
  };

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, itemListSchema, buildLocalBusinessSchema()]}
        id="ld-kategori-index"
      />

      <article className="texora-container py-10 space-y-8">
        <Breadcrumb items={[{ label: "Kategori" }]} />

        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1.5">
            Pusat Panduan Kain
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Kategori Kain Sublimasi
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-3xl leading-relaxed">
            Pilih kategori sesuai kebutuhan produk Anda. Setiap kategori dilengkapi panduan
            teknis, spesifikasi GSM, dan tips produksi dari tim engineering XoraMateria.
          </p>
        </header>

        <section aria-labelledby="daftar-kategori-heading">
          <h2 id="daftar-kategori-heading" className="sr-only">
            Daftar kategori kain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORY_SEO.map((c) => {
              const count = countByCategory[c.dbCategory] || 0;
              return (
                <Link
                  key={c.slug}
                  href={`/kategori/${c.slug}`}
                  className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-colors"
                >
                  <h3 className="text-base font-display font-bold text-white group-hover:text-brand-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {c.intro}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 text-[10px] font-bold border border-brand-500/25">
                      {count} jenis kain
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold">
                      {c.benefits.length} keunggulan
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold">
                      {c.guide.length} panduan
                    </span>
                    <span className="ml-auto text-[11px] font-semibold text-brand-400">
                      Baca Selengkapnya &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </>
  );
}
