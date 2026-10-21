import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { normalizeLocale } from "@/lib/content-translator";
import { localizeRows } from "@/lib/content-translator";

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
    const slug = params.get("slug");

    if (isAdmin) {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Sesi tidak valid. Silakan login kembali." },
          { status: 401 }
        );
      }
      if (user.role !== "ADMINISTRATOR" && user.role !== "SALES_REP") {
        return NextResponse.json(
          { success: false, error: "Tidak memiliki akses ke daftar artikel." },
          { status: 403 }
        );
      }

      const rows = await prisma.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: 300,
      });
      return NextResponse.json({ success: true, data: rows });
    }

    if (slug) {
      const row = await prisma.article.findFirst({
        where: { slug, isPublished: true },
      });
      if (!row) {
        return NextResponse.json(
          { success: false, error: "Artikel tidak ditemukan." },
          { status: 404 }
        );
      }
      let article: any = row;
      if (lang) {
        const [out] = await localizeRows(
          "article",
          [row],
          (r) => r.id,
          ["title", "excerpt", "body"],
          lang
        );
        article = out;
      }
      return NextResponse.json({ success: true, data: article });
    }

    const rows = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    let articles: any = rows;
    if (lang) {
      articles = await localizeRows(
        "article",
        rows,
        (r) => r.id,
        ["title", "excerpt", "body"],
        lang
      );
    }

    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    console.error("[articles] Gagal memuat artikel:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat artikel." },
      { status: 500 }
    );
  }
}
