import { NextResponse } from "next/server";
import { MOCK_ORDERS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let orders = [...MOCK_ORDERS];
  if (status && status !== "ALL") {
    orders = orders.filter((o) => o.status === status);
  }

  return NextResponse.json({
    success: true,
    total: orders.length,
    data: orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `TEX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: "PENDING_APPROVAL",
      paymentStatus: "PENDING",
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: "Pesanan sublimasi berhasil dibuat.",
      data: newOrder,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat pesanan." },
      { status: 500 }
    );
  }
}
