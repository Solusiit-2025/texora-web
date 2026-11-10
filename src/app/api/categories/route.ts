import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  allCategories,
  getCategoriesWithDetails,
  deleteCategory,
  updateCategory,
  categoryKey,
  pluralKey,
} from "@/lib/categories";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * MASTER KATEGORI KAIN
 *
 * GET    /api/categories          → daftar kategori (array string & details dengan count produk)
 * POST   /api/categories { name } → tambah kategori baru (tervalidasi)
 * DELETE /api/categories { name } → hapus kategori (dicek agar tidak ada produk aktif)
 */

export async function GET() {
  try {
    const [categories, details] = await Promise.all([
      allCategories(),
      getCategoriesWithDetails(),
    ]);
    return NextResponse.json({ success: true, categories, details });
  } catch (err) {
    console.error("[categories] GET gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat kategori.", categories: [], details: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }

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
        data: { name, createdBy: user.id || null },
      });
    } catch (dbErr: any) {
      if (dbErr?.code === "P2002") {
        return NextResponse.json(
          { success: false, error: `Kategori "${name}" sudah ada.`, similar: name },
          { status: 409 }
        );
      }
      throw dbErr;
    }

    const [categories, details] = await Promise.all([
      allCategories(),
      getCategoriesWithDetails(),
    ]);
    return NextResponse.json({ success: true, category: name, categories, details });
  } catch (err) {
    console.error("[categories] POST gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan kategori ke database." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }

    let name = request.nextUrl.searchParams.get("name") || "";
    let id = request.nextUrl.searchParams.get("id") || "";

    if (!name && !id) {
      const body = await request.json().catch(() => ({}));
      name = body.name || "";
      id = body.id || "";
    }

    const target = id || name;
    if (!target) {
      return NextResponse.json(
        { success: false, error: "Parameter nama atau ID kategori wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteCategory(target);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal menghapus kategori." },
        { status: 400 }
      );
    }

    const [categories, details] = await Promise.all([
      allCategories(),
      getCategoriesWithDetails(),
    ]);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus.",
      categories,
      details,
    });
  } catch (err) {
    console.error("[categories] DELETE gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const target = String(body.id || body.oldName || "").trim();
    const newName = String(body.name || body.newName || "").trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Nama kategori asal wajib disertakan." },
        { status: 400 }
      );
    }
    if (!newName) {
      return NextResponse.json(
        { success: false, error: "Nama kategori baru wajib diisi." },
        { status: 400 }
      );
    }

    const result = await updateCategory(target, newName);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal mengubah nama kategori." },
        { status: 400 }
      );
    }

    const [categories, details] = await Promise.all([
      allCategories(),
      getCategoriesWithDetails(),
    ]);

    return NextResponse.json({
      success: true,
      message: "Nama kategori berhasil diperbarui.",
      category: result.category,
      oldName: target,
      categories,
      details,
    });
  } catch (err) {
    console.error("[categories] PUT gagal:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengubah nama kategori." },
      { status: 500 }
    );
  }
}
