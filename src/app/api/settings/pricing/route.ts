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

/**
 * Normalisasi nominal rupiah: menerima nilai apa pun (termasuk 12.500),
 * tapi menolak NaN / negatif agar data pengaturan tidak rusak.
 */
function normalizeFee(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function GET(request: Request) {
  try {
    const lang = normalizeLocale(new URL(request.url).searchParams.get("lang"));

    const rows = await prisma.siteContent.findMany({
      where: {
        group: "pricing",
      },
    }).catch(() => []);

    const map = new Map(rows.map((r) => [r.key, r.value]));

    const designServiceFee = normalizeFee(
      map.get("pricing.design_service_fee"),
      DEFAULT_PRICING.designServiceFee
    );

    const sublimationPrintFee = normalizeFee(
      map.get("pricing.sublimation_print_fee"),
      DEFAULT_PRICING.sublimationPrintFee
    );

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

    const safeDesignServiceFee = normalizeFee(
      designServiceFee,
      DEFAULT_PRICING.designServiceFee
    );
    const safeSublimationPrintFee = normalizeFee(
      sublimationPrintFee,
      DEFAULT_PRICING.sublimationPrintFee
    );

    const entries = [
      {
        key: "pricing.design_service_fee",
        value: String(safeDesignServiceFee),
        label: "Tarif Jasa Desain Grafis (Rp)",
      },
      {
        key: "pricing.sublimation_print_fee",
        value: String(safeSublimationPrintFee),
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
        designServiceFee: safeDesignServiceFee,
        sublimationPrintFee: safeSublimationPrintFee,
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
