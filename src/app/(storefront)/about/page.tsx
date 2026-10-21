import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { JsonLd } from "@/components/common/JsonLd";
import { getSiteContentValue } from "@/lib/storefront-data";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeObject } from "@/lib/content-translator";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildLocalBusinessSchema,
} from "@/lib/seo-metadata";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

/**
 * Halaman Tentang Kami.
 * Server component: profil perusahaan terbaca crawler + JSON-LD AboutPage.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: "/about",
    title: SEO_PAGES["/about"].title,
    description: SEO_PAGES["/about"].description,
    keywords: [
      "profil perusahaan texora",
      "pabrik tekstil jakarta utara",
      "manufaktur kain polyester indonesia",
      "pabrik sublimasi tanjung priok",
      "tentang pt texora visi prima",
    ],
    schemaType: "organization",
  });
}

export default async function AboutPage() {
  const lang = await getContentLocale();
  const raw = await getSiteContentValue<any>("site.pages", {});
  const pageContent = lang
    ? await localizeObject(
        "siteContent",
        "site.pages",
        raw || {},
        ["aboutTitle", "aboutDescription", "aboutCaption"],
        lang
      )
    : raw;

  const breadcrumbSchema = buildBreadcrumbSchema([{ name: "Tentang Kami", path: "/about" }]);
  const webPageSchema = buildWebPageSchema({
    path: "/about",
    name: "Tentang Kami — PT. Texora Visi Prima",
    description:
      "Profil perusahaan, kapasitas produksi, dan proses sublimasi skala industri PT. Texora Visi Prima.",
    breadcrumb: [{ name: "Tentang Kami", path: "/about" }],
  });
  const businessSchema = buildLocalBusinessSchema();

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, businessSchema]}
        id="ld-about"
      />
      <AboutClient
        pageContent={{
          aboutHeroImage: pageContent?.aboutHeroImage,
          aboutTitle: pageContent?.aboutTitle,
          aboutDescription: pageContent?.aboutDescription,
          aboutCaption: pageContent?.aboutCaption,
        }}
      />
    </>
  );
}
