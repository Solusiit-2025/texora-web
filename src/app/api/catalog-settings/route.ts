import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isPriceHidden, setPriceHidden } from "@/lib/catalog-visibility";

export const dynamic = "force-dynamic";

/**
 * PENGATURAN VISIBILITAS KATALOG
 *
 * GET   /api/catalog-settings            → { hidePrices: boolean } (publik — dibaca storefront)
 * PUT   /api/catalog-settings { value }  → set hidePrices (admin saja)
 */

export async function GET() {
  return NextResponse.json({ success: true, hidePrices: await isPriceHidden() });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Hanya admin yang dapat mengubah pengaturan ini." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const value = Boolean(body.hidePrices);
    await setPriceHidden(value);
    return NextResponse.json({ success: true, hidePrices: value });
  } catch (err) {
    console.error("[catalog-settings] PUT gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
