/**
 * Library SEO & AI-Readiness.
 *
 * Menyediakan:
 *  1. `buildPageMetadata()` — membangun `Metadata` Next.js (server-side, dibaca crawler).
 *  2. Kumpulan pembangun JSON-LD (schema.org) untuk Google Rich Results & AI crawler.
 *
 * Prinsip:
 *  - Semua metadata harus di-render di SERVER agar Googlebot, Bingbot, dan
 *    AI crawler (GPTBot, ClaudeBot, PerplexityBot, dll.) membacanya tanpa
 *    harus mengeksekusi JavaScript.
 *  - JSON-LD ditulis sebagai `<script type="application/ld+json">` statis di
 *    dalam HTML, bukan di-inject setelah hydration.
 */

import type { Metadata } from "next";
import { getSeoSettings, type SeoPageMeta } from "@/lib/seo";
import { htmlToPlainText } from "@/lib/sanitize";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

export const SITE_NAME = "PT. Texora Visi Prima";
export const SITE_LOCALE = "id_ID";
export const DEFAULT_OG_IMAGE = "/images/hero/hero-printer.jpg";

export const COMPANY = {
  name: SITE_NAME,
  legalName: "PT. Texora Visi Prima",
  url: SITE_URL,
  logo: `${SITE_URL}/icons/texora-logo.png`,
  description:
    "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain, visualizer motif, harga bertingkat, dan portal B2B terintegrasi.",
  address: {
    street: "Tugu Utara, Tanjung Priok",
    locality: "Jakarta Utara",
    region: "DKI Jakarta",
    postalCode: "14140",
    country: "ID",
  },
  contact: {
    phone: "+62-878-8985-6066",
    email: "sales@texora.co.id",
    whatsapp: "6287889856066",
  },
  foundingDate: "2019",
  vatID: "01.234.567.8-901.000",
};

/* ==========================================================================
   1. METADATA BUILDER
   ========================================================================== */

/**
 * Potong deskripsi meta pada batas kata (bukan memotong di tengah kata)
 * agar tidak terlihat terpotong aneh di hasil pencarian.
 */
