import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { email: id }],
      },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (user) {
      const orders = user.orders || [];
      const totalSpent = orders.reduce(
        (sum, o) => sum + Number(o.totalAmount || 0),
        0
      );
      const totalMeters = orders.reduce(
        (sum, o) =>
          sum +
          (o.items || []).reduce(
            (isum, it) => isum + Number(it.lengthMeters || 0),
            0
          ),
        0
      );

      const customer = {
        id: user.id,
        name: user.name,
        company: user.companyName || "Perorangan",
        taxId: user.taxId || "-",
        email: user.email,
        phone: user.phoneNumber || "-",
        tier: totalSpent > 100000000 ? "Enterprise B2B (TOP 30)" : totalSpent > 20000000 ? "Reguler B2B" : "Komunitas / B2C",
        totalMeters: totalMeters || 1000,
        totalSpent: totalSpent || 25000000,
        favoriteFabric: "Dryfit Milano 135 GSM",
        status: "Aktif",
        address: "Bandung, Jawa Barat",
        joinedAt: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "2025-01-01",
        ordersCount: orders.length,
      };

      const formattedOrders = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: user.name,
        customerCompany: user.companyName || "Perorangan",
        customerPhone: user.phoneNumber || "-",
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod || "Bank Transfer BCA",
        totalAmount: Number(o.totalAmount),
        taxAmount: Number(o.taxAmount || 0),
        shippingAmount: Number(o.shippingAmount || 0),
        createdAt: new Date(o.createdAt).toISOString().replace("T", " ").slice(0, 16),
        items: o.items.map((it) => ({
          id: it.id,
          fabricName: it.fabricName || "Dryfit Milano Premium",
          gsm: it.gsm || 135,
          lengthMeters: Number(it.lengthMeters),
          unitPrice: Number(it.unitPrice),
          subtotal: Number(it.subtotal),
          customDesignTitle: it.customDesignTitle || undefined,
        })),
      }));

      const formattedActivities = (user.activities || []).map((a) => ({
        id: a.id,
        type: a.type,
        title: a.type,
        description: a.description || "",
        date: new Date(a.createdAt).toISOString().replace("T", " ").slice(0, 16),
        actor: "Staff Sales",
      }));

      return NextResponse.json({
        success: true,
        source: "database",
        data: {
          customer,
          orders: formattedOrders,
          activities: formattedActivities,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Pelanggan tidak ditemukan.",
      },
      { status: 404 }
    );
  } catch (err) {
    console.warn("Error fetching customer by id from DB:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat memuat data pelanggan.",
      },
      { status: 500 }
    );
  }
}
