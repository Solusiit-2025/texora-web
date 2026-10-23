import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { normalizeLocale } from "@/lib/content-translator";
import { sendQuoteNotificationEmail, QUOTE_NOTIFY_EMAIL } from "@/lib/mailer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_MESSAGE = 4000;

/**
 * POST /api/quote-requests  (publik)
 * Menerima permintaan penawaran dari form "Minta Penawaran".
 * Data otomatis masuk ke pipeline CRM (Lead) supaya tim sales bisa lanjut.
 */
export async function POST(req: NextRequest) {  try {
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

    // Upload file dari form publik DINONAKTIFKAN (hardening keamanan).
    // Seluruh jalur penulisan file referensi (base64 → public/uploads)
    // dihapus: tidak ada penulisan file, tidak ada URL file tersimpan.
    // ── HARDENING: Upload file referensi DINONAKTIFKAN ─────────────
    // Form publik tidak lagi menerima file. Payload yang memuat
    // fileDataUrl DITOLAK supaya tidak bisa dipakai menyimpan
    // script berbahaya ke folder uploads.
    if (
      String(body.fileDataUrl || "").trim() ||
      String(body.fileName || "").trim()
    ) {
      console.warn(
        "[quote] Payload menyertakan file referensi — upload dinonaktifkan, request ditolak."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Unggah file sementara tidak tersedia. Silakan lampirkan file lewat WhatsApp / email ke admin@texoraprima.com.",
        },
        { status: 400 }
      );
    }

    const yards = Number(body.yards);
    let meters = Number(body.meters);
    // Satuan kanonik database = meter. Bila client mengirim `yards`
    // (standar trade tekstil internasional), konversi otomatis 1 yd = 0,9144 m.
    if ((!Number.isFinite(meters) || meters <= 0) && Number.isFinite(yards) && yards > 0) {
      meters = Math.round(yards * 0.9144 * 10) / 10;
    }
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
        fileUrl: null,
        fileName: null,
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

    // Notifikasi email ke PIC internal (QUOTE_EMAIL_TO, default
    // parwanto0807@gmail.com). Gagal kirim tidak membatalkan RFQ.
    try {
      const result = await sendQuoteNotificationEmail({
        name,
        company: company || null,
        email,
        phone: phone || null,
        meters: Number.isFinite(meters) && meters > 0 ? meters : null,
        yards:
          Number.isFinite(yards) && yards > 0
            ? yards
            : Number.isFinite(meters) && meters > 0
            ? Math.round(meters / 0.9144)
            : null,
        needsSample,
        productsText: productsText || null,
        message: message || null,
        source,
        rfqId: created.id,
      });
      if (!result.sent && result.skipped) {
        console.warn(
          `[quote] Email notifikasi RFQ ${created.id} dilewati (SMTP belum dikonfigurasi). Data tetap tersimpan.`
        );
      }
    } catch (mailErr) {
      console.warn(`[quote] Notifikasi RFQ ${created.id} gagal dikirim ke ${QUOTE_NOTIFY_EMAIL}:`, mailErr);
    }

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
