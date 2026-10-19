import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatLead(l: any) {
  return {
    id: l.id,
    title: l.title,
    companyName: l.companyName || "",
    contactPerson: l.contactPerson || "",
    email: l.email || "",
    phone: l.phone || "",
    estimatedValue: l.estimatedValue ? Number(l.estimatedValue) : 0,
    estimatedMeters: l.estimatedMeters ? Number(l.estimatedMeters) : 0,
    fabricInterest: l.fabricInterest || "",
    stage: l.stage,
    assignedSalesName: l.assignedSales?.name || "Rian Pratama",
    updatedAt: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString("id-ID") : "Baru saja",
    activities: (l.activities || []).map((a: any) => ({
      id: a.id,
      leadId: a.leadId,
      authorName: a.user?.name || "Rian Pratama",
      type: a.type,
      description: a.description,
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    })),
  };
}

export async function GET() {
  try {
    const dbLeads = await prisma.lead.findMany({
      include: {
        assignedSales: true,
        customer: true,
        activities: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = dbLeads.map(formatLead);
    return NextResponse.json({
      success: true,
      source: "database",
      total: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.warn("Database error in GET /api/crm/leads:", err);
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

    const salesRep = await prisma.user.findFirst({
      where: { role: "SALES_REP" },
    });

    const newLead = await prisma.lead.create({
      data: {
        title: body.title || `Inkuiri Kain Sublimasi - ${body.companyName || "Mitra Baru"}`,
        companyName: body.companyName || "Perusahaan Mitra",
        contactPerson: body.contactPerson || "PIC",
        email: body.email || "pic@mitra.test",
        phone: body.phone || "08123456789",
        estimatedValue: body.estimatedValue ? Number(body.estimatedValue) : 10000000,
        estimatedMeters: body.estimatedMeters ? Number(body.estimatedMeters) : 200,
        fabricInterest: body.fabricInterest || "Dryfit Milano",
        stage: body.stage || "NEW_INQUIRY",
        assignedSalesId: salesRep?.id || null,
        notes: body.notes || null,
      },
      include: {
        assignedSales: true,
        activities: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lead B2B baru berhasil ditambahkan ke database CRM.",
        data: formatLead(newLead),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating lead:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses data lead." },
      { status: 500 }
    );
  }
}
