import { NextResponse } from "next/server";
import { MOCK_LEADS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: MOCK_LEADS.length,
    data: MOCK_LEADS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLead = {
      id: `lead-${Date.now()}`,
      stage: "PROSPECT",
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: "Lead B2B baru berhasil ditambahkan ke pipeline CRM.",
      data: newLead,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses data lead." },
      { status: 500 }
    );
  }
}
