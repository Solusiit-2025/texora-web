import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fabric = await prisma.fabricProduct.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
    });

    if (!fabric) {
      return NextResponse.json(
        { success: false, error: "Kain tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatFabric(fabric),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil data kain." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existing = await prisma.fabricProduct.findUnique({
      where: { id: params.id },
      include: { variants: true, priceTiers: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kain tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Update main product properties
    const updated = await prisma.fabricProduct.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        composition: body.composition ?? existing.composition,
        weaveType: body.weaveType ?? existing.weaveType,
        widthInch: body.widthInch ? Number(body.widthInch) : existing.widthInch,
        isSublimationReady: body.isSublimationReady ?? existing.isSublimationReady,
        basePricePerMeter: body.basePricePerMeter
          ? Number(body.basePricePerMeter)
          : existing.basePricePerMeter,
        thumbnailUrl: body.thumbnailUrl ?? existing.thumbnailUrl,
        category: body.category ?? existing.category,
      },
      include: {
        variants: true,
        priceTiers: true,
      },
    });

    // If variants were provided, update them
    if (body.variants && Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (v.id) {
          await prisma.fabricVariant.updateMany({
            where: { id: v.id, productId: params.id },
            data: {
              gsm: Number(v.gsm),
              colorName: v.colorName,
              stockMeters: Number(v.stockMeters),
            },
          });
        }
      }
    }

    // If priceTiers were provided, update them
    if (body.priceTiers && Array.isArray(body.priceTiers)) {
      for (const t of body.priceTiers) {
        if (t.id) {
          await prisma.priceTier.updateMany({
            where: { id: t.id, productId: params.id },
            data: {
              minMeters: Number(t.minMeters),
              maxMeters: t.maxMeters ? Number(t.maxMeters) : null,
              unitPrice: Number(t.unitPrice),
            },
          });
        }
      }
    }

    const finalProduct = await prisma.fabricProduct.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data kain berhasil diperbarui.",
      data: formatFabric(finalProduct),
    });
  } catch (err: any) {
    console.error("Error updating fabric:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui data kain." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.fabricProduct.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kain tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.fabricProduct.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `Kain ${existing.name} berhasil dihapus dari database.`,
    });
  } catch (err: any) {
    console.error("Error deleting fabric:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menghapus data kain." },
      { status: 500 }
    );
  }
}
