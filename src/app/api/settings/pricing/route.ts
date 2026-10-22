import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLocale, localizeObject } from "@/lib/content-translator";

export const dynamic = "force-dynamic";

const DEFAULT_PRICING = {
  designServiceFee: 150000,
  sublimationPrintFee: 18000,
  designServiceTitle: "Jasa Desain Grafis & Pattern Repeat XoraMateria",
  designServiceDescription: "Pola seamless repeat vector, penyesuaian skala motif, dan 2x revisi minor",
  revisionPolicy: "Termasuk 2x revisi minor & digital 3D proofing mockup sebelum naik mesin cetak.",
};

export async function GET(request: Request) {
  try {
    const lang = normalizeLocale(new URL(request.url).searchParams.get("lang"));

    const rows = await prisma.siteContent.findMany({
      where: {
        group: "pricing",
      },
    }).catch(() => []);

    const map = new Map(rows.map((r) => [r.key, r.value]));

    const designServiceFee = map.has("pricing.design_service_fee")
      ? Number(map.get("pricing.design_service_fee")) || DEFAULT_PRICING.designServiceFee
      : DEFAULT_PRICING.designServiceFee;

    const sublimationPrintFee = map.has("pricing.sublimation_print_fee")
      ? Number(map.get("pricing.sublimation_print_fee")) || DEFAULT_PRICING.sublimationPrintFee
      : DEFAULT_PRICING.sublimationPrintFee;

    let designServiceTitle = map.get("pricing.design_service_title") || DEFAULT_PRICING.designServiceTitle;
    let designServiceDescription = map.get("pricing.design_service_description") || DEFAULT_PRICING.designServiceDescription;
    let revisionPolicy = map.get("pricing.revision_policy") || DEFAULT_PRICING.revisionPolicy;

    if (lang) {
      const localized = await localizeObject(
        "pricing",
        "global",
        { designServiceTitle, designServiceDescription, revisionPolicy },
        ["designServiceTitle", "designServiceDescription", "revisionPolicy"],
        lang
      );
      designServiceTitle = localized.designServiceTitle;
      designServiceDescription = localized.designServiceDescription;
      revisionPolicy = localized.revisionPolicy;
    }

    return NextResponse.json({
      success: true,
      data: {
        designServiceFee,
        sublimationPrintFee,
        designServiceTitle,
        designServiceDescription,
        revisionPolicy,
      },
    });
  } catch (error: any) {
    console.warn("Using default pricing settings due to DB error:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_PRICING,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      designServiceFee,
      sublimationPrintFee,
      designServiceTitle,
      designServiceDescription,
      revisionPolicy,
    } = body;

    const entries = [
      {
        key: "pricing.design_service_fee",
        value: String(Number(designServiceFee) || DEFAULT_PRICING.designServiceFee),
        label: "Tarif Jasa Desain Grafis (Rp)",
      },
      {
        key: "pricing.sublimation_print_fee",
        value: String(Number(sublimationPrintFee) || DEFAULT_PRICING.sublimationPrintFee),
        label: "Tarif Cetak Sublimasi per Meter (Rp)",
      },
      {
        key: "pricing.design_service_title",
        value: String(designServiceTitle || DEFAULT_PRICING.designServiceTitle),
        label: "Judul Layanan Desain",
      },
      {
        key: "pricing.design_service_description",
        value: String(designServiceDescription || DEFAULT_PRICING.designServiceDescription),
        label: "Deskripsi Layanan Desain",
      },
      {
        key: "pricing.revision_policy",
        value: String(revisionPolicy || DEFAULT_PRICING.revisionPolicy),
        label: "Ketentuan Revisi & Proofing",
      },
    ];

    for (const entry of entries) {
      await prisma.siteContent.upsert({
        where: { key: entry.key },
        create: {
          key: entry.key,
          value: entry.value,
          label: entry.label,
          group: "pricing",
        },
        update: {
          value: entry.value,
          label: entry.label,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tarif layanan berhasil diperbarui oleh manajemen.",
      data: {
        designServiceFee: Number(designServiceFee),
        sublimationPrintFee: Number(sublimationPrintFee),
        designServiceTitle,
        designServiceDescription,
        revisionPolicy,
      },
    });
  } catch (error: any) {
    console.error("Error updating pricing settings:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui tarif layanan." },
      { status: 500 }
    );
  }
}