export function truncateDescription(text: string, maxLength = 160): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const truncated = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${truncated.trim()}…`;
}

export interface PageMetaInput {
  /** Path halaman, mis. "/catalog/dryfit-milano" */
  path: string;
  /** Judul halaman (tanpa suffix perusahaan — akan ditambahkan otomatis). */
  title?: string;
  description?: string;
  /** Kata kunci tambahan. */
  keywords?: string[];
  /** URL gambar OG (path absolut relatif ke domain). */
  image?: string;
  /** Tipe schema.org untuk JSON-LD (Produk, Article, dsb). */
  schemaType?: SeoPageMeta["schemaType"];
  /** Tipe konten untuk Open Graph. */
  ogType?: "website" | "article" | "product";
  /** Cegah halaman ini di-index (halaman auth, area privat). */
  noindex?: boolean;
  /** Judul kanonik custom (default = path). */
  canonical?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /**
   * Locale halaman (hasil getRequestLocale()). Bila bukan "id", canonical
   * memakai prefix /{locale}/ dan tag hreflang lengkap dibuat otomatis.
   */
  locale?: string;
}

/** Semua varian URL bilingual utk hreflang (home tanpa trailing slash). */
function localeVariants(path: string): Record<string, string> {
  const base = path === "/" ? "/" : path;
  const out: Record<string, string> = { id: base, "x-default": base };
  for (const l of ["en", "zh", "ja", "de", "ar"]) {
    out[l] = base === "/" ? `/${l}` : `/${l}${base}`;
  }
  return out;
}

/** Nilai <meta property="og:locale"> per bahasa. */
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  zh: "zh_CN",
  ja: "ja_JP",
  de: "de_DE",
  ar: "ar_AR",
};

/**
 * Bangun objek `Metadata` Next.js dari pengaturan CMS + parameter halaman.
 * Fungsi ini dipanggil dari `generateMetadata()` pada halaman server component.
 */
export async function buildPageMetadata(input: PageMetaInput): Promise<Metadata> {
  const seo = await getSeoSettings();
  const pageMeta = seo.pages[input.path];
  const global = seo.global;

  const pageLocale = input.locale && input.locale !== "id" ? input.locale : null;

  let title = input.title || pageMeta?.title || global.title;
  let description =
    input.description ||
    pageMeta?.description ||
    global.description ||
    htmlToPlainText(pageMeta?.excerpt, 0);

  // Tahap 2: terjemahkan title & description utk halaman berprefik bahasa
  // (di-cache di content_translations; tanpa API key tetap teks Indonesia).
  if (pageLocale) {
    try {
      const { localizeObject } = await import("@/lib/content-translator");
      const localized = await localizeObject(
        "seoMeta",
        input.path,
        { title, description },
        ["title", "description"],
        pageLocale
      );
      if (typeof localized.title === "string" && localized.title) title = localized.title;
      if (typeof localized.description === "string" && localized.description)
        description = localized.description;
    } catch {
      /* translator belum tersedia -> pakai teks asli */
    }
  }

  const keywords = Array.from(
    new Set([...(global.keywords || "").split(",").map((k) => k.trim()).filter(Boolean), ...(input.keywords || [])])
  );

  // Canonical: halaman berprefik bahasa menunjuk ke URL-nya sendiri (mis. /de/about),
  // halaman Indonesia menunjuk path aslinya.
  const canonical =
    input.canonical || (pageLocale ? localeVariants(input.path)[pageLocale] : input.path);
  const image = input.image || global.ogImage || DEFAULT_OG_IMAGE;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  // hreflang: hanya utk halaman indexable. Varian bahasa ditulis penuh
  // (id + x-default menunjuk URL Indonesia kanonik).
  const languages = input.noindex ? undefined : localeVariants(input.path);

  const robots: Metadata["robots"] = input.noindex
    ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      };

  // CATATAN: Next.js memvalidasi `openGraph.type` di RUNTIME dan hanya
  // menerima "website" | "article" (meskipun OG spec punya "product").
  // Karena itu tipe produk memakai "website" - semantik produk tetap
  // tercermin lewat JSON-LD schema.org `Product` + `AggregateOffer`.
  const ogType: "website" | "article" =
    input.ogType === "article" ? "article" : "website";

  // Google memotong title > 60 karakter & description > 160 karakter.
  // Potong otomatis supaya tidak ada yang "truncated" di hasil pencarian.
  const finalTitle = title.length > 62 ? `${title.slice(0, 59).trim()}…` : title;
  const finalDescription = truncateDescription(
    htmlToPlainText(description, 0),
    160
  );

  return {
    // `absolute` mencegah template `%s | PT. Texora Visi Prima` dari root
    // layout ditambahkan lagi (meng Causes title jadi terlalu panjang).
    title: { absolute: finalTitle },
    description: finalDescription,
    keywords,
    alternates: {
      canonical,
      languages,
    },
    robots,
    openGraph: {
      type: ogType,
      locale: pageLocale ? OG_LOCALES[pageLocale] || SITE_LOCALE : SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description: finalDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [imageUrl],
      creator: "@texoravisiprima",
      site: "@texoravisiprima",
    },
    other: {
      "geo.region": "ID-JK",
      "geo.placename": "Jakarta Utara",
      "geo.position": "-6.1214;106.8839",
      ICBM: "-6.1214, 106.8839",
    },
  };
}

/**
 * Metadata untuk halaman area privat / autentikasi.
 * Selalu `noindex, nofollow` agar tidak masuk indeks Google.
 */
export function buildNoIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noarchive: true, nosnippet: true },
    },
  };
}

/* ==========================================================================
   2. JSON-LD SCHEMA BUILDER
   ========================================================================== */

/** WebSite + SearchAction (membuat Google menampilkan sitelinks searchbox). */
export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: COMPANY.description,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** LocalBusiness (pengganti & melengkapi Organization) — data lokasi & jam operasional. */
export function buildLocalBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Manufacturer", "WholesaleStore"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: COMPANY.logo,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description: COMPANY.description,
    slogan: "Manufaktur Kain & Sublimasi Skala Industri",
    foundingDate: COMPANY.foundingDate,
    vatID: COMPANY.vatID,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.1214,
      longitude: 106.8839,
    },
    areaServed: [
      { "@type": "Country", name: "Indonesia" },
      { "@type": "AdministrativeArea", name: "DKI Jakarta" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "08:00",
        closes: "13:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: COMPANY.contact.phone,
        email: COMPANY.contact.email,
        contactType: "sales",
        areaServed: "ID",
        // Deklarasikan dukungan layanan multi-bahasa (id, en, zh, ja, de, ar)
        availableLanguage: ["id", "en", "zh", "ja", "de", "ar"],
      },
    ],
    sameAs: [
      "https://www.instagram.com/xora_hijab",
      "https://www.tiktok.com/@xoramateria",
      "https://www.youtube.com/@texoravisiprima",
      "https://www.facebook.com/profile.php?id=61595062856326",
      "https://www.linkedin.com/company/texora-visi-prima",
    ],
    knowsAbout: [
      "Kain sublimasi",
      "Polyester fabric",
      "Digital sublimation printing",
      "Rotary heat press",
      "Sportswear textile",
      "Kain pelapis",
    ],
  };
}

export interface ProductSchemaInput {
  name: string;
  slug: string;
  description: string;
  image: string;
  category?: string;
  composition?: string;
  widthInch?: number;
  basePrice?: number;
  currency?: string;
  variants?: Array<{ gsm: number; colorName: string; stockMeters: number }>;
  priceTiers?: Array<{ minMeters: number; maxMeters?: number; unitPrice: number }>;
  sku?: string;
  /** Warna dasar kain (untuk schema color). */
  color?: string;
  /** Ulasan produk (untuk schema Review + AggregateRating). */
  reviews?: Array<{ author: string; quote: string; rating?: number }>;
  /** Tanggal produk diperbarui terakhir. */
  dateModified?: string;
}

/** Product + Offer (AggregateOffer) — enables rich result harga di Google. */
export function buildProductSchema(input: ProductSchemaInput): Record<string, unknown> {
  const currency = input.currency || "IDR";
  const image = input.image?.startsWith("http") ? input.image : `${SITE_URL}${input.image || DEFAULT_OG_IMAGE}`;

  const offers =
    input.priceTiers && input.priceTiers.length > 0
      ? {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          lowPrice: Math.min(...input.priceTiers.map((t) => t.unitPrice)),
          highPrice: Math.max(...input.priceTiers.map((t) => t.unitPrice)),
          offerCount: input.priceTiers.length,
          offers: input.priceTiers.map((t) => ({
            "@type": "Offer",
            priceCurrency: currency,
            price: t.unitPrice,
            availability: "https://schema.org/InStock",
            eligibleQuantity: {
              "@type": "QuantitativeValue",
              minValue: t.minMeters,
              maxValue: t.maxMeters ?? 100000,
              unitCode: "MTR",
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: t.unitPrice,
              priceCurrency: currency,
              unitCode: "MTR",
            },
          })),
        }
      : {
          "@type": "Offer",
          priceCurrency: currency,
          price: input.basePrice ?? 0,
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/catalog/${input.slug}`,
        };

  const props: Record<string, unknown>[] = [];
  if (input.composition) {
    props.push({ "@type": "PropertyValue", name: "Komposisi Serat", value: input.composition });
  }
  if (input.widthInch) {
    props.push({ "@type": "PropertyValue", name: "Lebar Kain", value: `${input.widthInch} inci` });
  }
  if (input.variants?.length) {
    props.push({
      "@type": "PropertyValue",
      name: "Pilihan Gramatur",
      value: input.variants.map((v) => `${v.gsm} GSM (${v.colorName})`).join(", "),
    });
  }
  if (input.variants?.length) {
    props.push({
      "@type": "PropertyValue",
      name: "Stok Tersedia",
      value: `${input.variants.reduce((s, v) => s + v.stockMeters, 0).toLocaleString("id-ID")} meter`,
    });
  }

  // --- Ulasan & rating (dari testimoni CMS) ---
  const reviews = (input.reviews || []).filter((r) => r.quote && r.author);
  const reviewSchema =
    reviews.length > 0
      ? reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewBody: htmlToPlainText(r.quote, 500),
          ...(r.rating
            ? { reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 } }
            : {}),
          datePublished: input.dateModified,
        }))
      : undefined;

  const ratingValue = input.reviews?.length
    ? Math.round(
        (input.reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / input.reviews.length) * 10
      ) / 10
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/catalog/${input.slug}#product`,
    name: input.name,
    url: `${SITE_URL}/catalog/${input.slug}`,
    image: [image],
    description: htmlToPlainText(input.description, 300),
    sku: input.sku || input.slug,
    mpn: input.sku || `TXP-${input.slug.toUpperCase().slice(0, 12)}`,
    category: input.category || "Kain Sublimasi",
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    material: input.composition || "Polyester",
    color: input.color || "Optic White",
    size: input.widthInch ? `${input.widthInch} in` : undefined,
    weight:
      input.variants?.[0] && input.widthInch
        ? {
            "@type": "QuantitativeValue",
            value:
              Math.round(((input.variants[0].gsm * input.widthInch) / 1000) * 100) / 100,
            unitCode: "KGM",
          }
        : undefined,
    inLanguage: "id-ID",
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(reviewSchema ? { review: reviewSchema } : {}),
    ...(ratingValue
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers,
    additionalProperty: props,
  };
}

