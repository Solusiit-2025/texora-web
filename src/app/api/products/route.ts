import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_FABRICS } from "@/lib/mock-data";

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
    thumbnailUrl: p.thumbnailUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
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

export async function GET(request: Request) {
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

    const dbFabrics = await prisma.fabricProduct.findMany({
      where,
      include: {
        variants: true,
        priceTiers: {
          orderBy: { minMeters: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (dbFabrics.length > 0) {
      const formatted = dbFabrics.map(formatFabric);
      return NextResponse.json({
        success: true,
        source: "database",
        total: formatted.length,
        data: formatted,
      });
    }
  } catch (error) {
    console.warn("Falling back to mock fabrics due to DB error:", error);
  }

  // Graceful fallback to MOCK_FABRICS if DB is empty or fails
  let fabrics = [...MOCK_FABRICS];

  if (slug) {
    fabrics = fabrics.filter((f) => f.slug === slug);
  }

  if (category && category !== "ALL" && category !== "All") {
    fabrics = fabrics.filter((f) => f.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    fabrics = fabrics.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.composition.toLowerCase().includes(q) ||
        f.weaveType.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    source: "fallback",
    total: fabrics.length,
    data: fabrics,
  });
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
        thumbnailUrl:
          body.thumbnailUrl ||
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
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
