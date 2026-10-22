import { prisma } from "@/lib/prisma";

/** Key SiteContent untuk metadata katalog PDF yang diunggah manual. */
export const CATALOG_PDF_KEY = "catalog.pdf";

export interface CatalogPdfMeta {
  /** URL publik file PDF (lokal `/uploads/...` atau R2/S3). */
  url: string;
  /** Nama file asli saat diunggah. */
  filename: string;
  /** Ukuran file dalam byte. */
  sizeBytes: number;
  /** ISO timestamp unggahan. */
  uploadedAt: string;
}

/**
 * Metadata katalog PDF yang diunggah lewat CMS.
 *
 * Kalau ada, endpoint `/api/catalog/pdf` akan mengarahkan pengunjung ke file
 * ini (katalog buatan sendiri). Kalau belum ada, katalog dibuat otomatis dari
 * data produk di database.
 */
export async function getCatalogPdfMeta(): Promise<CatalogPdfMeta | null> {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: CATALOG_PDF_KEY },
    });
    if (!row?.value) return null;

    const parsed = JSON.parse(row.value) as Partial<CatalogPdfMeta>;
    if (!parsed?.url || typeof parsed.url !== "string") return null;

    return {
      url: parsed.url,
      filename: parsed.filename || "Katalog-XoraMateria.pdf",
      sizeBytes: Number(parsed.sizeBytes) || 0,
      uploadedAt: parsed.uploadedAt || row.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveCatalogPdfMeta(meta: CatalogPdfMeta): Promise<void> {
  await prisma.siteContent.upsert({
    where: { key: CATALOG_PDF_KEY },
    create: {
      key: CATALOG_PDF_KEY,
      group: "catalog",
      label: "Katalog PDF (unggahan manual)",
      value: JSON.stringify(meta),
    },
    update: {
      value: JSON.stringify(meta),
    },
  });
}

export async function clearCatalogPdfMeta(): Promise<void> {
  await prisma.siteContent.deleteMany({ where: { key: CATALOG_PDF_KEY } });
}
