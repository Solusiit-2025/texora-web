import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { normalizeLocale } from "@/lib/content-translator";
import { localizeRows } from "@/lib/content-translator";
import { canManageContent } from "@/lib/rbac/authorize";

export const dynamic = "force-dynamic";

/**
 * GET /api/articles
 *
 * Tanpa parameter:
 *   - daftar artikel PUBLISH (publik, untuk render client-side)
 *
 * ?admin=1
 *   - daftar lengkap termasuk draft (Administrator/Sales Rep saja)
 *
 * ?slug=xyz
 *   - satu artikel publish
 *
 * ?lang=xx
 *   - isi diambil dari cache terjemahan (TIDAK memanggil AI).
 */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const lang = normalizeLocale(params.get("lang"));
    const isAdmin = params.get("admin") === "1";

    // ---------------------------------------------------------------
    // Mode check: dipakai middleware untuk menentukan apakah sebuah
    // artikel masih ada. Balas 404 kalau tidak ada, supaya middleware
    // bisa mengembalikan status 404 yang benar (bukan soft 404).
    // ---------------------------------------------------------------
    if (params.get("check") === "1") {
      const slug = params.get("slug") || "";
      const { getStorefrontArticleBySlug } = await import("@/lib/storefront-data");
      const article = slug ? await getStorefrontArticleBySlug(slug, "id") : null;
      if (!article) {
        return NextResponse.json(
          { success: false, exists: false },
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { success: true, exists: true },
        { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
      );
    }
    const slug = params.get("slug");

    if (isAdmin) {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Sesi tidak valid. Silakan login kembali." },
          { status: 401 }
        );
      }
      if (!(await canManageContent(user.role)) && user.role !== "SALES_REP") {
        return NextResponse.json(
          { success: false, error: "Tidak memiliki akses ke daftar artikel." },
          { status: 403 }
        );
      }

      const rows = await prisma.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: 300,
      });
      return NextResponse.json(
        { success: true, data: rows },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (slug) {
      const { getStorefrontArticleBySlug } = await import("@/lib/storefront-data");
      const article = await getStorefrontArticleBySlug(slug, lang);
      if (!article) {
        return NextResponse.json(
          { success: false, error: "Artikel tidak ditemukan." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: article },
        {
          headers: {
            "Cache-Control":
              "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const { getStorefrontArticles } = await import("@/lib/storefront-data");
    const articles = await getStorefrontArticles({ lang });

    return NextResponse.json(
      { success: true, data: articles },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[articles] Gagal memuat artikel:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat artikel." },
      { status: 500 }
    );
  }
}
