import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_INVENTORY } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

function formatRoll(r: any) {
  return {
    id: r.id,
    rollBarcode: r.rollBarcode,
    fabricName: r.fabricName || r.fabricVariant?.product?.name || "Kain Sublimasi",
    gsm: Number(r.gsm || r.fabricVariant?.gsm || 140),
    initialMeters: Number(r.initialMeters),
    currentMeters: Number(r.currentMeters),
    warehouseLocation: r.warehouseLocation,
    batchLot: r.batchLot || "LOT-2026-DEFAULT",
    receivedDate: r.receivedDate ? new Date(r.receivedDate).toISOString().slice(0, 10) : "2026-10-01",
  };
}

export async function GET() {
  try {
    const rolls = await prisma.inventoryRoll.findMany({
      include: {
        fabricVariant: {
          include: { product: true },
        },
      },
      orderBy: { receivedDate: "desc" },
    });

    if (rolls.length > 0) {
      const formatted = rolls.map(formatRoll);
      return NextResponse.json({
        success: true,
        source: "database",
        total: formatted.length,
        data: formatted,
      });
    }
  } catch (err) {
    console.warn("Falling back to mock inventory due to DB error:", err);
  }

  return NextResponse.json({
    success: true,
    source: "fallback",
    total: MOCK_INVENTORY.length,
    data: MOCK_INVENTORY,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const created = await prisma.inventoryRoll.create({
      data: {
        rollBarcode: body.rollBarcode || `ROL-FAB-${Math.floor(1000 + Math.random() * 9000)}`,
        fabricName: body.fabricName || "Kain Poliester Sublimasi",
        gsm: Number(body.gsm || 140),
        initialMeters: Number(body.initialMeters || 100),
        currentMeters: Number(body.currentMeters || body.initialMeters || 100),
        warehouseLocation: body.warehouseLocation || "Gudang Utama - Rak A1",
        batchLot: body.batchLot || `LOT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
        receivedDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Roll kain baru berhasil dicatat ke gudang database.",
      data: formatRoll(created),
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating inventory roll:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mencatat roll kain." },
      { status: 500 }
    );
  }
}