/** FAQPage — kans rich result "People Also Ask" & mudah disimulasikan AI. */
export function buildFaqSchema(
  faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> | null {
  const items = faqs
    .filter((f) => f?.question && f?.answer)
    .map((f) => ({
      "@type": "Question",
      name: htmlToPlainText(f.question, 0),
      acceptedAnswer: {
        "@type": "Answer",
        text: htmlToPlainText(f.answer, 1200),
      },
    }));

  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: items,
  };
}

/** BreadcrumbList — menampilkan jalur navigasi di hasil pencarian Google. */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

/** AboutPage / ContactPage — untuk halaman profil & kontak. */
export function buildWebPageSchema(input: {
  path: string;
  name: string;
  description: string;
  breadcrumb?: Array<{ name: string; path: string }>;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${input.path}#webpage`,
    url: `${SITE_URL}${input.path}`,
    name: input.name,
    description: htmlToPlainText(input.description, 300),
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    ...(input.breadcrumb ? { breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` } } : {}),
  };
}

/**
 * Gabungkan beberapa schema menjadi satu array JSON-LD.
 * Dipakai untuk menyuntik beberapa `<script type="application/ld+json">` sekaligus.
 */
export function combineSchemas(
  ...schemas: Array<Record<string, unknown> | null | undefined>
): string {
  const valid = schemas.filter(Boolean) as Array<Record<string, unknown>>;
  return JSON.stringify(valid.length === 1 ? valid[0] : valid);
}
