import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_LINKS_KEY,
  normalizeSocialLinks,
} from "@/config/social";

export const dynamic = "force-dynamic";

/**
 * GET /api/social-links — public, dibaca storefront (Footer, FloatingSocial).
 * Sumber: SiteContent key "social.links" (JSON array). Fallback ke default.
 */
export async function GET() {
  try {
    const row = await prisma.siteContent
      .findUnique({ where: { key: SOCIAL_LINKS_KEY } })
      .catch(() => null);
    if (!row?.value) {
      return NextResponse.json({ success: true, data: DEFAULT_SOCIAL_LINKS });
    }
    try {
      const parsed = JSON.parse(row.value);
      return NextResponse.json({
        success: true,
        data: normalizeSocialLinks(parsed),
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: DEFAULT_SOCIAL_LINKS,
      });
    }
  } catch (err: any) {
    console.error("Error fetching social links:", err);
    return NextResponse.json({
      success: true,
      data: DEFAULT_SOCIAL_LINKS,
    });
  }
}
