import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** Tipe raster yang boleh dikonversi otomatis ke WebP (SVG bukan raster). */
const CONVERTIBLE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff", "image/avif"];

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

    // ── Mode konversi: JPG/PNG/GIF/AVIF → WebP (dipakai galeri artikel) ──
    const convert = formData.get("convert") === "webp";
    if (convert) {
      if (!CONVERTIBLE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Konversi WebP mendukung JPG/PNG/WebP/GIF/AVIF — file ini tidak didukung." },
          { status: 400 }
        );
      }
      try {
        let pipeline = sharp(buffer, { failOn: "error" }).rotate(); // ikut EXIF orientation
        const meta = await pipeline.metadata();
        const maxSide = 1920;
        if ((meta.width || 0) > maxSide || (meta.height || 0) > maxSide) {
          pipeline = pipeline.resize({
            width: meta.width! >= meta.height! ? maxSide : undefined,
            height: meta.height! > meta.width! ? maxSide : undefined,
            fit: "inside",
            withoutEnlargement: true,
          });
        }
        const webpBuffer: Buffer = await pipeline
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        if (webpBuffer.length > MAX_SIZE) {
          return NextResponse.json(
            { success: false, error: "Hasil konversi WebP melebihi 5MB — coba gambar dengan resolusi lebih kecil." },
            { status: 400 }
          );
        }
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, safeName), webpBuffer);
          return NextResponse.json({
            success: true,
            message: "Gambar berhasil dikonversi ke WebP.",
            url: `/uploads/${safeName}`,
          });
        } catch {
          // Fallback serverless (read-only fs): data URL WebP
          return NextResponse.json({
            success: true,
            message: "Gambar berhasil dikonversi ke WebP (mode fallback).",
            url: `data:image/webp;base64,${webpBuffer.toString("base64")}`,
          });
        }
      } catch (convError: any) {
        console.error("[upload] Gagal konversi WebP:", convError);
        return NextResponse.json(
          { success: false, error: "Gagal mengonversi gambar ke WebP." },
          { status: 400 }
        );
      }
    }

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