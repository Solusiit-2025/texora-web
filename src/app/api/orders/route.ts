import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatOrder(o: any) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerId: o.customerId,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const orderNumber = searchParams.get("orderNumber");
  const query = searchParams.get("q");

  try {
    const currentUser = await getAuthenticatedUser();
    const where: any = {};

    // RBAC: Customer hanya boleh melihat pesanan miliknya sendiri
    if (currentUser?.role === "CUSTOMER") {
      where.customerId = currentUser.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (orderNumber) {
      where.orderNumber = { equals: orderNumber, mode: "insensitive" };
    }
    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
        { customer: { companyName: { contains: query, mode: "insensitive" } } },
      ];
    }

    const dbOrders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = dbOrders.map(formatOrder);
    return NextResponse.json({
      success: true,
      source: "database",
      total: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.warn("Database error in GET /api/orders:", err);
    return NextResponse.json({
      success: true,
      source: "database",
      total: 0,
      data: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const seq = String(1000 + Math.floor(Math.random() * 9000));
    const orderNumber = body.orderNumber || `TEX-${yyyymm}-${seq}`;

    // 1. Authenticate user - unauthenticated visitors cannot create orders
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Autentikasi Diperlukan: Anda harus memiliki akun dan login terlebih dahulu untuk melakukan transaksi pemesanan.",
          requiresLogin: true,
        },
        { status: 401 }
      );
    }

    const customerId = currentUser.id;

    // 2. Create Order in PostgreSQL
    const totalAmount = Number(body.totalAmount || 0);
    const taxAmount = Number(body.taxAmount || 0);
    const shippingAmount = Number(body.shippingAmount || 0);

    const itemsData = (body.items || []).map((item: any) => ({
      fabricName: item.fabricName || "Kain Poliester Sublimasi",
      gsm: item.gsm ? Number(item.gsm) : 140,
      lengthMeters: Number(item.lengthMeters || item.meters || 1),
      unitPrice: Number(item.unitPrice || 0),
      subtotal: Number(item.subtotal || item.unitPrice * (item.meters || item.lengthMeters || 1)),
      customDesignTitle: item.customDesignTitle || item.designTitle || null,
    }));

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        totalAmount,
        taxAmount,
        shippingAmount,
        status: (body.status as any) || "PENDING_PAYMENT",
        paymentStatus: (body.paymentStatus as any) || "UNPAID",
        paymentMethod: body.paymentMethod || "BCA Virtual Account",
        notes: body.notes || null,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil disimpan ke database PostgreSQL.",
        data: formatOrder(createdOrder),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat pesanan." },
      { status: 500 }
    );
  }
}
