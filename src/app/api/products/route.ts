import { NextResponse } from "next/server";
import { MOCK_FABRICS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  let fabrics = [...MOCK_FABRICS];

  if (category && category !== "ALL") {
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

    const newProduct = {
      id: `fab-${Date.now()}`,
      slug: body.name.toLowerCase().replace(/\s+/g, "-"),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Kain baru berhasil ditambahkan ke katalog.",
      data: newProduct,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses data kain." },
      { status: 500 }
    );
  }
}
