import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existing = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Lead tidak ditemukan." },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (body.stage) dataToUpdate.stage = body.stage;
    if (body.estimatedValue !== undefined) dataToUpdate.estimatedValue = Number(body.estimatedValue);
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;
    dataToUpdate.updatedAt = new Date();

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        assignedSales: true,
        activities: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Lead ${updated.companyName} berhasil diperbarui di database.`,
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating lead:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui lead." },
      { status: 500 }
    );
  }
}
