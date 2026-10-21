import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_LINKS_KEY,
  normalizeSocialLinks,
} from "@/config/social";

export const dynamic = "force-dynamic";

/**
 * GET /api/social-links — public, dibaca storefront (Footer, FloatingSocial).
 * Sumber: SiteContent key "social.links" (JSON array). Fallback ke default.
 *
 * Cache 60 detik: endpoint ini dipanggil 2x per halaman (Footer +
 * FloatingSocial) dan DB-nya remote (~180ms/query).
 */
export async function GET() {
  const data = await cached(
    "api.social-links",
    async () => {
      const row = await prisma.siteContent
        .findUnique({ where: { key: SOCIAL_LINKS_KEY } })
        .catch(() => null);
      if (!row?.value) return DEFAULT_SOCIAL_LINKS;
      try {
        return normalizeSocialLinks(JSON.parse(row.value));
      } catch {
        return DEFAULT_SOCIAL_LINKS;
      }
    },
    { ttl: 60_000, stale: 600_000 }
  );

  return NextResponse.json(
    { success: true, data },
    {
      headers: {
        // Browser & CDN boleh menyimpan 60 detik (isi jarang berubah)
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
