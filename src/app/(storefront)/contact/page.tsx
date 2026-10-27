import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server-locale";
import ContactClient from "./ContactClient";
import { JsonLd } from "@/components/common/JsonLd";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildLocalBusinessSchema,
  SITE_URL,
} from "@/lib/seo-metadata";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

/**
 * Halaman Hubungi Kami.
 * Server component: informasi kontak & schema.org ContactPage tersedia untuk
 * Google (LocalBusiness) dan AI crawler.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: SEO_PAGES["/contact"].title,
    description: SEO_PAGES["/contact"].description,
    keywords: [
      "kontak pabrik sublimasi",
      "minta penawaran kain sublimasi",
      "sample kain gratis jakarta",
      "supplier kain grosir jakarta",
      "hubungi xoramateria",
    ],
    schemaType: "organization",
  });
}

export default async function ContactPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Kontak Kami", path: "/contact" },
  ]);

  const webPageSchema = buildWebPageSchema({
    path: "/contact",
    name: "Kontak Kami — XoraMateria",
    description:
      "Konsultasi pengadaan kain sublimasi B2B dan permintaan sampel swatch gratis.",
    breadcrumb: [{ name: "Kontak Kami", path: "/contact" }],
  });

  const businessSchema = buildLocalBusinessSchema();

  // ContactPage menautkan entitas bisnis agar AI bisa Connecting-the-dots
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contact#contactpage`,
    url: `${SITE_URL}/contact`,
    name: "Kontak Kami — XoraMateria",
    description:
      "Formulir konsultasi procurement kain sublimasi dan permintaan sampel swatch.",
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, businessSchema, contactPageSchema]}
        id="ld-contact"
      />
      <ContactClient />
    </>
  );
}
