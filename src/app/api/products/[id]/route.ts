import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseGalleryImages, serializeGalleryImages, PRODUCT_FALLBACK_THUMB } from "@/lib/image-gallery";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canManageCatalog } from "@/lib/rbac/authorize";
import { writeAuditLog } from "@/lib/audit";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fabric = await prisma.fabricProduct.findFirst({
      where: {
        OR: [{ id: (await params).id }, { slug: (await params).id }],
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }
    if (!(await canManageCatalog(user.role))) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses mengubah katalog." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const existing = await prisma.fabricProduct.findUnique({
      where: { id: (await params).id },
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
      where: { id: (await params).id },
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
        galleryImages: body.galleryImages !== undefined
          ? serializeGalleryImages(body.galleryImages)
          : undefined,
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
            where: { id: v.id, productId: (await params).id },
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
            where: { id: t.id, productId: (await params).id },
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
      where: { id: (await params).id },
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
    });

    // Ringkasan field yang berubah untuk audit log ("apa yang diubah").
    const fieldLabels: Record<string, string> = {
      name: "nama",
      category: "kategori",
      composition: "komposisi",
      weaveType: "anyaman",
      widthInch: "lebar",
      basePricePerMeter: "harga/meter",
      description: "deskripsi",
      thumbnailUrl: "thumbnail",
      isSublimationReady: "status sublimasi",
    };
    const changed: string[] = [];
    for (const key of Object.keys(fieldLabels)) {
      if (body[key] === undefined) continue;
      const before = String((existing as any)[key] ?? "");
      const after = String(body[key] ?? "");
      if (before !== after) changed.push(fieldLabels[key]);
    }
    if (body.galleryImages !== undefined) changed.push("galeri gambar");
    if (Array.isArray(body.variants)) changed.push("varian/stok");
    if (Array.isArray(body.priceTiers)) changed.push("tier harga");

    await writeAuditLog({
      action: "PRODUCT_UPDATE",
      userId: user.id,
      description: `Mengubah kain "${existing.name}"${
        changed.length ? `: ${changed.join(", ")}` : " (tanpa perubahan field utama)"
      }.`,
      request,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }
    if (!(await canManageCatalog(user.role))) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses mengubah katalog." },
        { status: 403 }
      );
    }

    const existing = await prisma.fabricProduct.findUnique({
      where: { id: (await params).id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kain tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.fabricProduct.delete({
      where: { id: (await params).id },
    });

    await writeAuditLog({
      action: "PRODUCT_DELETE",
      userId: user.id,
      description: `Menghapus kain "${existing.name}" (${existing.slug}) dari katalog.`,
      request,
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
