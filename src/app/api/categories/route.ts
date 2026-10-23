import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  allCategories,
  categoryKey,
  pluralKey,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * MASTER KATEGORI KAIN
 *
 * GET  /api/categories          → daftar kategori (DB + kategori terpakai di produk + default)
 * POST /api/categories { name } → tambah kategori baru (tervalidasi)
 */

export async function GET() {
  try {
    const categories = await allCategories();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("[categories] GET gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat kategori.", categories: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "")
      .trim()
      .replace(/\s+/g, " ");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }
    if (name.length > 60) {
      return NextResponse.json(
        { success: false, error: "Nama kategori maksimal 60 karakter." },
        { status: 400 }
      );
    }

    const existing = await allCategories();
    const rawKey = categoryKey(name);
    const pKey = pluralKey(name);

    for (const name2 of existing) {
      if (categoryKey(name2) === rawKey) {
        return NextResponse.json(
          {
            success: false,
            error: `Kategori "${name2}" sudah ada. Gunakan kategori yang tersedia.`,
            similar: name2,
          },
          { status: 409 }
        );
      }
      if (pluralKey(name2) === pKey) {
        return NextResponse.json(
          {
            success: false,
            error: `Terlalu mirip dengan kategori "${name2}". Gunakan kategori yang sudah ada daripada menambah variasi bentuknya.`,
            similar: name2,
          },
          { status: 409 }
        );
      }
    }

    try {
      await prisma.category.create({
        data: { name, createdBy: null },
      });
    } catch (dbErr: any) {
      // Race condition: kategori dibuat bersamaan → P2002 unique constraint
      if (dbErr?.code === "P2002") {
        return NextResponse.json(
          { success: false, error: `Kategori "${name}" sudah ada.`, similar: name },
          { status: 409 }
        );
      }
      throw dbErr;
    }

    const categories = await allCategories();
    return NextResponse.json({ success: true, category: name, categories });
  } catch (err) {
    console.error("[categories] POST gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan kategori ke database." },
      { status: 500 }
    );
  }
}
