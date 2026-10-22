import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canManageContent, canManageCatalog } from "@/lib/rbac/authorize";
import { isStorageConfigured, uploadToStorage } from "@/lib/storage";
import {
  getCatalogPdfMeta,
  saveCatalogPdfMeta,
  clearCatalogPdfMeta,
} from "@/lib/catalog-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = ["application/pdf", "application/x-pdf"];

/** Hapus file lokal lama (kalau ada) supaya folder upload tidak menumpuk. */
async function removeLocalFile(url?: string | null): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await unlink(abs);
  } catch {
    /* file sudah tidak ada — abaikan */
  }
}

/** GET /api/catalog/upload — metadata katalog PDF yang sedang aktif. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !((await canManageContent(user.role)) || (await canManageCatalog(user.role)))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat melihat data katalog." },
        { status: 403 }
      );
    }

    const meta = await getCatalogPdfMeta();
    return NextResponse.json({
      success: true,
      data: meta,
      storage: isStorageConfigured() ? "r2" : "local",
    });
  } catch (error: any) {
    console.error("[catalog-upload] GET gagal:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data katalog." },
      { status: 500 }
    );
  }
}

/** POST /api/catalog/upload — unggah / ganti file katalog PDF. */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !((await canManageContent(user.role)) || (await canManageCatalog(user.role)))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat mengunggah katalog." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File katalog belum dipilih." },
        { status: 400 }
      );
    }

    const isPdfType = ALLOWED_TYPES.includes(file.type);
    const isPdfName = /\.pdf$/i.test(file.name);
    if (!isPdfType && !isPdfName) {
      return NextResponse.json(
        { success: false, error: "Format file harus PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran katalog maksimal 20 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Nama file aman + unik (hindari karakter aneh & tabrakan).
    const base = path
      .basename(file.name || "katalog")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    const safeName = `${new Date().toISOString().slice(0, 10)}-${Date.now()}-${base}`;

    let url: string;
    if (isStorageConfigured()) {
      url = await uploadToStorage(buffer, `catalog/${safeName}`, "application/pdf");
    } else {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "catalog");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, safeName), buffer);
        url = `/uploads/catalog/${safeName}`;
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Filesystem server read-only. Konfigurasikan STORAGE_* (Cloudflare R2 / S3) untuk menyimpan katalog.",
          },
          { status: 500 }
        );
      }
    }

    // Hapus file lama (lokal) sebelum menyimpan metadata baru.
    const previous = await getCatalogPdfMeta();
    if (previous?.url && previous.url !== url) {
      await removeLocalFile(previous.url);
    }

    const meta = {
      url,
      filename: file.name || safeName,
      sizeBytes: buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    await saveCatalogPdfMeta(meta);

    return NextResponse.json({
      success: true,
      message: "Katalog PDF berhasil diunggah dan langsung dipakai di website.",
      data: meta,
    });
  } catch (error: any) {
    console.error("[catalog-upload] POST gagal:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal mengunggah katalog." },
      { status: 500 }
    );
  }
}

/** DELETE /api/catalog/upload — hapus katalog unggahan (kembali ke PDF otomatis). */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !((await canManageContent(user.role)) || (await canManageCatalog(user.role)))) {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator atau Admin Konten yang dapat menghapus katalog." },
        { status: 403 }
      );
    }

    const previous = await getCatalogPdfMeta();
    if (previous?.url) await removeLocalFile(previous.url);

    await clearCatalogPdfMeta();

    return NextResponse.json({
      success: true,
      message:
        "Katalog unggahan dihapus. Website kembali memakai katalog yang dibuat otomatis dari data produk.",
    });
  } catch (error: any) {
    console.error("[catalog-upload] DELETE gagal:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghapus katalog." },
      { status: 500 }
    );
  }
}
