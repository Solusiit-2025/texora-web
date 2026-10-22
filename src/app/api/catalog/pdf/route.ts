import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/catalog/pdf
 *
 * Generates the XoraMateria product catalog as a downloadable PDF (A4):
 *  - Cover page: company identity + key value propositions
 *  - One block per fabric: photo, technical specifications, GSM variants,
 *    stock, and tiered pricing
 *  - Closing page: contact information & call to action
 *
 * Catatan:
 *  - Teks PDF memakai font standar PDF (WinAnsi) sehingga mencakup Latin /
 *    Bahasa Indonesia (é, ñ). Glyph Mandarin/Japanese tidak didukung font
 *    standar, jadi katalog sengaja dibuat dalam Bahasa Indonesia.
 *  - Foto produk di-resize ke 280px (quality 72) sebelum di-embed supaya
 *    ukuran PDF tetap ringan (sekitar 1-2 MB, bukan ~10 MB).
 */
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.fabricProduct.findMany({
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const pdf = await buildCatalogPdf(products);
    const filename = `XoraMateria-Katalog-Produk-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[catalog-pdf] Gagal membuat PDF:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat katalog PDF." },
      { status: 500 }
    );
  }
}

const BRAND = "#0F172A";
const ACCENT = "#F59E0B";
const MUTED = "#64748B";
const TEXT = "#334155";
const SUBTLE = "#475569";

/* ------------------------------------------------------------------ */
/* Preparedan gambar                                                    */
/* ------------------------------------------------------------------ */

/** Cache thumbnail per proses supaya request berikutnya jauh lebih cepat. */
const thumbCache = new Map<string, Buffer | null>();

/**
 * Negative cache untuk gambar remote yang gagal diambil (DNS/HTTP error).
 * Tanpa ini PDF bolak-balik mencoba fetch gambar yang memang tidak bisa
 * diangkau (mis. Unsplash diblokir jaringan) -> lambat di tiap generate.
 */
const remoteFailCache = new Map<string, number>();
const REMOTE_FAIL_TTL = 10 * 60 * 1000;

/** Ambil bytes gambar (lokal atau remote) tanpa batas ukuran session. */
async function readImageBytes(url?: string | null): Promise<Buffer | null> {
  if (!url) return null;

  // Gambar lokal di folder public
  if (url.startsWith("/")) {
    const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    try {
      if (!fs.existsSync(abs)) return null;
      if (fs.statSync(abs).size > 8_000_000) return null;
      return fs.readFileSync(abs);
    } catch {
      return null;
    }
  }

  // Gambar remote (mis. Unsplash) - diambil dengan timeout agar tidak
  // menggantung kalau CDN sedang lambat.
  if (/^https?:\/\//i.test(url)) {
    const failUntil = remoteFailCache.get(url);
    if (failUntil && Date.now() < failUntil) return null;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) {
        remoteFailCache.set(url, Date.now() + REMOTE_FAIL_TTL);
        return null;
      }
      const type = res.headers.get("content-type") || "";
      if (!type.startsWith("image/")) {
        remoteFailCache.set(url, Date.now() + REMOTE_FAIL_TTL);
        return null;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 8_000_000) {
        remoteFailCache.set(url, Date.now() + REMOTE_FAIL_TTL);
        return null;
      }
      return buf;
    } catch {
      // Jaringan/DNS gagal -> tandai supaya tidak dicoba lagi selama 10 menit
      remoteFailCache.set(url, Date.now() + REMOTE_FAIL_TTL);
      return null;
    }
  }

  return null;
}

/** Resize + kompres gambar menjadi thumbnail JPEG kecil. */
async function prepareThumbnail(url?: string | null): Promise<Buffer | null> {
  if (!url) return null;
  if (thumbCache.has(url)) return thumbCache.get(url) ?? null;

  let out: Buffer | null = null;
  try {
    const raw = await readImageBytes(url);
    if (raw) {
      const sharp = (await import("sharp")).default;
      out = await sharp(raw)
        .rotate()
        .resize(280, 280, { fit: "cover", position: "centre" })
        .jpeg({ quality: 72 })
        .toBuffer();
    }
  } catch (err) {
    console.warn("[catalog-pdf] Gagal menyiapkan gambar:", url, err);
    out = null;
  }

  thumbCache.set(url, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Generator PDF                                                        */
/* ------------------------------------------------------------------ */

async function buildCatalogPdf(products: any[]): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 45,
    info: {
      Title: "Katalog Produk XoraMateria",
      Author: "XoraMateria",
      Subject: "Katalog kain polyester siap sublimasi & jasa cetak sublimasi",
      Keywords: "kain sublimasi, dryfit milano, voal ultrafine, teksil jakarta",
    },
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // Ukuran A4 dalam point (satuan pdfkit).
  // Catatan: doc.page belum ada saat autoFirstPage=false, jadi dimensi ditulis eksplisit.
  const pageW = 595.28;
  const pageH = 841.89;
  const M = 45;
  const contentW = pageW - M * 2;

  // ---------- Helper halaman & footer ----------
  let pageCounter = 0;
  const addPage = () => {
    doc.addPage();
    pageCounter += 1;
  };

  const drawFooter = () => {
    const y = pageH - 34;
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(
        "XoraMateria  •  Jl. Walang Baru VI Blok B1/2, Tugu Utara, Tanjung Priok, Jakarta Utara 14140  •  +62 878-8985-6066  •  sales@texoraprima.com",
        M,
        y,
        { width: contentW, align: "left", lineBreak: false }
      )
      .text(`Hal. ${pageCounter}`, M, y, {
        width: contentW,
        align: "right",
        lineBreak: false,
      });
  };

  // =========================================================
  // COVER
  // =========================================================
  addPage();
  doc.rect(0, 0, pageW, pageH).fill(BRAND);
  doc.rect(0, 0, 8, pageH).fill(ACCENT);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(ACCENT)
    .text("XORAMATERIA", M + 14, 120);

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor("#FFFFFF")
    .text("Katalog Produk", M + 14, 150, { width: contentW - 30 });

  doc
    .font("Helvetica")
    .fontSize(15)
    .fillColor("#CBD5E1")
    .text("Kain Polyester Siap Sublimasi & Jasa Cetak Roll-to-Roll", M + 14, 195, {
      width: contentW - 30,
    });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#94A3B8")
    .text(
      "Manufaktur kain & cetak sublimasi skala industri. Satu atap dari bahan mentah, proofing digital, hingga gulungan siap kargo untuk brand sportswear, busana muslim, dan merchandise.",
      M + 14,
      230,
      { width: contentW - 60, lineGap: 3 }
    );

  // Kotak info
  const boxY = 300;
  doc.roundedRect(M + 14, boxY, contentW - 30, 108, 8).fill("#1E293B");
  const facts: Array<[string, string]> = [
    ["Kapasitas cetak", "10.000 meter / hari"],
    ["Katalog produk", `${products.length} jenis kain siap sublimasi`],
    ["Sertifikasi", "OEKO-TEX Standard 100 Class 1"],
    ["Minimum order", "1 meter (harga bertingkat)"],
  ];
  facts.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + 30 + col * ((contentW - 60) / 2);
    const y = boxY + 18 + row * 44;
    doc.font("Helvetica").fontSize(7.5).fillColor("#64748B").text(f[0].toUpperCase(), x, y);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF").text(f[1], x, y + 11);
  });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748B")
    .text(
      `Dicetak: ${new Date().toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })}  •  harga dalam Rupiah (IDR) per meter`,
      M + 14,
      pageH - 60
    );

  // =========================================================
  // DAFTAR PRODUK
  // =========================================================
  addPage();
  doc.font("Helvetica-Bold").fontSize(18).fillColor(BRAND).text("Daftar Produk", M, M);
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(
      "Harga bersifat indikatif (bertingkat per meter). Hubungi tim sales untuk penawaran final, ketersediaan stok, dan termin pembayaran.",
      M,
      M + 26,
      { width: contentW }
    );
  drawFooter();

  for (const p of products) {
    // Cek ruang tersisa
    if (doc.y > pageH - 210) {
      addPage();
      drawFooter();
    }

    const startY = doc.y + 12;

    // Foto produk (di-resize dulu supaya PDF ringan)
    const thumb = await prepareThumbnail(p.thumbnailUrl);
    let textX = M;
    let textW = contentW;
    if (thumb) {
      try {
        doc.image(thumb, M, startY, { width: 90, height: 90, fit: [90, 90] });
        doc.rect(M, startY, 90, 90).lineWidth(0.5).stroke("#E2E8F0");
        textX = M + 102;
        textW = contentW - 102;
      } catch {
        /* lanjut tanpa foto */
      }
    }

    const tx = textX;
    let ty = startY;

    // Kategori + nama
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(ACCENT)
      .text((p.category || "Kain").toUpperCase(), tx, ty);
    ty += 12;

    doc.font("Helvetica-Bold").fontSize(13).fillColor(BRAND).text(p.name, tx, ty, {
      width: textW,
    });
    ty += 18;

    // Spesifikasi
    const specs: Array<[string, string]> = [
      ["Komposisi", p.composition || "-"],
      ["Anyaman", p.weaveType || "-"],
      ["Lebar", `${p.widthInch} inci (~${Math.round(Number(p.widthInch) * 2.54)} cm)`],
      ["Siap sublimasi", p.isSublimationReady ? "Ya" : "Tidak"],
    ];
    if (p.variants?.length) {
      specs.push([
        "Varian GSM",
        p.variants.map((v: any) => `${v.gsm} GSM (${v.colorName})`).join(", "),
      ]);
      const totalStock = p.variants.reduce(
        (s: number, v: any) => s + Number(v.stockMeters || 0),
        0
      );
      specs.push(["Stok", `${formatNumber(totalStock)} m`]);
    }

    specs.forEach(([label, value]) => {
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`${label}:`, tx, ty, {
        width: 118,
      });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(BRAND).text(value, tx + 120, ty, {
        width: textW - 120,
      });
      ty += 12;
    });

    // Harga bertingkat
    if (p.priceTiers?.length) {
      ty += 4;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(BRAND)
        .text("Harga Bertingkat (IDR / meter):", tx, ty);
      ty += 11;
      const tiers = p.priceTiers
        .map(
          (t: any) =>
            `${
              t.maxMeters
                ? `${t.minMeters}-${t.maxMeters} m`
                : `>= ${t.minMeters} m`
            }  ->  ${formatRupiah(Number(t.unitPrice))}`
        )
        .join("     ");
      doc.font("Helvetica").fontSize(8).fillColor(TEXT).text(tiers, tx, ty, {
        width: textW,
      });
      ty += 14;
    }

    // Deskripsi (dibersihkan dari HTML)
    const desc = String(p.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (desc) {
      doc.font("Helvetica").fontSize(8.5).fillColor(SUBTLE).text(desc, tx, ty, {
        width: textW,
        lineGap: 1.5,
      });
    }

    // Atur cursor ke bawah blok
    const usedHeight = thumb ? 90 : ty - startY + 20;
    doc.y = Math.max(doc.y, startY + usedHeight + 14);

    // Garis pemisah
    doc
      .moveTo(M, doc.y)
      .lineTo(M + contentW, doc.y)
      .lineWidth(0.5)
      .stroke("#E2E8F0");
    doc.y += 12;
  }

  // =========================================================
  // HALAMAN PENUTUP
  // =========================================================
  addPage();
  doc.rect(0, 0, pageW, 210).fill(BRAND);
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#FFFFFF")
    .text("Siap Minta Penawaran?", M, 70, { width: contentW });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#CBD5E1")
    .text(
      "Kirim kebutuhan kain Anda (jenis kain, estimasi meter, file referensi) dan tim sales kami akan membalas dengan penawaran harga, termin, dan jadwal produksi dalam 1-2 jam kerja.",
      M,
      102,
      { width: contentW - 60, lineGap: 2 }
    );

  const contacts: Array<[string, string]> = [
    ["WhatsApp", "+62 878-8985-6066"],
    ["Email", "admin@texoraprima.com"],
    [
      "Alamat",
      "Jl. Walang Baru VI Blok B1/2, RT 04/RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara 14140",
    ],
    ["Jam kerja", "Senin - Sabtu, 08.00 - 17.00 WIB"],
  ];
  let cy = 245;
  contacts.forEach(([label, value]) => {
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(label.toUpperCase(), M, cy);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(BRAND).text(value, M, cy + 11);
    cy += 34;
  });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "Katalog ini disusun otomatis dari sistem katalog XoraMateria. Spesifikasi & harga dapat berubah - mohon konfirmasi ke tim sales sebelum memesan.",
      M,
      pageH - 90,
      { width: contentW }
    );

  doc.end();
  return finished;
}
