import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  REDIRECTS_KEY,
  DEFAULT_REDIRECTS,
  type RedirectRule,
  validateRedirectRule,
  matchRedirect,
} from "@/lib/redirects";
export const dynamic = "force-dynamic";

/**
 * GET /api/seo/redirects
 *  - default        : daftar redirect (butuh login Administrator)
 *  - ?public=1      : peta redirect untuk middleware (tanpa auth, read-only)
 *  - ?match=<path>  : cek path tertentu (untuk preview di CMS)
 */
export async function GET(req: NextRequest) {
  try {
    const isPublic = req.nextUrl.searchParams.get("public") === "1";
    const matchPath = req.nextUrl.searchParams.get("match");

    const row = await prisma.systemSetting
      .findUnique({ where: { key: REDIRECTS_KEY } })
      .catch(() => null);

    let rules: RedirectRule[] = DEFAULT_REDIRECTS;
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed)) rules = parsed;
      } catch {}
    }

    // Endpoint publik untuk middleware (hanya data, tanpa metadata sensitif)
    if (isPublic) {
      return NextResponse.json(
        {
          success: true,
          data: rules.map((r) => ({ from: r.from, to: r.to, type: r.type })),
        },
        {
          headers: {
            // Disimpan CDN Vercel lebih lama: middleware memakai endpoint ini
            // di SETIAP request (termasuk navigasi client-side), jadi harus
            // dilayani dari cache, bukan dari lambda + DB.
            "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat mengelola redirect." },
        { status: 403 }
      );
    }

    // Preview: cek apakah sebuah path akan ter-redirect
    if (matchPath) {
      const matched = matchRedirect(matchPath, rules);
      return NextResponse.json({
        success: true,
        data: {
          matched: !!matched,
          rule: matched || null,
          target: matched ? matched.to : null,
          status: matched ? matched.type : null,
        },
      });
    }

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    console.error("[redirects] Gagal memuat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar redirect." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seo/redirects -> tambah rule baru
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat mengelola redirect." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const validation = validateRedirectRule(body || {});
    if (!validation.ok || !validation.normalized) {
      return NextResponse.json(
        { success: false, error: validation.error || "Data redirect tidak valid." },
        { status: 400 }
      );
    }

    const row = await prisma.systemSetting
      .findUnique({ where: { key: REDIRECTS_KEY } })
      .catch(() => null);

    let rules: RedirectRule[] = [];
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed)) rules = parsed;
      } catch {}
    }

    // Cek duplikat sumber
    if (rules.some((r) => r.from === validation.normalized!.from)) {
      return NextResponse.json(
        {
          success: false,
          error: `Rule untuk "${validation.normalized!.from}" sudah ada. Hapus yang lama terlebih dahulu.`,
        },
        { status: 409 }
      );
    }

    rules.push(validation.normalized);

    await prisma.systemSetting.upsert({
      where: { key: REDIRECTS_KEY },
      create: {
        key: REDIRECTS_KEY,
        value: JSON.stringify(rules),
        updatedAt: new Date(),
      },
      update: { value: JSON.stringify(rules), updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "SEO_REDIRECT_CREATED",
        userId: user.id,
        description: `Redirect ${validation.normalized!.type} dibuat: ${validation.normalized!.from} → ${validation.normalized!.to}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Redirect ${validation.normalized!.from} → ${validation.normalized!.to} berhasil dibuat.`,
      data: { rules },
    });
  } catch (error: any) {
    console.error("[redirects] Gagal membuat:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membuat redirect." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seo/redirects -> ganti seluruh daftar
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat mengelola redirect." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const incoming: any[] = Array.isArray(body?.rules) ? body.rules : [];

    const errors: string[] = [];
    const rules: RedirectRule[] = [];

    for (const r of incoming) {
      const validation = validateRedirectRule(r);
      if (!validation.ok || !validation.normalized) {
        errors.push(`${r?.from || "?"}: ${validation.error}`);
        continue;
      }
      rules.push(validation.normalized);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: `Some rules are invalid: ${errors.join("; ")}` },
        { status: 400 }
      );
    }

    await prisma.systemSetting.upsert({
      where: { key: REDIRECTS_KEY },
      create: {
        key: REDIRECTS_KEY,
        value: JSON.stringify(rules),
        updatedAt: new Date(),
      },
      update: { value: JSON.stringify(rules), updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `${rules.length} rule redirect berhasil disimpan.`,
      data: { rules },
    });
  } catch (error: any) {
    console.error("[redirects] Gagal menyimpan:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menyimpan redirect." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seo/redirects?from=/path -> hapus rule
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat mengelola redirect." },
        { status: 403 }
      );
    }

    const from = req.nextUrl.searchParams.get("from");
    if (!from) {
      return NextResponse.json(
        { success: false, error: "Parameter 'from' wajib diisi." },
        { status: 400 }
      );
    }

    const row = await prisma.systemSetting
      .findUnique({ where: { key: REDIRECTS_KEY } })
      .catch(() => null);

    let rules: RedirectRule[] = [];
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed)) rules = parsed;
      } catch {}
    }

    const before = rules.length;
    rules = rules.filter((r) => r.from !== from);

    if (rules.length === before) {
      return NextResponse.json(
        { success: false, error: "Rule redirect tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.systemSetting.upsert({
      where: { key: REDIRECTS_KEY },
      create: {
        key: REDIRECTS_KEY,
        value: JSON.stringify(rules),
        updatedAt: new Date(),
      },
      update: { value: JSON.stringify(rules), updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "SEO_REDIRECT_DELETED",
        userId: user.id,
        description: `Redirect dihapus: ${from}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Redirect ${from} berhasil dihapus.`,
      data: { rules },
    });
  } catch (error: any) {
    console.error("[redirects] Gagal menghapus:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghapus redirect." },
      { status: 500 }
    );
  }
}
