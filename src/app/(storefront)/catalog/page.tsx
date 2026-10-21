import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";
import { JsonLd } from "@/components/common/JsonLd";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { getRequestLocale, getContentLocale } from "@/lib/server-locale";
import { localizeRows } from "@/lib/content-translator";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/lib/seo-metadata";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

/**
 * Halaman katalog kain.
 *
 * Server component: seluruh daftar produk di-render pada HTML awal sehingga
 * Googlebot & AI crawler dapat mengindeks nama produk, komposisi, lebar kain,
 * dan harga bertingkat tanpa menjalankan JavaScript.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata({
    locale,
    path: "/catalog",
    title: SEO_PAGES["/catalog"].title,
    description: SEO_PAGES["/catalog"].description,
    keywords: [
      "katalog kain sublimasi",
      "jual kain dryfit milano",
      "kain voal ultrafine grosir",
      "kain canvas sublimasi jakarta",
      "harga kain sublimasi per meter",
      "supplier kain polyester industri",
    ],
    schemaType: "product",
  });
}

export default async function CatalogPage() {
  const lang = await getContentLocale();
  const productsRaw = await getStorefrontProducts();
  const products = lang
    ? await localizeRows("product", productsRaw, (p: any) => p.slug, ["description"], lang)
    : productsRaw;

  const breadcrumbSchema = buildBreadcrumbSchema([{ name: "Katalog", path: "/catalog" }]);

  const webPageSchema = buildWebPageSchema({
    path: "/catalog",
    name: "Katalog Kain Industri",
    description:
      "Katalog kain poliester industri siap cetak sublimasi dengan harga grosir bertingkat.",
    breadcrumb: [{ name: "Katalog", path: "/catalog" }],
  });

  // ItemList membantu Google memahami struktur katalog & menampilkan produk
  // dalam rich result.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://texora.co.id/catalog#itemlist",
    name: "Katalog Kain Sublimasi",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://texora.co.id/catalog/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <JsonLd
        schema={[breadcrumbSchema, webPageSchema, itemListSchema]}
        id="ld-catalog"
      />
      <CatalogClient initialFabrics={products} />
    </>
  );
}
