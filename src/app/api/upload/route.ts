import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }
    // Izinkan semua staf portal (kecuali CUSTOMER) untuk mengunggah gambar CMS.
    if (user.role === "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Anda tidak memiliki izin untuk mengunggah file." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Tipe file tidak didukung. Gunakan JPG/PNG/WebP/GIF/SVG." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "Ukuran file maksimal 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    // 1. Utama: simpan ke folder lokal public/uploads (sesuai permintaan)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeName);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        message: "File berhasil diunggah.",
        url: `/uploads/${safeName}`,
      });
    } catch (fsError) {
      // 2. Fallback: data URL base64 (serverless read-only filesystem)
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        message: "File berhasil diunggah (mode fallback).",
        url: dataUrl,
      });
    }
  } catch (error: any) {
    console.error("[upload] Gagal mengunggah file:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal mengunggah file." }, { status: 500 });
  }
}