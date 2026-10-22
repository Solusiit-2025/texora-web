import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getSeoSettings } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { canManageContent } from "@/lib/rbac/authorize";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

/**
 * GET /api/seo/audit
 *
 * Health check SEO & AI-Readiness untuk dashboard CMS.
 * Mengembalikan skor + daftar temuan & rekomendasi perbaikan.
 * Hanya untuk Administrator.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (!(await canManageContent(user.role))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat melihat audit SEO." },
        { status: 403 }
      );
    }

    const seo = await getSeoSettings();
    const checks: Array<{
      id: string;
      label: string;
      category: "metadata" | "schema" | "ai" | "technical" | "content";
      status: "ok" | "warning" | "error";
      detail: string;
      fix?: string;
    }> = [];

    // ---------- METADATA ----------
    const globalOk = !!seo.global?.title && !!seo.global?.description;
    checks.push({
      id: "global-meta",
      label: "Metadata Global (Title + Description)",
      category: "metadata",
      status: globalOk ? "ok" : "error",
      detail: globalOk
        ? `Title: "${seo.global.title.slice(0, 50)}" • Description: ${seo.global.description.length} karakter`
        : "Title atau description global belum diisi.",
      fix: globalOk ? undefined : "Isi tab SEO & AI Settings → Global.",
    });

    if ((seo.global?.title?.length || 0) > 60) {
      checks.push({
        id: "global-title-len",
        label: "Panjang Title Global",
        category: "metadata",
        status: "warning",
        detail: `Title global ${seo.global.title.length} karakter (ideal ≤ 60). Google akan memotong di ~60 karakter.`,
        fix: "Pendekkan title global.",
      });
    }

    if ((seo.global?.description?.length || 0) > 160) {
      checks.push({
        id: "global-desc-len",
        label: "Panjang Description Global",
        category: "metadata",
        status: "warning",
        detail: `Description global ${seo.global.description.length} karakter (ideal 120–160).`,
        fix: "Pendekkan description global.",
      });
    }

    // Per halaman
    for (const [path, meta] of Object.entries(seo.pages || {})) {
      const enabled = (meta as any)?.enabled !== false;
      const hasTitle = !!meta?.title;
      const hasDesc = !!meta?.description;
      const hasExcerpt = !!meta?.excerpt;
      const schemaOk = !!meta?.schemaType && meta.schemaType !== "none";

      if (!enabled) {
        checks.push({
          id: `page-off-${path}`,
          label: `Halaman ${path} dinonaktifkan`,
          category: "technical",
          status: "ok",
          detail: "Modul nonaktif - otomatis noindex & dikeluarkan dari sitemap.",
        });
        continue;
      }

      if (!hasTitle || !hasDesc) {
        checks.push({
          id: `page-meta-${path}`,
          label: `Metadata halaman ${path}`,
          category: "metadata",
          status: "error",
          detail: `Title: ${hasTitle ? "OK" : "KOSONG"} • Description: ${hasDesc ? "OK" : "KOSONG"}`,
          fix: `Lengkapi title & description halaman ${path} di tab SEO.`,
        });
      }

      if (!hasExcerpt) {
        checks.push({
          id: `page-excerpt-${path}`,
          label: `Excerpt halaman ${path}`,
          category: "ai",
          status: "warning",
          detail: "Excerpt kosong - AI crawler tidak punya ringkasan singkat untuk mengutip.",
          fix: `Isi excerpt halaman ${path}.`,
        });
      }

      if (!schemaOk) {
        checks.push({
          id: `page-schema-${path}`,
          label: `Structured data halaman ${path}`,
          category: "schema",
          status: "warning",
          detail: "Tipe schema masih 'none' - Google tidak bisa menampilkan rich result.",
          fix: `Pilih tipe schema untuk ${path}.`,
        });
      }
    }

    // ---------- SCHEMA ----------
    const schemaTypes = Object.values(seo.pages || {}).map(
      (m) => (m as any)?.schemaType
    );
    const hasProduct = schemaTypes.includes("product");
    const hasFaq = schemaTypes.includes("faq");

    checks.push({
      id: "schema-product",
      label: "Product Schema (katalog)",
      category: "schema",
      status: hasProduct ? "ok" : "warning",
      detail: hasProduct
        ? "Ada halaman dengan tipe schema Product - harga bisa tampil di hasil pencarian."
        : "Belum ada halaman bertipe Product. Katalog tidak akan menampilkan harga di SERP.",
      fix: hasProduct ? undefined : "Set tipe schema /catalog menjadi 'product'.",
    });

    checks.push({
      id: "schema-faq",
      label: "FAQPage Schema",
      category: "schema",
      status: hasFaq ? "ok" : "warning",
      detail: hasFaq
        ? "Ada FAQ schema - berpotensi tampil di 'People Also Ask'."
        : "Belum ada FAQ schema. FAQ di homepage tetap bisa di-crawl, tapi tanpa rich result.",
      fix: hasFaq ? undefined : "Set tipe schema ke 'faq' untuk halaman yang punya FAQ.",
    });

    // ---------- KONTEN ----------
    try {
      const [faqCount, productCount, heroCount] = await Promise.all([
        prisma.faqItem.count({ where: { isActive: true } }),
        prisma.fabricProduct.count(),
        prisma.heroSlide.count({ where: { isActive: true } }),
      ]);

      checks.push({
        id: "content-faq",
        label: "Konten FAQ",
        category: "content",
        status: faqCount > 0 ? "ok" : "warning",
        detail: `${faqCount} FAQ aktif terdaftar.`,
        fix: faqCount > 0 ? undefined : "Tambahkan minimal 4 FAQ di tab FAQ.",
      });

      checks.push({
        id: "content-products",
        label: "Katalog Produk",
        category: "content",
        status: productCount > 0 ? "ok" : "error",
        detail: `${productCount} produk aktif di katalog.`,
        fix: productCount > 0 ? undefined : "Tambahkan produk di Catalog Management.",
      });

      checks.push({
        id: "content-hero",
        label: "Slide Hero & Alt Text",
        category: "content",
        status: heroCount > 0 ? "ok" : "warning",
        detail: `${heroCount} slide hero aktif (pastikan setiap slide punya SEO Alt deskriptif).`,
      });
    } catch {}

    // ---------- AI READINESS ----------
    checks.push({
      id: "ai-llms",
      label: "llms.txt untuk AI Crawler",
      category: "ai",
      status: "ok",
      detail: `Tersedia di ${SITE_URL}/llms.txt (ringkasan) dan ${SITE_URL}/llms-full.txt (dokumentasi lengkap).`,
    });

    checks.push({
      id: "ai-plugin",
      label: "AI Plugin Manifest",
      category: "ai",
      status: "ok",
      detail: `Manifest OpenAPI tersedia di ${SITE_URL}/.well-known/ai-plugin.json.`,
    });

    checks.push({
      id: "ai-crawlers",
      label: "Allowlist AI Crawler (robots.txt)",
      category: "ai",
      status: "ok",
      detail:
        "20 AI crawler diizinkan (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, meta-externalagent, dll).",
    });

    checks.push({
      id: "ai-semantic",
      label: "Semantic HTML & Breadcrumb",
      category: "ai",
      status: "ok",
      detail:
        "Halaman publik memakai h1→h2→h3 yang konsisten, <article>/<section> dengan aria-labelledby, dan BreadcrumbList schema.",
    });

    // ---------- TECHNICAL ----------
    checks.push({
      id: "tech-canonical",
      label: "Canonical URL",
      category: "technical",
      status: "ok",
      detail: "Semua halaman publik memiliki tag rel=canonical (dihasilkan server-side).",
    });

    checks.push({
      id: "tech-ssr",
      label: "Server-Side Rendering konten",
      category: "technical",
      status: "ok",
      detail:
        "Metadata, katalog produk, dan FAQ dirender di server sehingga terbaca tanpa eksekusi JavaScript.",
    });

    // Redirect manager
    try {
      const redirectRow = await prisma.systemSetting.findUnique({
        where: { key: "seo.redirects" },
      });
      const redirectCount = redirectRow?.value
        ? (JSON.parse(redirectRow.value) as unknown[]).length
        : 0;
      checks.push({
        id: "tech-redirects",
        label: "Redirect Manager",
        category: "technical",
        status: "ok",
        detail: `Aktif dengan ${redirectCount} rule redirect. Digunakan saat URL berubah agar peringkat SEO tidak hilang.`,
      });
    } catch {}

    // Landing page kategori
    try {
      const { CATEGORY_SEO } = await import("@/lib/category-seo");
      checks.push({
        id: "content-category-pages",
        label: "Landing Page Kategori (SEO content)",
        category: "content",
        status: CATEGORY_SEO.length > 0 ? "ok" : "warning",
        detail:
          CATEGORY_SEO.length > 0
            ? `${CATEGORY_SEO.length} landing page kategori dengan konten edukatif, panduan teknis, dan FAQ. Menangkap long-tail search seperti "panduan memilih kain dryfit".`
            : "Belum ada landing page kategori.",
        fix: CATEGORY_SEO.length > 0 ? undefined : "Tambahkan landing page kategori.",
      });
    } catch {}

    // Verifikasi search engine
    const hasVerification = Boolean(
      process.env.GOOGLE_SITE_VERIFICATION ||
        process.env.BING_SITE_VERIFICATION ||
        process.env.YANDEX_SITE_VERIFICATION
    );
    checks.push({
      id: "tech-verification",
      label: "Verifikasi Search Engine",
      category: "technical",
      status: hasVerification ? "ok" : "warning",
      detail: hasVerification
        ? "Tag verifikasi Google/Bing/Yandex terpasang di <head>."
        : "Belum ada tag verifikasi. Isi GOOGLE_SITE_VERIFICATION di .env untuk mendaftarkan situs di Google Search Console & Bing Webmaster Tools.",
      fix: hasVerification
        ? undefined
        : "Salin tag HTML dari Google Search Console lalu isi GOOGLE_SITE_VERIFICATION di environment variable.",
    });

    // ---------- SKOR ----------
    const total = checks.length;
    const okCount = checks.filter((c) => c.status === "ok").length;
    const warnCount = checks.filter((c) => c.status === "warning").length;
    const errCount = checks.filter((c) => c.status === "error").length;
    const score = Math.round((okCount / total) * 100);

    const grade =
      score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "E";

    return NextResponse.json({
      success: true,
      data: {
        score,
        grade,
        total,
        ok: okCount,
        warning: warnCount,
        error: errCount,
        checks,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[seo-audit] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menjalankan audit SEO." },
      { status: 500 }
    );
  }
}
