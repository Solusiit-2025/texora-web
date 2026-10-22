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

/**
 * Header cache untuk endpoint publik.
 *
 * `?fresh=1` dipakai oleh PANEL ADMIN yang butuh data terbaru (mis. setelah
 * hapus/simpan konten) -> tidak boleh dilayani dari cache browser/CDN.
 * Tanpa parameter itu, respons boleh di-cache (hemat query DB untuk
 * pengunjung).
 */
function cacheHeaders(fresh: boolean): Record<string, string> {
  return fresh
    ? { "Cache-Control": "no-store, no-cache, must-revalidate" }
    : {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      };
}

export async function GET(request: Request) {
  const fresh =
    new URL(request.url).searchParams.get("fresh") === "1";
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
    { ttl: 60_000, stale: 600_000, bypass: fresh }
  );

  return NextResponse.json(
    { success: true, data },
    {
      // Browser & CDN boleh menyimpan 60 detik (isi jarang berubah),
      // kecuali diminta fresh oleh panel admin.
      headers: cacheHeaders(fresh),
    }
  );
}
