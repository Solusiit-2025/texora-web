import type { Metadata } from "next";
import CustomSublimationClient from "./CustomSublimationClient";
import { JsonLd } from "@/components/common/JsonLd";
import { ModuleDisabledNotice } from "@/components/common/ModuleDisabledNotice";
import { getStorefrontFaqs } from "@/lib/storefront-data";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeRows } from "@/lib/content-translator";
import { getSeoSettings } from "@/lib/seo";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildFaqSchema,
} from "@/lib/seo-metadata";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

/**
 * Studio Kustom Sublimasi.
 *
 * Server component agar deskripsi layanan, FAQ, dan metadata terbaca crawler
 * meskipun formulir upload-nya butuh interaksi JavaScript.
 *
 * Pemeriksaan status aktif/nonaktif modul dilakukan di SERVER sehingga
 * halaman nonaktif langsung menampilkan pesan tanpa flash skeleton.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: "/custom-sublimation",
    title: SEO_PAGES["/custom-sublimation"].title,
    description: SEO_PAGES["/custom-sublimation"].description,
    keywords: [
      "cetak sublimasi custom",
      "visualizer sublimasi 3d",
      "upload desain cetak kain",
      "jasa desain sublimasi jakarta",
      "custom printing sportswear",
    ],
    schemaType: "article",
  });
}

export default async function CustomSublimationPage() {
  const lang = await getContentLocale();
  const [faqsRaw, seo] = await Promise.all([
    getStorefrontFaqs(),
    getSeoSettings().catch(() => null),
  ]);
  const faqs = lang
    ? await localizeRows("faq", faqsRaw, (f: any) => f.id, ["question", "answer"], lang)
    : faqsRaw;

  // Modul dinonaktifkan dari CMS? Tampilkan pesan langsung (SSR).
  if (seo?.pages?.["/custom-sublimation"]?.enabled === false) {
    return <ModuleDisabledNotice path="/custom-sublimation" />;
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Kustom Sublimasi", path: "/custom-sublimation" },
  ]);

  const webPageSchema = buildWebPageSchema({
    path: "/custom-sublimation",
    name: "Studio Kustom Sublimasi — PT. Texora Visi Prima",
    description:
      "Visualizer motif 3D, unggah file desain sublimasi, dan kalkulator harga jasa desain custom.",
    breadcrumb: [{ name: "Kustom Sublimasi", path: "/custom-sublimation" }],
  });

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://texora.co.id/custom-sublimation#service",
    name: "Jasa Desain & Cetak Sublimasi Kustom",
    serviceType: "Digital sublimation printing & graphic design",
    description:
      "Jasa desain pola repeat dan cetak sublimasi kustom pada kain poliester, termasuk proofing digital dan sampel cetak fisik.",
    provider: { "@id": "https://texora.co.id/#organization" },
    areaServed: { "@type": "Country", name: "Indonesia" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://texora.co.id/contact",
      servicePhone: "+62-878-8985-6066",
    },
  };

  const faqSchema = buildFaqSchema(
    faqs.map((f: any) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, serviceSchema, faqSchema]}
        id="ld-custom-sublimation"
      />
      <CustomSublimationClient />
    </>
  );
}
