/**
 * Helper galeri gambar (JSON string di kolom `galleryImages`).
 * Dipakai oleh FabricProduct & Article agar format konsisten.
 */
/**
 * Batas maksimum gambar galeri produk (kolom `galleryImages`).
 * Dinaikkan dari 10 → 30 karena satu katalog motif bisa berisi
 * lebih dari 10 corak/motif dalam satu produk kain.
 */
export const MAX_GALLERY_IMAGES = 30;

export const PRODUCT_FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80";

/** Parse kolom galleryImages (JSON string) → array URL bersih (maks MAX_GALLERY_IMAGES). */
export function parseGalleryImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || "").trim()).filter(Boolean).slice(0, MAX_GALLERY_IMAGES);
  }
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v) => String(v || "").trim()).filter(Boolean).slice(0, MAX_GALLERY_IMAGES);
  } catch {
    return [];
  }
}

/** Serialize input (array/JSON string) → JSON string siap disimpan (maks MAX_GALLERY_IMAGES). */
export function serializeGalleryImages(value: unknown): string {
  return JSON.stringify(parseGalleryImages(value));
}

/**
 * [BROWSER-ONLY] Cek dimensi file gambar sebelum upload.
 * Return { width, height } — kalau tidak bisa diproses (bukan gambar), { width: 0, height: 0 }.
 * Tergolong resolusi rendah kalau sisi terpanjang < MIN_RECOMMENDED_SOURCE_PX.
 */
export const MIN_RECOMMENDED_SOURCE_PX = 800;

export async function getImageFileDimensions(file: File): Promise<{
  width: number;
  height: number;
}> {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

export function isLowResolutionImage(width: number, height: number): boolean {
  if (!width || !height) return false;
  return Math.max(width, height) < MIN_RECOMMENDED_SOURCE_PX;
}
