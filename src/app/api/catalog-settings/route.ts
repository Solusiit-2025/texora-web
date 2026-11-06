import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isPriceHidden, setPriceHidden } from "@/lib/catalog-visibility";
import { invalidateCache } from "@/lib/cache";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * PENGATURAN VISIBILITAS KATALOG
 *
 * GET   /api/catalog-settings            → { hidePrices: boolean } (publik — dibaca storefront)
 * PUT   /api/catalog-settings { value }  → set hidePrices (admin saja)
 */

export async function GET() {
  return NextResponse.json(
    { success: true, hidePrices: await isPriceHidden() },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
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

    // Invalidate in-memory caches
    invalidateCache("storefront.products");
    invalidateCache("api.products");
    invalidateCache("storefront.");

    // Revalidate Next.js cache for storefront routes
    try {
      revalidatePath("/catalog");
      revalidatePath("/catalog/[slug]", "page");
      revalidatePath("/kategori/[slug]", "page");
      revalidatePath("/");
    } catch (e) {
      console.warn("[catalog-settings] revalidatePath warning:", e);
    }

    return NextResponse.json(
      { success: true, hidePrices: value },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("[catalog-settings] PUT gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
