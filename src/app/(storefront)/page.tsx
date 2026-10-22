import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { JsonLd } from "@/components/common/JsonLd";
import {
  getStorefrontProducts,
  getStorefrontFaqs,
  getStorefrontHeroSlides,
  getStorefrontTestimonials,
  getSiteContentValue,
} from "@/lib/storefront-data";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeRows, localizeObject, localizeStatLabels } from "@/lib/content-translator";
import {
  HERO_TEXT_KEY,
  HERO_TEXT_FIELDS,
  type HeroText,
} from "@/config/hero-text";
import {
  buildPageMetadata,
  buildWebSiteSchema,
  buildLocalBusinessSchema,
  buildFaqSchema,
  buildWebPageSchema,
} from "@/lib/seo-metadata";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

/**
 * Homepage XoraMateria.
 *
 * Server component agar:
 *  - metadata (title/description/canonical/OG) terbaca Googlebot & AI crawler,
 *  - katalog kain, FAQ, dan testimoni sudah ada di HTML awal (SSR),
 *  - JSON-LD WebSite + LocalBusiness + FAQPage tersedia untuk Rich Results.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: "/",
    title: SEO_PAGES["/"].title,
    description: SEO_PAGES["/"].description,
    keywords: [
      "pabrik sublimasi jakarta",
      "supplier kain sublimasi",
      "cetak sublimasi grosir",
      "kain polyester industri",
      "xoramateria",
      "jasa cetak sublimasi jakarta utara",
    ],
    schemaType: "organization",
  });
}

export default async function HomePage() {
  const lang = await getContentLocale();

  // SEMUA query homepage paralel (DB remote ~180ms/query, jadi sequential
  // akan menumpuk waktu tunggu).
  const [products, faqs, heroSlides, testimonials, stats, b2bCta, heroText] =
    await Promise.all([
      getStorefrontProducts(),
      getStorefrontFaqs(),
      getStorefrontHeroSlides(),
      getStorefrontTestimonials(),
      getSiteContentValue<Array<{ v: string; k: string }>>(
        "homepage.stats",
        [
          { v: "10.000 m", k: "Kapasitas harian" },
          { v: "18 jenis", k: "Kain siap sublim" },
          { v: "400+", k: "Mitra garmen" },
        ]
      ),
      getSiteContentValue("homepage.cta_b2b", {
        title: "Butuh pasokan rutin di atas 5.000 meter per bulan?",
        description:
          "Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.",
        actionText: "Minta penawaran",
        actionLink: "/contact",
      }),
      getSiteContentValue<Partial<HeroText>>(HERO_TEXT_KEY, {}),
    ]);

  let productsOut = products;
  let faqsOut = faqs;
  let heroSlidesOut = heroSlides;
  let testimonialsOut = testimonials;

  // Tahap 2: terjemahkan konten DB utk URL berprefik bahasa (cache DB).
  let statsOut = stats;
  let b2bOut = b2bCta;
  let heroTextOut: Partial<HeroText> = heroText || {};
  if (lang) {
    [productsOut, faqsOut, heroSlidesOut, testimonialsOut, statsOut, b2bOut, heroTextOut] = await Promise.all([
      localizeRows("product", products, (p: any) => p.slug, ["description"], lang),
      localizeRows("faq", faqs, (f: any) => f.id, ["question", "answer"], lang),
      localizeRows("hero", heroSlides, (s: any) => s.id, ["tag", "caption", "alt"], lang),
      localizeRows("testimonial", testimonials, (t: any) => t.id, ["quote"], lang),
      localizeStatLabels("homepage.stats", stats, lang),
      localizeObject("siteContent", "homepage.cta_b2b", b2bCta as any, ["title", "description", "actionText"], lang) as any,
      Object.keys(heroText || {}).length > 0
        ? (localizeObject("siteContent", HERO_TEXT_KEY, heroText as any, [...HERO_TEXT_FIELDS], lang) as Promise<Partial<HeroText>>)
        : Promise.resolve<Partial<HeroText>>({}),
    ]);
  }

  const websiteSchema = buildWebSiteSchema();
  const businessSchema = buildLocalBusinessSchema();
  const faqSchema = buildFaqSchema(
    faqsOut.map((f: any) => ({ question: f.question, answer: f.answer }))
  );
  const webPageSchema = buildWebPageSchema({
    path: "/",
    name: "XoraMateria — Pabrik Kain Sublimasi & Tekstil Industri",
    description:
      "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara.",
  });

  return (
    <>
      <JsonLd
        schema={[websiteSchema, businessSchema, faqSchema, webPageSchema]}
        id="ld-home"
      />
      {/*
        Preload gambar hero (elemen LCP) agar browser langsung mengunduhnya
        saat HTML pertama diterima - mengurangi Core Web Vitals LCP.
      */}
      {heroSlides[0]?.mainImage && (
        <link
          rel="preload"
          as="image"
          href={heroSlides[0].mainImage}
          fetchPriority="high"
        />
      )}
      <HomeClient
        initialData={{
          fabrics: productsOut,
          faqs: faqsOut.map((f: any) => ({ question: f.question, answer: f.answer })),
          heroSlides: heroSlidesOut,
          testimonials: testimonialsOut,
          stats: statsOut,
          b2bCta: b2bOut,
          heroText: heroTextOut,
        }}
      />
    </>
  );
}
