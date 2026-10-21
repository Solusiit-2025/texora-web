import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server-locale";
import ContactClient from "./ContactClient";
import { JsonLd } from "@/components/common/JsonLd";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildLocalBusinessSchema,
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
      "hubungi texora visi prima",
    ],
    schemaType: "organization",
  });
}

export default async function ContactPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Hubungi Kami", path: "/contact" },
  ]);

  const webPageSchema = buildWebPageSchema({
    path: "/contact",
    name: "Hubungi Kami — PT. Texora Visi Prima",
    description:
      "Konsultasi pengadaan kain sublimasi B2B dan permintaan sampel swatch gratis.",
    breadcrumb: [{ name: "Hubungi Kami", path: "/contact" }],
  });

  const businessSchema = buildLocalBusinessSchema();

  // ContactPage menautkan entitas bisnis agar AI bisa Connecting-the-dots
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://texora.co.id/contact#contactpage",
    url: "https://texora.co.id/contact",
    name: "Hubungi Kami — PT. Texora Visi Prima",
    description:
      "Formulir konsultasi procurement kain sublimasi dan permintaan sampel swatch.",
    inLanguage: "id-ID",
    isPartOf: { "@id": "https://texora.co.id/#website" },
    about: { "@id": "https://texora.co.id/#organization" },
    mainEntity: { "@id": "https://texora.co.id/#organization" },
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
