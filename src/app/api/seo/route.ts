import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getSeoSettings, saveSeoSettings, DEFAULT_SEO } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSeoSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[seo] Gagal memuat pengaturan SEO:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat pengaturan SEO." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat mengubah SEO." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const settings = body?.settings ?? body;

    const currentSettings = await getSeoSettings().catch(() => null);
    const merged = {
      global: { ...DEFAULT_SEO.global, ...(currentSettings?.global || {}), ...(settings?.global || {}) },
      pages: { ...DEFAULT_SEO.pages, ...(currentSettings?.pages || {}), ...(settings?.pages || {}) },
    };

    await saveSeoSettings(merged);

    return NextResponse.json({ success: true, message: "Pengaturan SEO berhasil disimpan.", data: merged });
  } catch (error: any) {
    console.error("[seo] Gagal menyimpan pengaturan SEO:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal menyimpan SEO." }, { status: 500 });
  }
}
