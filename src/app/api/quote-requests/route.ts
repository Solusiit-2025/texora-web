import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { normalizeLocale } from "@/lib/content-translator";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_MESSAGE = 4000;

/**
 * POST /api/quote-requests  (publik)
 * Menerima permintaan penawaran dari form "Minta Penawaran".
 * Data otomatis masuk ke pipeline CRM (Lead) supaya tim sales bisa lanjut.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Data permintaan tidak valid." },
        { status: 400 }
      );
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const company = String(body.company || "").trim();
    const phone = String(body.phone || "").trim();
    const country = String(body.country || "").trim();
    const message = String(body.message || "").trim().slice(0, MAX_MESSAGE);
    const source = String(body.source || "website").trim().slice(0, 40);
    const locale = normalizeLocale(body.locale) || "id";

    // File referensi dikirim sebagai data URL (base64) dari form publik.
    const ALLOWED_FILE_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB (muat sebagai data URL di JSON)
    const fileDataUrl = String(body.fileDataUrl || "").trim();
    const fileName = String(body.fileName || "").trim().slice(0, 255);

    const meters = Number(body.meters);
    const productIdsRaw = Array.isArray(body.productIds)
      ? body.productIds.slice(0, 20).map((p: any) => String(p))
      : [];
    const productsText = String(body.productsText || "").trim().slice(0, 1000);
    const needsSample = body.needsSample === true;

    // Validasi
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi (minimal 2 karakter)." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid." },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { success: false, error: "Pesan terlalu panjang (maks 4000 karakter)." },
        { status: 400 }
      );
    }

    // Simpan file referensi (jika ada) ke folder publik uploads
    let safeFileUrl: string | null = null;
    let safeFileName: string | null = null;

    if (fileDataUrl.startsWith("data:")) {
      const m = fileDataUrl.match(/^data:([\w/+.-]+);base64,([\s\S]+)$/);
      if (m) {
        const mime = m[1].toLowerCase();
        const b64 = m[2];
        const approxBytes = Math.floor((b64.length * 3) / 4);
        if (!ALLOWED_FILE_TYPES.includes(mime)) {
          return NextResponse.json(
            {
              success: false,
              error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.",
            },
            { status: 400 }
          );
        }
        if (approxBytes > MAX_FILE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Ukuran file maksimal 2MB." },
            { status: 400 }
          );
        }
        try {
          const buffer = Buffer.from(b64, "base64");
          const ext =
            mime === "application/pdf"
              ? ".pdf"
              : mime === "image/png"
              ? ".png"
              : mime === "image/webp"
              ? ".webp"
              : ".jpg";
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await mkdir(uploadDir, { recursive: true });
          const safeName = `rfq-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}${ext}`;
          await writeFile(path.join(uploadDir, safeName), buffer);
          safeFileUrl = `/uploads/${safeName}`;
          safeFileName = fileName || safeName;
        } catch (fsErr) {
          console.warn("[quote] Gagal menyimpan file referensi:", fsErr);
        }
      }
    }

    const created = await prisma.quoteRequest.create({
      data: {
        name,
        company: company || null,
        email,
        phone: phone || null,
        country: country || null,
        productIds: JSON.stringify(productIdsRaw),
        productsText: productsText || null,
        meters: Number.isFinite(meters) && meters > 0 ? Math.min(meters, 1_000_000) : null,
        needsSample,
        message: message || null,
        fileUrl: safeFileUrl,
        fileName: safeFileName,
        locale,
        source,
        status: "NEW",
      },
    });

    // Masukkan ke pipeline CRM (Lead) agar tim sales bisa memproses
    try {
      const lead = await prisma.lead.create({
        data: {
          title: `Permintaan Penawaran${company ? ` — ${company}` : ""}`,
          contactPerson: name,
          companyName: company || undefined,
          email,
          phone: phone || "-",
          estimatedValue: null,
          estimatedMeters: Number.isFinite(meters) && meters > 0 ? meters : undefined,
          fabricInterest: productsText || productIdsRaw.join(", ") || undefined,
          stage: "NEW_INQUIRY",
          notes: [
            `RFQ via website (${source}, locale ${locale}).`,
            message ? `Catatan: ${message}` : null,
            needsSample ? "Meminta sample swatch gratis." : null,
            safeFileUrl ? `File referensi: ${safeFileUrl}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      });
      await prisma.quoteRequest.update({
        where: { id: created.id },
        data: { leadId: lead.id },
      });
    } catch (leadErr) {
      console.warn("[quote] Gagal membuat Lead CRM:", leadErr);
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "QUOTE_REQUEST_CREATED",
          description: `Permintaan penawaran dari ${name}${company ? ` (${company})` : ""} <${email}>.`,
        },
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message:
          "Permintaan penawaran berhasil dikirim. Tim sales kami akan menghubungi Anda dalam 1-2 jam kerja.",
        data: { id: created.id },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[quote] Gagal menyimpan permintaan:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menyimpan permintaan." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quote-requests (Administrator) -> daftar permintaan penawaran
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
    if (user.role !== "ADMINISTRATOR" && user.role !== "SALES_REP") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator/Sales yang dapat melihat permintaan." },
        { status: 403 }
      );
    }

    const status = req.nextUrl.searchParams.get("status");
    const rows = await prisma.quoteRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        productIds: JSON.parse(r.productIds || "[]"),
      })),
    });
  } catch (error: any) {
    console.error("[quote] Gagal memuat permintaan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat permintaan penawaran." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quote-requests -> ubah status (NEW | CONTACTED | QUOTED | WON | LOST)
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }
    if (user.role !== "ADMINISTRATOR" && user.role !== "SALES_REP") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator/Sales yang dapat mengubah status." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const id = String(body?.id || "");
    const status = String(body?.status || "");
    const notes = body?.notes !== undefined ? String(body.notes) : undefined;

    if (!id || !["NEW", "CONTACTED", "QUOTED", "WON", "LOST"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Parameter id/status tidak valid." },
        { status: 400 }
      );
    }

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[quote] Gagal mengubah status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengubah status permintaan." },
      { status: 500 }
    );
  }
}
