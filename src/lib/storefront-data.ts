/**
 * Pengambilan data storefront di sisi SERVER (React Server Component).
 *
 * Tujuannya: konten utama (produk, FAQ, testimoni) harus ada di HTML awal
 * agar Googlebot, Bingbot, dan AI crawler membacanya tanpa menjalankan JS.
 * Client component tetap bisa me-refresh data secara interaktif.
 */

import { prisma } from "@/lib/prisma";
import { cached, invalidateCache } from "@/lib/cache";
import type { FabricProduct } from "@/types";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  composition: string;
  weaveType: string;
  widthInch: number;
  isSublimationReady: boolean;
  basePricePerMeter: number;
  thumbnailUrl: string;
  category: string;
  updatedAt?: string;
  variants: Array<{
    id: string;
    gsm: number;
    colorName: string;
    stockMeters: number;
  }>;
  priceTiers: Array<{
    id: string;
    minMeters: number;
    maxMeters?: number;
    unitPrice: number;
  }>;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80";

function mapProduct(p: any): StorefrontProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || "",
    composition: p.composition || "",
    weaveType: p.weaveType || "",
    widthInch: Number(p.widthInch || 0),
    isSublimationReady: Boolean(p.isSublimationReady),
    basePricePerMeter: Number(p.basePricePerMeter || 0),
    thumbnailUrl: p.thumbnailUrl || FALLBACK_THUMB,
    category: p.category || "Sportswear",
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      gsm: Number(v.gsm),
      colorName: v.colorName,
      stockMeters: Number(v.stockMeters),
    })),
    priceTiers: (p.priceTiers || []).map((t: any) => ({
      id: t.id,
      minMeters: Number(t.minMeters),
      maxMeters: t.maxMeters ? Number(t.maxMeters) : undefined,
      unitPrice: Number(t.unitPrice),
    })),
  };
}

