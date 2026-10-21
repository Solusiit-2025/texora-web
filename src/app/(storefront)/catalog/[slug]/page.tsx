import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { JsonLd } from "@/components/common/JsonLd";
import { getStorefrontProductBySlug, getStorefrontProducts, getStorefrontTestimonials } from "@/lib/storefront-data";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeRows } from "@/lib/content-translator";
import { translate } from "@/lib/i18n/dictionary";
import {
  buildPageMetadata,
  buildProductSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  SITE_URL,
} from "@/lib/seo-metadata";
import { htmlToPlainText } from "@/lib/sanitize";

interface PageProps {
  params: { slug: string };
}

/**
 * Halaman detail produk katalog.
 *
 * Di-render sebagai SERVER component agar:
 *  - Metadata (title, description, canonical, OG) terbaca crawler tanpa JS.
 *  - Nama produk, harga, dan spesifikasi ada di HTML awal (WAJIB untuk SEO produk).
 *  - JSON-LD Product + BreadcrumbList tersedia untuk Google Rich Results.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getStorefrontProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Produk Tidak Found — PT. Texora Visi Prima",
      robots: { index: false, follow: true },
    };
  }

  const locale = await getRequestLocale();
  const plain = htmlToPlainText(product.description, 0);
  const keywords = [
    product.name,
    product.category,
    product.composition,
    product.weaveType,
    `kain ${product.category.toLowerCase()}`,
    "kain sublimasi jakarta",
    "buy kain sublimasi grosir",
  ].filter(Boolean);

  return buildPageMetadata({
    locale,
    path: `/catalog/${product.slug}`,
    // Nama produk dipotong agar total title tetap <= 62 karakter (batas ideal Google).
    title: `${product.name.slice(0, 40).trim()} — Kain Sublimasi | Texora`,
    description:
      plain ||
      `${product.name} — ${product.composition}, lebar ${product.widthInch} inci. Kain siap sublimasi untuk sportwear, hijab, dan merchandise. Harga grosir bertingkat.`,
    keywords,
    image: product.thumbnailUrl,
    schemaType: "product",
    ogType: "product",
    modifiedTime: product.updatedAt,
  });
}

export default async function FabricDetailPage({ params }: PageProps) {
  const lang = await getContentLocale();
  const productRaw = await getStorefrontProductBySlug(params.slug);
  const product =
    productRaw && lang
      ? (await localizeRows("product", [productRaw], (p: any) => p.slug, ["description"], lang))[0]
      : productRaw;

  if (!product) {
    notFound();
  }

  // Produk terkait: kategori sama, atau GSM terdekat bila kategori berbeda
  const [all, testimonials] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontTestimonials(),
  ]);
  const related = all
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => {
      const aScore = a.category === product.category ? 0 : 1;
      const bScore = b.category === product.category ? 0 : 1;
      if (aScore !== bScore) return aScore - bScore;
      return Math.abs(a.variants[0]?.gsm - (product.variants[0]?.gsm || 140)) -
        Math.abs(b.variants[0]?.gsm - (product.variants[0]?.gsm || 140));
    })
    .slice(0, 4);

  const breadcrumbItems = [
    { name: lang ? translate(lang, "nav.catalog") : "Katalog", path: "/catalog" },
    { name: product.name, path: `/catalog/${product.slug}` },
  ];

  const productSchema = buildProductSchema({
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: product.thumbnailUrl,
    category: product.category,
    composition: product.composition,
    widthInch: product.widthInch,
    basePrice: product.basePricePerMeter,
    variants: product.variants,
    priceTiers: product.priceTiers,
    color: product.variants?.[0]?.colorName || "Optic White",
    dateModified: product.updatedAt,
    // Ulasan dari testimoni CMS (dikonversi menjadi schema.org Review)
    reviews: testimonials.slice(0, 3).map((t) => ({
      author: t.name,
      quote: t.quote,
      rating: 5,
    })),
  });

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  const webPageSchema = buildWebPageSchema({
    path: `/catalog/${product.slug}`,
    name: product.name,
    description: htmlToPlainText(product.description, 0),
    breadcrumb: breadcrumbItems,
  });

  return (
    <>
      <JsonLd schema={[productSchema, breadcrumbSchema, webPageSchema]} id="ld-product" />
      <ProductDetailClient
        initialFabric={product}
        slug={params.slug}
        relatedProducts={related}
      />
    </>
  );
}
