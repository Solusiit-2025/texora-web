/**
 * Helper upload gambar dari browser.
 *
 * Latar belakang: di server produksi upload bisa ditolak oleh Nginx/proxy
 * dengan HTML `413 Request Entity Too Large` (bukan JSON). Tanpa penanganan
 * khusus, `res.json()` gagal → pesan errornya jadi generik ("periksa
 * koneksi/sesi") dan admin tidak tahu penyebabnya. Helper ini:
 *  1. mengecilkan gambar besar di browser supaya tidak kena batas body proxy,
 *  2. menerjemahkan respons non-JSON / 413 / 401 / 403 jadi pesan yang jelas.
 */

/** Target ukuran file setelah dikompres (di bawah limit umum Nginx 1 MB). */
export const SAFE_UPLOAD_BYTES = 900 * 1024;

/** Sisi terpanjang gambar setelah dikompres di browser. */
const MAX_SIDE_PX = 1920;

export type UploadOutcome =
  | { success: true; url: string }
  | { success: false; error: string };

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal membaca gambar"));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== "function") {
      resolve(null);
      return;
    }
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Kompres gambar di browser bila terlalu besar (mis. foto kamera 3–8 MB)
 * supaya payload upload tetap kecil. GIF/SVG tidak disentuh agar animasi
 * dan vektor tidak rusak. Kalau gagal, file asli tetap dipakai.
 *
 * [BROWSER-ONLY]
 */
export async function shrinkImageForUpload(
  file: File,
  targetBytes: number = SAFE_UPLOAD_BYTES
): Promise<File> {
  if (typeof window === "undefined" || typeof document === "undefined") return file;
  if (file.size <= targetBytes) return file;
  // GIF (animasi) & SVG (vektor) jangan di-raster.
  if (!/^image\/(jpeg|png|webp|avif|bmp)$/i.test(file.type)) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    if (!naturalWidth || !naturalHeight) return file;

    const scale = Math.min(1, MAX_SIDE_PX / Math.max(naturalWidth, naturalHeight));
    let width = Math.max(1, Math.round(naturalWidth * scale));
    let height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";

    const render = async (): Promise<Blob | null> => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      // WebP didukung Chrome/Firefox/Safari modern; kalau tidak, pakai JPEG.
      return (
        (await canvasToBlob(canvas, "image/webp", 0.86)) ??
        (await canvasToBlob(canvas, "image/jpeg", 0.86))
      );
    };

    let blob = await render();
    let quality = 0.86;

    // Masih kebesaran? Turunkan kualitas, lalu ukuran, bertahap.
    for (let i = 0; i < 6 && blob && blob.size > targetBytes; i++) {
      if (i < 3) {
        quality = Math.max(0.55, quality - 0.12);
        blob =
          (await canvasToBlob(canvas, "image/webp", quality)) ??
          (await canvasToBlob(canvas, "image/jpeg", quality));
      } else {
        width = Math.max(1, Math.round(width * 0.8));
        height = Math.max(1, Math.round(height * 0.8));
        quality = 0.8;
        blob = await render();
      }
    }

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "gambar";
    const type = blob.type || "image/webp";
    const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
    return new File([blob], `${baseName}.${ext}`, {
      type,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Kirim gambar ke `/api/upload` (atau endpoint lain) dan normalisasi hasilnya.
 * Opsional: `convertToWebp` meminta server mengonversi JPG/PNG/GIF → .webp.
 *
 * [BROWSER-ONLY]
 */
export async function uploadImageFile(
  file: File,
  opts: { convertToWebp?: boolean; endpoint?: string } = {}
): Promise<UploadOutcome> {
  const fd = new FormData();
  fd.append("file", file);
  if (opts.convertToWebp) fd.append("convert", "webp");

  let res: Response;
  try {
    res = await fetch(opts.endpoint || "/api/upload", {
      method: "POST",
      body: fd,
    });
  } catch {
    return {
      success: false,
      error: `Gagal mengunggah "${file.name}" — periksa koneksi internet lalu coba lagi.`,
    };
  }

  if (res.status === 413) {
    return {
      success: false,
      error: `"${file.name}" ditolak server (413 Payload Too Large) — batas ukuran upload di Nginx/proxy masih kecil.`,
    };
  }

  const raw = await res.text().catch(() => "");
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!json) {
    if (res.status === 401) {
      return { success: false, error: "Sesi login berakhir — login ulang lalu coba lagi." };
    }
    if (res.status === 403) {
      return {
        success: false,
        error: "Unggahan ditolak server (sesi/keamanan). Coba login ulang lalu ulangi upload.",
      };
    }
    return {
      success: false,
      error: `Server menolak unggahan "${file.name}" (HTTP ${res.status}).`,
    };
  }

  if (json.success && typeof json.url === "string" && json.url) {
    return { success: true, url: json.url };
  }

  return {
    success: false,
    error: json.error || `Gagal mengunggah "${file.name}" (HTTP ${res.status}).`,
  };
}
