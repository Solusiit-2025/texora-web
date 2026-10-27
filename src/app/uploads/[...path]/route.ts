import { readFile, stat } from "fs/promises";
import path from "path";

/**
 * Penyaji file hasil upload runtime (`public/uploads/**`).
 *
 * KENAPA ROUTE INI ADA:
 * Di mode produksi (next start), Next.js memindai isi folder `public/` SEKALI
 * saat server boot lalu menyimpannya sebagai daftar statis. File yang ditulis
 * SETELAH server jalan (upload dari portal) tidak ada di daftar itu, sehingga
 * `/uploads/<file-baru>` dibalas 404 walau file-nya benar-benar ada di disk.
 * Akibatnya gambar terunggah tidak tampil di preview / katalog produksi
 * (di `next dev` tetap tampil karena dev memeriksa disk tiap request).
 *
 * Route handler ini membaca langsung dari disk per request, jadi file baru
 * langsung tersedia tanpa restart. URL lama `/uploads/...` yang sudah
 * tersimpan di database tetap valid (tidak perlu migrasi data).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/** Ekstensi yang boleh disajikan (hanya hasil upload CMS). */
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jpe": "image/jpeg",
  ".jfif": "image/jpeg",
  ".png": "image/png",
  ".apng": "image/apng",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Tolak path aneh / upaya keluar dari folder uploads (path traversal).
  if (
    !segments?.length ||
    segments.some(
      (s) => !s || s === "." || s === ".." || s.includes("\\") || s.includes("\0")
    )
  ) {
    return notFound();
  }

  const relative = segments.join("/");
  const filePath = path.join(UPLOAD_ROOT, relative);
  const resolved = path.resolve(filePath);
  const rootResolved = path.resolve(UPLOAD_ROOT);

  // Pastikan hasil resolve tetap di dalam UPLOAD_ROOT.
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return notFound();
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return notFound();

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return notFound();

    const buffer = await readFile(resolved);
    const isCatalog = segments[0] === "catalog";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      "Last-Modified": info.mtime.toUTCString(),
      "X-Content-Type-Options": "nosniff",
      // Nama file gambar memakai timestamp + token acak → aman di-cache lama.
      // Katalog PDF bisa diganti dengan nama sama → wajib revalidasi.
      "Cache-Control": isCatalog
        ? "public, max-age=0, must-revalidate"
        : "public, max-age=31536000, immutable",
    };

    // SVG bisa memuat script. Saat dibuka langsung (bukan via <img>) script-nya
    // diblokir dengan CSP ketat di response file.
    if (contentType === "image/svg+xml") {
      headers["Content-Security-Policy"] =
        "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
    }

    return new Response(new Uint8Array(buffer), { status: 200, headers });
  } catch {
    return notFound();
  }
}
