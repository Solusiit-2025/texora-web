import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached, invalidateCache } from "@/lib/cache";
import { normalizeLocale, localizeRows } from "@/lib/content-translator";
import { isPriceHidden, stripProductPrices } from "@/lib/catalog-visibility";
import { parseGalleryImages, serializeGalleryImages, PRODUCT_FALLBACK_THUMB } from "@/lib/image-gallery";

export const dynamic = "force-dynamic";

function formatFabric(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    composition: p.composition,
    weaveType: p.weaveType || "",
    widthInch: Number(p.widthInch),
    isSublimationReady: Boolean(p.isSublimationReady),
    basePricePerMeter: Number(p.basePricePerMeter),
    thumbnailUrl: p.thumbnailUrl || PRODUCT_FALLBACK_THUMB,
    images: parseGalleryImages(p.galleryImages),
    category: p.category || "Sportswear",
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      gsm: Number(v.gsm),
      colorName: v.colorName,
      stockMeters: Number(v.stockMeters),
    })),
    priceTiers: (p.priceTiers || []).map((t: any) => ({
      id: t.id,
      minMeters: Number(t.minMeters),
      maxMeters: t.maxMeters ? Number(t.maxMeters) : undefined,
      unitPrice: Number(t.unitPrice),
    })),
  };
}


/**
 * Header cache untuk endpoint publik.
 *
 * `?fresh=1` dipakai oleh PANEL ADMIN yang butuh data terbaru (mis. setelah
 * hapus/simpan konten) -> tidak boleh dilayani dari cache browser/CDN.
 * Tanpa parameter itu, respons boleh di-cache (hemat query DB untuk
 * pengunjung).
 */
function cacheHeaders(fresh: boolean): Record<string, string> {
  return fresh
    ? { "Cache-Control": "no-store, no-cache, must-revalidate" }
    : {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      };
}

export async function GET(request: Request) {
  const fresh =
    new URL(request.url).searchParams.get("fresh") === "1";
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const slug = searchParams.get("slug");

  try {
    const where: any = {};

    if (slug) {
      where.slug = slug;
    }

    if (category && category !== "ALL" && category !== "All") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { composition: { contains: query, mode: "insensitive" } },
        { weaveType: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Query berat (products + variants + tiers) di DB remote ~1 detik.
    // Cache 60 detik + dedupe request paralel.
    const dbFabrics = await cached(
      `api.products:${slug || ""}:${category || ""}:${query || ""}`,
      () =>
        prisma.fabricProduct.findMany({
          where,
          include: {
            variants: true,
            priceTiers: {
              orderBy: { minMeters: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        }).catch(() => []),
      { ttl: 60_000, stale: 600_000, bypass: fresh }
    );

    if (Array.isArray(dbFabrics) && dbFabrics.length > 0) {
      let formatted = dbFabrics.map(formatFabric);
      // ?lang=xx -> deskripsi produk diterjemahkan on-demand (di-cache DB).
      const lang = normalizeLocale(searchParams.get("lang"));
      if (lang) {
        formatted = await localizeRows(
          "product",
          formatted,
          (p: any) => p.slug || p.id,
          ["description"],
          lang
        );
      }
      // Sembunyikan harga bila admin mengaktifkannya (setting terpusat).
      // NOTE: portal admin memanggil dengan ?fresh=1 & butuh harga utuh,
      // jadi strip di-skip untuk fresh mode.
      if (!fresh && (await isPriceHidden())) {
        formatted = stripProductPrices(formatted);
      }
      return NextResponse.json(
        {
          success: true,
          source: "database",
          total: formatted.length,
          data: formatted,
        },
        {
          headers: cacheHeaders(fresh),
        }
      );
    }

    // Tidak ada data di database — jangan tampilkan data hardcode/mock.
    return NextResponse.json({
      success: true,
      source: "database",
      total: 0,
      data: [],
    });
  } catch (error) {
    console.error("Gagal memuat produk dari database:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data katalog." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.basePricePerMeter) {
      return NextResponse.json(
        { success: false, error: "Nama kain dan harga dasar wajib diisi." },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const basePrice = Number(body.basePricePerMeter);
    const gsm = Number(body.gsm || 140);
    const widthInch = Number(body.widthInch || 60);

    const created = await prisma.fabricProduct.create({
      data: {
        name: body.name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description:
          body.description ||
          `Kain ${body.name} kualitas industri dengan daya serap sublimasi tinggi.`,
        composition: body.composition || "100% Micro Polyester",
        weaveType: body.weaveType || "Interlock Knit",
        widthInch: widthInch,
        isSublimationReady: body.isSublimationReady ?? true,
        basePricePerMeter: basePrice,
        thumbnailUrl: body.thumbnailUrl || parseGalleryImages(body.galleryImages)[0] || PRODUCT_FALLBACK_THUMB,
        galleryImages: body.galleryImages !== undefined
          ? serializeGalleryImages(body.galleryImages)
          : undefined,
        category: body.category || "Sportswear",
        variants: {
          create: body.variants && body.variants.length > 0
            ? body.variants.map((v: any) => ({
                gsm: Number(v.gsm || gsm),
                colorName: v.colorName || "Optic White Ready Sublim",
                stockMeters: Number(v.stockMeters || 1000),
              }))
            : [
                {
                  gsm: gsm,
                  colorName: "Optic White Ready Sublim",
                  stockMeters: 2000,
                },
              ],
        },
        priceTiers: {
          create: body.priceTiers && body.priceTiers.length > 0
            ? body.priceTiers.map((t: any) => ({
                minMeters: Number(t.minMeters),
                maxMeters: t.maxMeters ? Number(t.maxMeters) : null,
                unitPrice: Number(t.unitPrice),
              }))
            : [
                { minMeters: 1, maxMeters: 49, unitPrice: basePrice },
                { minMeters: 50, maxMeters: 199, unitPrice: Math.round(basePrice * 0.9) },
                { minMeters: 200, maxMeters: null, unitPrice: Math.round(basePrice * 0.8) },
              ],
        },
      },
      include: {
        variants: true,
        priceTiers: true,
      },
    });

    // Katalog berubah -> buang cache produk
    invalidateCache("storefront.products");
    invalidateCache("api.products");

    return NextResponse.json(
      {
        success: true,
        message: "Kain baru berhasil ditambahkan ke database katalog.",
        data: formatFabric(created),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating fabric product:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses data kain." },
      { status: 500 }
    );
  }
}
