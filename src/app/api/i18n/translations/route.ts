import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  normalizeLocale,
  isAiTranslationEnabled,
  getAiProviderInfo,
  startTranslationJob,
  getTranslationJob,
  resolveTranslationJob,
  preTranslateFields,
  pruneBrokenTranslations,
  translateSingleText,
  type TranslationLocale,
} from "@/lib/content-translator";
import { invalidateCache } from "@/lib/cache";
import { canManageContent } from "@/lib/rbac/authorize";

export const dynamic = "force-dynamic";

/**
 * GET /api/i18n/translations
 *  - daftar baris cache terjemahan (terbaru dulu, difilter ?locale=)
 *  - statistik ringkas per bahasa
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !(await canManageContent(user.role))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat mengelola terjemahan." },
        { status: 403 }
      );
    }

    const locale = normalizeLocale(req.nextUrl.searchParams.get("locale"));
    const wantJob = req.nextUrl.searchParams.get("job") === "1";

    const [rows, stats] = await Promise.all([
      prisma.contentTranslation.findMany({
        where: locale ? { locale } : undefined,
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
      prisma.contentTranslation.groupBy({
        by: ["locale"],
        _count: { _all: true },
      }),
    ]);

    const byLocale: Record<string, number> = {};
    for (const s of stats) byLocale[s.locale] = s._count._all;

    return NextResponse.json({
      success: true,
      aiEnabled: isAiTranslationEnabled(),
      aiProvider: getAiProviderInfo(),
      data: {
        total: await prisma.contentTranslation.count(),
        byLocale,
        job: await resolveTranslationJob(),
        rows: rows.map((r) => ({
          id: r.id,
          entity: r.entity,
          entityId: r.entityId,
          field: r.field,
          locale: r.locale,
          source: r.source,
          translation: r.translation,
          updatedAt: r.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("[i18n] Gagal memuat terjemahan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar terjemahan." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/i18n/translations -> override manual teks terjemahan
 * body: { entity, entityId, field, locale, source, translation }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !(await canManageContent(user.role))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat mengubah terjemahan." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const { entity, entityId, field, locale, source, translation } = body || {};
    const lang = normalizeLocale(locale);

    if (!entity || !entityId || !field || !lang) {
      return NextResponse.json(
        { success: false, error: "entity, entityId, field, dan locale wajib diisi." },
        { status: 400 }
      );
    }

    const row = await prisma.contentTranslation.upsert({
      where: {
        entity_entityId_field_locale: { entity, entityId, field, locale: lang },
      },
      create: {
        entity,
        entityId,
        field,
        locale: lang,
        source: String(source ?? ""),
        translation: String(translation ?? ""),
      },
      update: {
        source: String(source ?? ""),
        translation: String(translation ?? ""),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "I18N_TRANSLATION_OVERRIDE",
        userId: user.id,
        description: `Override terjemahan ${entity}/${entityId}/${field} (${lang}).`,
      },
    }).catch(() => {});

    // Cache terjemahan di memory dibuang
    invalidateCache("translations:");

    return NextResponse.json({ success: true, message: "Terjemahan disimpan.", data: row });
  } catch (error: any) {
    console.error("[i18n] Gagal menyimpan override:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menyimpan terjemahan." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/i18n/translations?id=xxx -> hapus cache (otomatis diterjemahkan
 * ulang saat pertama kali diminta lagi).
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !(await canManageContent(user.role))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat menghapus terjemahan." },
        { status: 403 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter id wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.contentTranslation.delete({ where: { id } }).catch(() => {});
    // Cache terjemahan di memory dibuang supaya perubahan langsung terlihat
    invalidateCache("translations:");

    return NextResponse.json({ success: true, message: "Cache terjemahan dihapus." });
  } catch (error: any) {
    console.error("[i18n] Gagal menghapus terjemahan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus terjemahan." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/i18n/translations
 *  - { action: "translate-all" }              -> terjemahkan semua konten (blocking)
 *  - { action: "pre-translate", entity, entityId, fields } -> fire-and-forget
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !(await canManageContent(user.role))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat memicu terjemahan." },
        { status: 403 }
      );
    }

    if (!isAiTranslationEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Terjemahan AI nonaktif — isi OPENCODE_API_KEY (OpenCode Zen) atau GEMINI_API_KEY / NINEROUTER_API_KEY di environment lalu restart server.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;

    if (action === "translate-all" || action === "repair") {
      // Job BACKGROUND: tidak memblokir request & aman dari timeout/quota.
      const started = startTranslationJob();
      return NextResponse.json(
        {
          success: true,
          message: started
            ? "Proses terjemahan dimulai di background. Pantau progres di bawah."
            : "Proses terjemahan sudah berjalan. Pantau progres di bawah.",
          data: { job: getTranslationJob() },
        },
        { status: 202 }
      );
    }

    if (action === "pre-translate") {
      const { entity, entityId, fields } = body || {};
      const obj: Record<string, any> = {};
      for (const f of Object.keys(fields || {})) obj[f] = fields[f];
      // Fire-and-forget — jangan blokir UI admin.
      preTranslateFields(entity, entityId, obj, Object.keys(obj)).catch(() => {});
      return NextResponse.json({
        success: true,
        message: `Pre-translate ${entity}/${entityId} dijadwalkan di background.`,
      });
    }

    if (action === "translate-single") {
      const { entity, entityId, field, locale, source } = body || {};
      const lang = normalizeLocale(locale);
      if (!entity || !entityId || !field || !lang || !source) {
        return NextResponse.json(
          { success: false, error: "entity, entityId, field, locale, dan source wajib diisi." },
          { status: 400 }
        );
      }

      const translation = await translateSingleText(source, lang);
      const row = await prisma.contentTranslation.upsert({
        where: {
          entity_entityId_field_locale: { entity, entityId, field, locale: lang },
        },
        create: {
          entity,
          entityId,
          field,
          locale: lang,
          source: String(source),
          translation,
        },
        update: {
          source: String(source),
          translation,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil diterjemahkan dengan AI.",
        data: row,
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenal." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[i18n] Gagal memicu terjemahan:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal memicu terjemahan." },
      { status: 500 }
    );
  }
}
