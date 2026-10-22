/**
 * Sitemap XML dinamis (Route Handler) + hreflang multi-bahasa.
 *
 * Setiap URL storefront bilingual menuliskan:
 *  - <loc> varian URL-nya sendiri
 *  - <xhtml:link rel="alternate" hreflang="..."> utk SEMUA bahasa (id, en, zh,
 *    ja, de, ar) + x-default -> Google memahami relasi antar-bahasa.
 *
 * Selain itu tetap ada:
 *  - <image:image> per produk (optimasi Google Images)
 *  - lastModified dari updatedAt (bukan "now")
 *  - halaman yang dinonaktifkan di CMS dikeluarkan.
 */

import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** URL varian tiap bahasa + x-default untuk sebuah path dasar. */
function alternates(path: string): Array<{ lang: string; href: string }> {
  const base = path === "/" ? "/" : path;
  const out: Array<{ lang: string; href: string }> = [
    { lang: "id", href: `${SITE_URL}${base}` },
    { lang: "x-default", href: `${SITE_URL}${base}` },
  ];
  for (const l of ["en", "zh", "ja", "de", "ar"]) {
    out.push({
      lang: l,
      href: `${SITE_URL}${base === "/" ? `/${l}` : `/${l}${base}`}`,
    });
  }
  return out;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  /** Alternates hreflang (kosong bila tidak bilingual). */
  alternates?: Array<{ lang: string; href: string }>;
  images?: Array<{ loc: string; title: string; caption?: string }>;
}

export async function GET() {
  const disabled = new Set<string>();
  try {
    const seo = await getSeoSettings();
    for (const [path, meta] of Object.entries(seo.pages || {})) {
      if ((meta as any)?.enabled === false) disabled.add(path);
    }
  } catch {}

  const isEnabled = (path: string) => !disabled.has(path);

  let siteUpdatedAt = new Date();
  try {
    const latest = await prisma.siteContent.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    if (latest?.updatedAt) siteUpdatedAt = latest.updatedAt;
  } catch {}

  const entries: SitemapEntry[] = [];

  const staticEntries: Array<{ path: string; changefreq: string; priority: number }> = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/catalog", changefreq: "daily", priority: 0.9 },
    { path: "/custom-sublimation", changefreq: "weekly", priority: 0.8 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/contact", changefreq: "monthly", priority: 0.7 },
    { path: "/request-quote", changefreq: "weekly", priority: 0.85 },
    { path: "/artikel", changefreq: "weekly", priority: 0.8 },
    // Halaman trust (E-E-A-T) — hanya Bahasa Indonesia, tanpa hreflang.
    { path: "/privacy", changefreq: "yearly", priority: 0.3 },
    { path: "/terms", changefreq: "yearly", priority: 0.3 },
    { path: "/penulis", changefreq: "monthly", priority: 0.5 },
  ];

  // Halaman yang tidak punya varian terjemahan.
  const NO_TRANSLATION = new Set(["/privacy", "/terms", "/penulis"]);

  for (const s of staticEntries) {
    if (!isEnabled(s.path)) continue;
    entries.push({
      loc: `${SITE_URL}${s.path}`,
      lastmod: toIsoDate(siteUpdatedAt),
      changefreq: s.changefreq,
      priority: s.priority,
      alternates: NO_TRANSLATION.has(s.path) ? undefined : alternates(s.path),
    });
  }

  // Produk + image entries + hreflang
  try {
    const products = await prisma.fabricProduct.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        updatedAt: true,
        category: true,
      },
    });

    for (const p of products) {
      const image = p.thumbnailUrl
        ? p.thumbnailUrl.startsWith("http")
          ? p.thumbnailUrl
          : `${SITE_URL}${p.thumbnailUrl}`
        : null;
      const path = `/catalog/${p.slug}`;

      entries.push({
        loc: `${SITE_URL}${path}`,
        lastmod: toIsoDate(p.updatedAt),
        changefreq: "weekly",
        priority: 0.8,
        alternates: alternates(path),
        images: image
          ? [
              {
                loc: image,
                title: `${p.name} — Kain ${p.category} Siap Sublimasi`,
                caption: p.description?.slice(0, 160),
              },
            ]
          : undefined,
      });
    }

    // Halaman kategori (query) — bukan landing page bilingual, tanpa hreflang
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    if (isEnabled("/catalog")) {
      for (const cat of categories) {
        entries.push({
          loc: `${SITE_URL}/catalog?category=${encodeURIComponent(cat)}`,
          lastmod: toIsoDate(siteUpdatedAt),
          changefreq: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {}

  // Artikel (Pusat Panduan Tekstil) - bilingual + tanggal terbit
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, title: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });

    for (const a of articles) {
      const path = `/artikel/${a.slug}`;
      entries.push({
        loc: `${SITE_URL}${path}`,
        lastmod: toIsoDate(a.publishedAt || a.updatedAt),
        changefreq: "monthly",
        priority: 0.7,
        alternates: alternates(path),
      });
    }
  } catch {}

  // Landing page kategori (/kategori/*) bilingual
  try {
    const { CATEGORY_SEO } = await import("@/lib/category-seo");
    if (isEnabled("/catalog")) {
      entries.push({
        loc: `${SITE_URL}/kategori`,
        lastmod: toIsoDate(siteUpdatedAt),
        changefreq: "weekly",
        priority: 0.7,
        alternates: alternates("/kategori"),
      });

      for (const cat of CATEGORY_SEO) {
        const path = `/kategori/${cat.slug}`;
        entries.push({
          loc: `${SITE_URL}${path}`,
          lastmod: toIsoDate(siteUpdatedAt),
          changefreq: "weekly",
          priority: 0.7,
          alternates: alternates(path),
        });
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
${(e.alternates || [])
  .map(
    (a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${escapeXml(a.href)}"/>`
  )
  .join("\n")}
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
${(e.images || [])
  .map(
    (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>${
        img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ""
      }
    </image:image>`
  )
  .join("\n")}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
