import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugifyArticleSlug } from "@/lib/article-utils";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * TAXONOMI ARTIKEL (kategori & tipe) — dikelola dari portal content-management.
 *
 * Sumber: SiteContent key `articles.categories` & `articles.types`
 * (JSON array [{ value, label }]) + nilai default + nilai yang sudah
 * terpakai di tabel Article (data lama tetap tampil di dropdown).
 *
 * GET  /api/article-taxonomy                → { categories, types }
 * POST /api/article-taxonomy { kind, label } → tambah baru (tervalidasi)
 */

const CATEGORIES_KEY = "articles.categories";
const TYPES_KEY = "articles.types";

const DEFAULT_CATEGORIES = [
  { value: "sportswear", label: "Sportswear & Activewear" },
  { value: "hijab-fashion", label: "Fashion & Hijab" },
  { value: "home-living", label: "Home Living & Dekorasi" },
  { value: "merchandise", label: "Merchandise & Event" },
  { value: "proses", label: "Proses, Teknis & Bisnis" },
];

const DEFAULT_TYPES = [
  { value: "panduan", label: "Panduan" },
  { value: "tips", label: "Tips" },
  { value: "case-study", label: "Studi Kasus" },
  { value: "news", label: "Berita Pabrik" },
];

interface TaxItem {
  value: string;
  label: string;
}

/** Prettify slug lama → label bacaan: "hijab-fashion" → "Hijab Fashion" */
function prettifySlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function keyOf(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function pluralKey(value: string): string {
  return keyOf(value).replace(/(es|s)$/, "");
}

async function parseSaved(kind: "category" | "type"): Promise<TaxItem[]> {
  const row = await prisma.siteContent.findUnique({
    where: { key: kind === "category" ? CATEGORIES_KEY : TYPES_KEY },
  });
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i: any) => i && typeof i.value === "string" && i.value)
      .map((i: any) => ({ value: i.value, label: String(i.label || prettifySlug(i.value)) }));
  } catch {
    return [];
  }
}

/** Gabungan: default + tersimpan (menang atas inferred) + used di artikel. */
async function allTaxonomy(kind: "category" | "type"): Promise<TaxItem[]> {
  const isCat = kind === "category";
  const [defaults, saved, used] = await Promise.all([
    Promise.resolve<TaxItem[]>(isCat ? DEFAULT_CATEGORIES : DEFAULT_TYPES),
    parseSaved(kind),
    isCat
      ? prisma.article.findMany({ select: { category: true }, distinct: ["category"] })
      : prisma.article.findMany({ select: { articleType: true }, distinct: ["articleType"] }),
  ]);
  const usedItems: TaxItem[] = (isCat ? used.map((u: any) => u.category) : used.map((u: any) => u.articleType))
    .filter(Boolean)
    .map((slug: string) => ({ value: slug, label: prettifySlug(slug) }));

  // Urutan prioritas: saved > defaults > inferred-from-articles.
  const merged = new Map<string, TaxItem>();
  for (const item of [...defaults, ...usedItems, ...saved]) {
    if (item.value) merged.set(keyOf(item.value), item);
  }
  return Array.from(merged.values()).sort((a, b) => a.label.localeCompare(b.label, "id"));
}

export async function GET() {
  try {
    const [categories, types] = await Promise.all([allTaxonomy("category"), allTaxonomy("type")]);
    return NextResponse.json({ success: true, categories, types });
  } catch (err) {
    console.error("[article-taxonomy] GET gagal:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat taksonomi artikel.",
        categories: DEFAULT_CATEGORIES,
        types: DEFAULT_TYPES,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Hanya admin yang dapat menambah taksonomi artikel." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const kind = body.kind === "type" ? "type" : "category";
    const label = String(body.label || "").trim().replace(/\s+/g, " ");

    if (!label) {
      return NextResponse.json({ success: false, error: "Nama wajib diisi." }, { status: 400 });
    }
    if (label.length > 50) {
      return NextResponse.json({ success: false, error: "Maksimal 50 karakter." }, { status: 400 });
    }

    const value = slugifyArticleSlug(label);
    const existing = await allTaxonomy(kind);
    const pKey = pluralKey(value);

    for (const item of existing) {
      if (keyOf(item.value) === keyOf(value)) {
        return NextResponse.json(
          {
            success: false,
            error: `"${item.label}" sudah ada. Gunakan yang tersedia.`,
            similar: item.label,
          },
          { status: 409 }
        );
      }
      if (pluralKey(item.value) === pKey) {
        return NextResponse.json(
          {
            success: false,
            error: `Terlalu mirip dengan "${item.label}". Gunakan yang sudah ada daripada membuat variasi bentuk.`,
            similar: item.label,
          },
          { status: 409 }
        );
      }
    }

    // Simpan gabungan penuh (default + custom) agar read tetap konsisten.
    const nextList: TaxItem[] = [...existing, { value, label }];
    const key = kind === "category" ? CATEGORIES_KEY : TYPES_KEY;
    await prisma.siteContent.upsert({
      where: { key },
      create: {
        key,
        group: "artikel",
        label: kind === "category" ? "Kategori Artikel" : "Tipe Artikel",
        value: JSON.stringify(nextList),
      },
      update: { value: JSON.stringify(nextList) },
    });

    const [categories, types] = await Promise.all([allTaxonomy("category"), allTaxonomy("type")]);
    return NextResponse.json({ success: true, kind, item: { value, label }, categories, types });
  } catch (err) {
    console.error("[article-taxonomy] POST gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan taksonomi ke database." },
      { status: 500 }
    );
  }
}