/** Ambil seluruh produk katalog (server-side). */
export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  // Cache 60 detik: query ini berat (products + variants + priceTiers, ~1 detik
  // di DB remote) dan dipakai di homepage, katalog, kategori, detail produk.
  return cached(
    "storefront.products",
    async () => {
      try {
        const rows = await prisma.fabricProduct.findMany({
          include: {
            variants: true,
            priceTiers: { orderBy: { minMeters: "asc" } },
          },
          orderBy: { createdAt: "asc" },
        });
        return rows.map(mapProduct);
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Ambil satu produk berdasarkan slug (server-side). */
export async function getStorefrontProductBySlug(
  slug: string
): Promise<StorefrontProduct | null> {
  try {
    const row = await prisma.fabricProduct.findUnique({
      where: { slug },
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
    });
    return row ? mapProduct(row) : null;
  } catch {
    return null;
  }
}

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface StorefrontHeroSlide {
  id: string;
  order: number;
  tag: string;
  caption: string;
  alt: string;
  mainImage: string;
  secondaryImage: string;
  isActive: boolean;
}

export interface StorefrontTestimonial {
  id: string;
  name: string;
  org: string;
  quote: string;
  order: number;
}

/** Ambil FAQ aktif (server-side) untuk JSON-LD FAQPage. */
export async function getStorefrontFaqs(): Promise<StorefrontFaq[]> {
  return cached(
    "storefront.faqs",
    async () => {
      try {
        const rows = await prisma.faqItem.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });
        return rows.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: f.order,
        }));
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Ambil slide hero aktif (server-side). */
export async function getStorefrontHeroSlides(): Promise<StorefrontHeroSlide[]> {
  return cached(
    "storefront.hero",
    async () => {
      try {
        const rows = await prisma.heroSlide.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });
        return rows.map((s) => ({
          id: s.id,
          order: s.order,
          tag: s.tag,
          caption: s.caption,
          alt: s.alt,
          mainImage: s.mainImage,
          secondaryImage: s.secondaryImage,
          isActive: s.isActive,
        }));
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Ambil testimoni aktif (server-side). */
export async function getStorefrontTestimonials(): Promise<StorefrontTestimonial[]> {
  return cached(
    "storefront.testimonials",
    async () => {
      try {
        const rows = await prisma.testimonial.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });
        return rows.map((t) => ({
          id: t.id,
          name: t.name,
          org: t.org,
          quote: t.quote,
          order: t.order,
        }));
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Ambil nilai satu key site content (server-side). */
export async function getSiteContentValue<T = any>(
  key: string,
  fallback: T
): Promise<T> {
  return cached(
    `sitecontent:${key}`,
    async () => {
      try {
        const row = await prisma.siteContent.findUnique({ where: { key } });
        if (!row?.value) return fallback;
        return JSON.parse(row.value) as T;
      } catch {
        return fallback;
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Buang cache konten storefront (dipanggil setelah admin menyimpan konten). */
export function invalidateStorefrontCache(): void {
  invalidateCache("storefront.");
  invalidateCache("sitecontent:");
}

/* ==========================================================================
   ARTIKEL / PUSAT PANDUAN TEKSTIL
   ========================================================================== */

export interface StorefrontArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  category: string;
  articleType: string;
  tags: string[];
  relatedProducts: string[];
  author: string;
  authorRole: string | null;
  readMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

/** Metadata kategori artikel (dipakai juga untuk filter di UI). */
export const ARTICLE_CATEGORIES = [
  { slug: "sportswear", name: "Sportswear & Activewear" },
  { slug: "hijab-fashion", name: "Fashion & Hijab" },
  { slug: "home-living", name: "Home Living & Dekorasi" },
  { slug: "merchandise", name: "Merchandise & Event" },
  { slug: "proses", name: "Proses, Teknis & Bisnis" },
] as const;

export function getArticleCategoryName(slug: string, fallback = "Panduan"): string {
  return (
    ARTICLE_CATEGORIES.find((c) => c.slug === slug)?.name ??
    CATEGORY_LABELS[slug] ??
    fallback
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  sportswear: "Sportswear & Activewear",
  "hijab-fashion": "Fashion & Hijab",
  "home-living": "Home Living & Dekorasi",
  merchandise: "Merchandise & Event",
  proses: "Proses, Teknis & Bisnis",
  panduan: "Panduan Tekstil",
};

function safeJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    return [];
  }
}

function mapArticle(a: any): StorefrontArticle {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    coverImage: a.coverImage || null,
    category: a.category || "panduan",
    articleType: a.articleType || "panduan",
    tags: safeJsonArray(a.tags),
    relatedProducts: safeJsonArray(a.relatedProducts),
    author: a.author || "Tim Tekstil Texora",
    authorRole: a.authorRole || null,
    readMinutes: Number(a.readMinutes || 4),
    seoTitle: a.seoTitle || null,
    seoDescription: a.seoDescription || null,
    publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Ambil artikel yang sudah publish (server-side).
 *
 * `lang` tidak memaksa pemanggilan AI: teks asing diambil dari cache
 * `content_translations` (dibuat oleh admin / job terjemahan). Kalau cache
 * kosong, fallback ke teks Bahasa Indonesia.
 */
export async function getStorefrontArticles(
  options: { lang?: string | null; category?: string | null; limit?: number } = {}
): Promise<StorefrontArticle[]> {
  const category = options.category || "all";
  const limit = options.limit ?? 100;
  const lang = options.lang || "id";

  return cached(
    `storefront.articles:${category}:${limit}`,
    async () => {
      try {
        const rows = await prisma.article.findMany({
          where: {
            isPublished: true,
            ...(category !== "all" ? { category } : {}),
          },
          orderBy: { publishedAt: "desc" },
          take: limit,
        });

        const articles = rows.map(mapArticle);

        if (lang !== "id") {
          const { localizeRows } = await import("@/lib/content-translator");
          return localizeRows(
            "article",
            articles,
            (a) => a.id,
            ["title", "excerpt", "body", "seoTitle"],
            lang
          );
        }

        return articles;
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Ambil satu artikel publish berdasarkan slug (server-side). */
export async function getStorefrontArticleBySlug(
  slug: string,
  lang?: string | null
): Promise<StorefrontArticle | null> {
  const useLang = lang || "id";
  return cached(
    `storefront.article:${slug}:${useLang}`,
    async () => {
      try {
        const row = await prisma.article.findFirst({
          where: { slug, isPublished: true },
        });
        if (!row) return null;

        const article = mapArticle(row);

        if (useLang !== "id") {
          const { localizeRows } = await import("@/lib/content-translator");
          const [out] = await localizeRows(
            "article",
            [article],
            (a) => a.id,
            ["title", "excerpt", "body", "seoTitle"],
            useLang
          );
          return out;
        }

        return article;
      } catch {
        return null;
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}

/** Artikel terkait (kategori sama, selain artikel ini). */
export async function getRelatedArticles(
  category: string,
  excludeId: string,
  limit = 3
): Promise<StorefrontArticle[]> {
  return cached(
    `storefront.related:${category}:${excludeId}:${limit}`,
    async () => {
      try {
        const rows = await prisma.article.findMany({
          where: { isPublished: true, category, id: { not: excludeId } },
          orderBy: { publishedAt: "desc" },
          take: limit,
        });
        return rows.map(mapArticle);
      } catch {
        return [];
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );
}
