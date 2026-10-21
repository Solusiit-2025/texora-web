/**
 * Utilitas bersama untuk entity "article" (Pusat Panduan Tekstil).
 *
 * Dipakai oleh API CMS (create/update), panel admin, dan skrip seed agar
 * format data artikel konsisten & aman (slug unik, HTML tersanitasi).
 */

import { sanitizeHtml, htmlToPlainText } from "@/lib/sanitize";

export interface ArticleInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  coverImage?: string | null;
  category?: string;
  articleType?: string;
  tags?: string[] | string;
  relatedProducts?: string[] | string;
  author?: string;
  authorRole?: string | null;
  readMinutes?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished?: boolean;
  publishedAt?: string | Date | null;
}

/** Kategori artikel yang valid (harus sinkron dengan ARTICLE_CATEGORIES). */
export const ARTICLE_CATEGORY_SLUGS = [
  "sportswear",
  "hijab-fashion",
  "home-living",
  "merchandise",
  "proses",
  "panduan",
] as const;

export const ARTICLE_TYPE_SLUGS = [
  "panduan",
  "tips",
  "case-study",
  "news",
] as const;

export function slugifyArticleSlug(input: string): string {
  return (
    String(input || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .slice(0, 90) || "artikel"
  );
}

function toArray(value: string[] | string | undefined | null): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // bukan JSON -> pecah per koma
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Normalisasi payload artikel menjadi data yang aman disimpan:
 *  - HTML body disanitasi (anti-XSS)
 *  - slug dibersihkan & dibatasi 90 karakter
 *  - array (tags, relatedProducts) disimpan sebagai JSON string
 *  - publishedAt diisi otomatis saat pertama kali dipublish
 */
export function normalizeArticleInput(
  input: ArticleInput,
  existing?: { slug?: string; publishedAt?: Date | null } | null
): Record<string, any> {
  const title = String(input.title || "").trim();
  const slug = slugifyArticleSlug(input.slug || title);

  const body = sanitizeHtml(input.body || "");
  const excerptSource = input.excerpt?.trim() || htmlToPlainText(body, 300);

  const isPublished = input.isPublished === true;
  const publishedAt =
    input.publishedAt != null
      ? new Date(input.publishedAt)
      : isPublished
      ? existing?.publishedAt || new Date()
      : null;

  const readMinutes =
    Number.isFinite(Number(input.readMinutes)) && Number(input.readMinutes) > 0
      ? Math.min(Number(input.readMinutes), 60)
      : Math.max(1, Math.round(htmlToPlainText(body, 100000).split(/\s+/).length / 200));

  const category = ARTICLE_CATEGORY_SLUGS.includes(
    (input.category || "panduan") as any
  )
    ? input.category
    : "panduan";

  const articleType = ARTICLE_TYPE_SLUGS.includes(
    (input.articleType || "panduan") as any
  )
    ? input.articleType
    : "panduan";

  return {
    slug,
    title,
    excerpt: excerptSource,
    body,
    coverImage: input.coverImage || null,
    category,
    articleType,
    tags: JSON.stringify(toArray(input.tags)),
    relatedProducts: JSON.stringify(toArray(input.relatedProducts)),
    author: String(input.author || "Tim Tekstil Texora").trim(),
    authorRole: input.authorRole?.trim() || null,
    readMinutes,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    isPublished,
    publishedAt,
  };
}
