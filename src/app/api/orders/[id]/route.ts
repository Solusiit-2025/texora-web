import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatOrder(o: any) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer?.name || o.customerName || "Customer",
    customerCompany: o.customer?.companyName || o.customerCompany || undefined,
    customerEmail: o.customer?.email || o.customerEmail || "",
    customerPhone: o.customer?.phoneNumber || o.customerPhone || "",
    totalAmount: Number(o.totalAmount),
    taxAmount: Number(o.taxAmount || 0),
    shippingAmount: Number(o.shippingAmount || 0),
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod || "Bank Transfer",
    trackingNumber: o.trackingNumber || undefined,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    notes: o.notes || undefined,
    items: (o.items || []).map((it: any) => ({
      id: it.id,
      fabricName: it.fabricName || it.fabricVariant?.product?.name || "Kain Sublimasi",
      gsm: Number(it.gsm || it.fabricVariant?.gsm || 140),
      lengthMeters: Number(it.lengthMeters),
      unitPrice: Number(it.unitPrice),
      subtotal: Number(it.subtotal),
      customDesignTitle: it.customDesignTitle || undefined,
    })),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: (await params).id }, { orderNumber: (await params).id }],
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatOrder(order),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil data pesanan." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id: (await params).id }, { orderNumber: (await params).id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan di database." },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (body.status) dataToUpdate.status = body.status;
    if (body.paymentStatus) dataToUpdate.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) dataToUpdate.trackingNumber = body.trackingNumber;
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pesanan ${updated.orderNumber} berhasil diperbarui di database.`,
      data: formatOrder(updated),
    });
  } catch (err: any) {
    console.error("Error updating order:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui pesanan." },
      { status: 500 }
    );
  }
}
