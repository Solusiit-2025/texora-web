import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { getCatalogPdfMeta } from "@/lib/catalog-pdf";
import {
  getObjectFromStorage,
  isStorageConfigured,
  storageKeyFromPublicUrl,
} from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Response unduhan PDF dengan header yang konsisten (lokal, R2, atau otomatis). */
function catalogPdfResponse(
  body: BodyInit,
  safeName: string,
  meta: {
    status?: number;
    contentLength?: number;
    contentRange?: string;
    etag?: string;
    lastModified?: Date;
  } = {}
): NextResponse {
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "Cache-Control": "public, max-age=300",
    "Accept-Ranges": "bytes",
  };
  if (meta.contentLength && meta.contentLength > 0) {
    headers["Content-Length"] = String(meta.contentLength);
  }
  if (meta.contentRange) headers["Content-Range"] = meta.contentRange;
  if (meta.etag) headers["ETag"] = meta.etag;
  if (meta.lastModified) headers["Last-Modified"] = meta.lastModified.toUTCString();

  return new NextResponse(body, { status: meta.status ?? 200, headers });
}

/**
 * GET /api/catalog/pdf
 *
 * Urutan perilaku:
 *  1. Jika admin sudah mengunggah katalog PDF lewat CMS -> kirim file itu
 *     lewat domain sendiri (bukan redirect). Redirect ke `*.r2.dev` sering
 *     gagal di Indonesia karena domain r2.dev diblokir DNS ISP, sehingga
 *     tombol "Unduh Katalog PDF" berakhir "This site can't be reached".
 *  2. Jika belum (atau file unggahan tidak bisa diambil) -> buat katalog
 *     otomatis dari data produk (A4, profesional).
 *
 * Desain katalog otomatis:
 *  - Cover gelap dengan logo, ringkasan kapasitas, dan identitas brand.
 *  - Halaman "Tentang & Keunggulan" + alur pemesanan.
 *  - Satu kartu per produk: foto, spesifikasi, varian GSM, stok, tabel harga.
 *  - Halaman penutup: kontak, QR katalog digital, dan disclaimer.
 */
export async function GET(req: NextRequest) {
  try {
    // 1) Katalog hasil unggahan manual (CMS) — selalu diprioritaskan.
    const uploaded = await getCatalogPdfMeta();
    if (uploaded?.url) {
      const safeName = (uploaded.filename || "Katalog-XoraMateria.pdf").replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );

      // 1a) File lokal di public/uploads: stream langsung dari disk supaya
      // tombol "Unduh" menghasilkan file dengan nama yang benar.
      if (uploaded.url.startsWith("/")) {
        try {
          const abs = path.join(process.cwd(), "public", uploaded.url.replace(/^\//, ""));
          if (fs.existsSync(abs)) {
            const buf = fs.readFileSync(abs);
            return catalogPdfResponse(buf, safeName, { contentLength: buf.length });
          }
        } catch {
          /* lanjut ke katalog otomatis di bawah */
        }
      } else if (/^https?:\/\//i.test(uploaded.url)) {
        // 1b) File di R2/S3: sajikan lewat domain sendiri (proxy), bukan
        // redirect. Redirect 302 ke `https://pub-xxx.r2.dev/...` memaksa
        // browser menghubungi r2.dev langsung — domain itu diblokir DNS
        // sebagian ISP Indonesia (resolv ke IP halaman blokir), jadi unduhan
        // gagal: "This site can't be reached".
        const range = req.headers.get("range") || undefined;

        // Prioritas: ambil via S3 API (host sama dengan upload), sehingga
        // tidak bergantung sama sekali pada DNS domain r2.dev.
        const storageKey = storageKeyFromPublicUrl(uploaded.url);
        if (storageKey && isStorageConfigured()) {
          try {
            const obj = await getObjectFromStorage(storageKey, range);
            if (obj.body) {
              return catalogPdfResponse(obj.body, safeName, {
                status: obj.contentRange ? 206 : 200,
                contentLength: obj.contentLength,
                contentRange: obj.contentRange,
                etag: obj.etag,
                lastModified: obj.lastModified,
              });
            }
          } catch (error) {
            console.error("[catalog-pdf] Gagal ambil objek via S3:", error);
          }
        }

        // Fallback: ambil lewat HTTP biasa (URL milik host/CDN lain).
        try {
          const upstream = await fetch(uploaded.url, {
            cache: "no-store",
            headers: range ? { Range: range } : undefined,
          });

          if (upstream.ok && upstream.body) {
            const length = Number(upstream.headers.get("content-length")) || undefined;
            return catalogPdfResponse(upstream.body, safeName, {
              status: upstream.status === 206 ? 206 : 200,
              contentLength: length,
              contentRange: upstream.headers.get("content-range") || undefined,
              etag: upstream.headers.get("etag") || undefined,
            });
          }
          console.error(
            "[catalog-pdf] Gagal mengambil katalog dari storage:",
            upstream.status,
            uploaded.url
          );
        } catch (error) {
          console.error("[catalog-pdf] Gagal mengambil katalog dari storage:", error);
        }
        // Gagal ambil file unggahan -> lanjut ke katalog otomatis di bawah.
      }
    }

    // 2) Katalog otomatis dari database.
    const products = await prisma.fabricProduct.findMany({
      include: {
        variants: true,
        priceTiers: { orderBy: { minMeters: "asc" } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const pdf = await buildCatalogPdf(products);
    const filename = `XoraMateria-Katalog-${new Date().toISOString().slice(0, 10)}.pdf`;

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

/* ------------------------------------------------------------------ */
/* Palet & konstanta                                                    */
/* ------------------------------------------------------------------ */

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 46;
const CONTENT_W = PAGE_W - M * 2;

const BRAND = "#0B1B33"; // navy
const BRAND_SOFT = "#16243D";
const ACCENT = "#C8A96A"; // gold (logo)
const GREEN = "#6E8F7C"; // sage (logo)
const INK = "#0F172A";
const TEXT = "#334155";
const MUTED = "#64748B";
const LINE = "#E2E8F0";
const SURFACE = "#F8FAFC";

/* ------------------------------------------------------------------ */
/* Persiapan gambar                                                     */
/* ------------------------------------------------------------------ */

/** Cache thumbnail per proses supaya request berikutnya jauh lebih cepat. */
const thumbCache = new Map<string, Buffer | null>();

/**
 * Negative cache untuk gambar remote yang gagal diambil (DNS/HTTP error).
 * Tanpa ini PDF bolak-balik mencoba fetch gambar yang memang tidak bisa
 * dijangka (mis. Unsplash diblokir jaringan) -> lambat di tiap generate.
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
        .resize(320, 320, { fit: "cover", position: "centre" })
        .jpeg({ quality: 78 })
        .toBuffer();
    }
  } catch (err) {
    console.warn("[catalog-pdf] Gagal menyiapkan gambar:", url, err);
    out = null;
  }

  thumbCache.set(url, out);
  return out;
}

/** Logo brand (PNG transparan) untuk cover & penutup. */
let logoCache: Buffer | null | undefined;
async function prepareLogo(): Promise<Buffer | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const abs = path.join(process.cwd(), "public", "icons", "xoramateria-mark.png");
    logoCache = fs.existsSync(abs) ? fs.readFileSync(abs) : null;
  } catch {
    logoCache = null;
  }
  return logoCache;
}

/* ------------------------------------------------------------------ */
/* Helpers teks                                                         */
/* ------------------------------------------------------------------ */

function cleanText(value?: string | null): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clampText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function categoryLabel(category?: string | null): string {
  const map: Record<string, string> = {
    sportswear: "Sportswear",
    "hijab-fashion": "Hijab & Fashion",
    "home-living": "Home Living",
    merchandise: "Merchandise & Flag",
  };
  return map[String(category || "").toLowerCase()] || "Kain Industri";
}

/* ------------------------------------------------------------------ */
/* Generator PDF                                                        */
/* ------------------------------------------------------------------ */

async function buildCatalogPdf(products: any[]): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: M,
    info: {
      Title: "Katalog Produk XoraMateria",
      Author: "XoraMateria",
      Subject: "Katalog kain polyester siap sublimasi & jasa cetak sublimasi",
      Keywords: "kain sublimasi, dryfit milano, voal ultrafine, tekstil jakarta",
    },
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  /**
   * Jalankan penulisan teks TANPA memicu auto-pagination PDFKit.
   *
   * PDFKit otomatis menambah halaman baru kalau `y + tinggi baris` melewati
   * batas bawah margin. Teks footer/penutup sengaja diletakkan dekat tepi
   * bawah, jadi margin bawah dinolkan sementara.
   */
  const keepOnPage = <T,>(fn: () => T): T => {
    const prev = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    try {
      return fn();
    } finally {
      doc.page.margins.bottom = prev;
    }
  };

  let pageCounter = 0;
  const addPage = () => {
    doc.addPage();
    pageCounter += 1;
  };

  const drawFooter = () => {
    // Simpan posisi cursor: `doc.text()` di footer mengubah doc.y, yang bisa
    // membuat loop produk mengira halaman sudah penuh.
    const prevY = doc.y;
    const y = PAGE_H - 36;

    doc
      .moveTo(M, y - 8)
      .lineTo(M + CONTENT_W, y - 8)
      .lineWidth(0.5)
      .stroke(LINE);

    keepOnPage(() => {
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(MUTED)
        .text(
          "XoraMateria  •  Kain sublimasi & jasa cetak roll  •  Jakarta Utara",
          M,
          y,
          { width: CONTENT_W - 60, lineBreak: false }
        )
        .text(`Halaman ${pageCounter}`, M, y, {
          width: CONTENT_W,
          align: "right",
          lineBreak: false,
        });
    });

    doc.y = prevY;
  };

  const drawHeader = (section?: string) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(BRAND)
      .text("XORAMATERIA", M, 30, { lineBreak: false });

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        (section || "Katalog Produk").toUpperCase(),
        M,
        30,
        { width: CONTENT_W, align: "right", lineBreak: false, characterSpacing: 0.8 }
      );

    doc
      .moveTo(M, 46)
      .lineTo(M + CONTENT_W, 46)
      .lineWidth(0.6)
      .stroke(LINE);
  };

  const sectionTitle = (title: string, subtitle?: string) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(INK)
      .text(title, M, M);

    if (subtitle) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(MUTED)
        .text(subtitle, M, doc.y + 6, { width: CONTENT_W, lineGap: 2 });
    }

    doc
      .moveTo(M, doc.y + 12)
      .lineTo(M + 54, doc.y + 12)
      .lineWidth(3)
      .stroke(ACCENT);

    doc.y += 26;
  };

  const logo = await prepareLogo();

  // =========================================================
  // COVER
  // =========================================================
  addPage();
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(BRAND);

  // Aksen geometris (logo-inspired)
  doc.save();
  doc.fillOpacity(0.07).fillColor(GREEN).circle(PAGE_W - 40, 150, 190).fill();
  doc.fillOpacity(0.05).fillColor(ACCENT).circle(PAGE_W - 120, 320, 150).fill();
  doc.restore();
  doc.rect(0, 0, 10, PAGE_H).fill(ACCENT);

  if (logo) {
    try {
      doc.image(logo, M + 8, 66, { width: 62, height: 62 });
    } catch {
      /* lanjut tanpa logo */
    }
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#FFFFFF")
    .text("XoraMateria", M + 82, 82);

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(ACCENT)
    .text("FABRIC  •  PRINT  •  FASHION  •  SPORT", M + 82, 103, {
      characterSpacing: 1.2,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(34)
    .fillColor("#FFFFFF")
    .text("Katalog Produk", M + 8, 190, { width: CONTENT_W - 40 });

  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#CBD5E1")
    .text("Kain Polyester Siap Sublimasi & Jasa Cetak Roll-to-Roll", M + 8, 236, {
      width: CONTENT_W - 80,
    });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#94A3B8")
    .text(
      "Manufaktur kain & cetak sublimasi skala industri dalam satu atap — dari bahan mentah, proofing digital, hingga gulungan siap kargo untuk brand sportswear, busana muslim, dan merchandise.",
      M + 8,
      272,
      { width: CONTENT_W - 120, lineGap: 3 }
    );

  // Panel ringkasan
  const boxY = 350;
  doc.roundedRect(M + 8, boxY, CONTENT_W - 40, 120, 10).fill(BRAND_SOFT);
  const facts: Array<[string, string]> = [
    ["Kapasitas cetak", "10.000 meter / hari"],
    ["Katalog produk", `${products.length} jenis kain siap sublimasi`],
    ["Sertifikasi", "OEKO-TEX Standard 100 Class 1"],
    ["Minimum order", "1 meter • harga bertingkat"],
  ];
  facts.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + 28 + col * ((CONTENT_W - 60) / 2);
    const y = boxY + 20 + row * 50;
    doc.font("Helvetica").fontSize(7).fillColor("#7C8CA6").text(f[0].toUpperCase(), x, y, {
      characterSpacing: 0.6,
    });
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF").text(f[1], x, y + 12, {
      width: (CONTENT_W - 60) / 2 - 16,
    });
  });

  keepOnPage(() => {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#7C8CA6")
      .text(
        `Edisi ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}  •  Semua harga dalam Rupiah (IDR) per meter`,
        M + 8,
        PAGE_H - 64
      );

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#FFFFFF")
      .text(
        "texora.co.id   •   +62 858-1064-6157   •   admin@texoraprima.com",
        M + 8,
        PAGE_H - 46
      );
  });

  // =========================================================
  // TENTANG & KEUNGGULAN
  // =========================================================
  addPage();
  drawHeader("Tentang XoraMateria");
  doc.y = 74;

  sectionTitle(
    "Satu atap, dari benang hingga gulungan siap kargo.",
    "XoraMateria memproduksi kain poliester siap sublimasi dan mengerjakan cetak roll-ke-roll dengan kalender rotary 210°C. Tinta dispersi berubah menjadi gas dan menyatu ke dalam serat — warna tidak menempel di permukaan, tidak luntur, dan tetap tajam setelah dicuci berulang."
  );

  const values: Array<[string, string]> = [
    [
      "Harga bertingkat transparan",
      "Harga per meter turun otomatis mengikuti volume. Tanpa biaya tersembunyi, langsung terlihat di katalog.",
    ],
    [
      "Proofing sebelum produksi",
      "Proof digital dan sampel 1 yard memastikan warna, repeat motif, dan hasil cetak sesuai ekspektasi.",
    ],
    [
      "Standar OEKO-TEX 100",
      "Tinta dispersi ramah kulit, anti-luntur, dan tahan cuci berulang untuk produk yang menyentuh kulit.",
    ],
    [
      "Distribusi seluruh Indonesia",
      "Kargo khusus roll, armada Jabodetabek–Bandung, dan pengemasan aman untuk pengiriman luar kota.",
    ],
  ];

  const cardW = (CONTENT_W - 14) / 2;
  const cardH = 84;
  values.forEach(([title, desc], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + 14);
    const y = doc.y + row * (cardH + 12);

    doc.roundedRect(x, y, cardW, cardH, 8).fill(SURFACE);
    doc.rect(x, y, 3, cardH).fill(i % 3 === 0 ? ACCENT : i % 3 === 1 ? GREEN : BRAND);

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(INK)
      .text(title, x + 14, y + 12, { width: cardW - 26 });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(desc, x + 14, y + 28, { width: cardW - 26, lineGap: 1.6 });
  });

  doc.y += cardH * 2 + 12 + 26;

  // Alur pemesanan
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(INK)
    .text("Alur Pemesanan", M, doc.y);
  doc.y += 16;

  const steps: Array<[string, string]> = [
    ["01", "Pilih kain & varian GSM"],
    ["02", "Kirim artwork / brief desain"],
    ["03", "Proofing digital & approval"],
    ["04", "Produksi, QC, lalu pengiriman"],
  ];
  const stepW = (CONTENT_W - 3 * 10) / 4;
  const stepY = doc.y;
  steps.forEach(([num, label], i) => {
    const x = M + i * (stepW + 10);
    doc.roundedRect(x, stepY, stepW, 58, 8).stroke(LINE);
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(ACCENT)
      .text(num, x + 10, stepY + 10);
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(TEXT)
      .text(label, x + 10, stepY + 28, { width: stepW - 20, lineGap: 1.5 });
  });
  doc.y = stepY + 58;

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(MUTED)
    .text(
      "Catatan: toleransi susut kain standar pabrik ±2–3%. Warna final dapat berbeda sedikit antar-lot produksi — selalu konfirmasi melalui sampel.",
      M,
      doc.y + 18,
      { width: CONTENT_W, lineGap: 1.5 }
    );

  drawFooter();

  // =========================================================
  // DAFTAR PRODUK
  // =========================================================
  addPage();
  drawHeader("Daftar Produk");
  doc.y = 74;

  sectionTitle(
    "Daftar Produk",
    "Harga bersifat indikatif dan bertingkat per meter. Hubungi tim sales untuk penawaran final, ketersediaan stok, dan termin pembayaran."
  );

  let currentCategory = "";

  for (const p of products) {
    const category = categoryLabel(p.category);

    // Judul kategori saat berganti
    if (category !== currentCategory) {
      const needed = 64;
      if (doc.y + needed > PAGE_H - 70) {
        addPage();
        drawHeader("Daftar Produk");
        doc.y = 70;
      }
      currentCategory = category;

      doc.roundedRect(M, doc.y, 4, 16, 2).fill(ACCENT);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(INK)
        .text(category, M + 12, doc.y + 3, { width: CONTENT_W - 12 });
      doc.y += 26;
    }

    const thumb = await prepareThumbnail(p.thumbnailUrl);
    const desc = clampText(cleanText(p.description), 260);

    const specs: Array<[string, string]> = [
      ["Komposisi", cleanText(p.composition) || "-"],
      ["Anyaman", cleanText(p.weaveType) || "-"],
      ["Lebar", `${p.widthInch} inci  (~${Math.round(Number(p.widthInch) * 2.54)} cm)`],
      ["Siap sublimasi", p.isSublimationReady ? "Ya" : "Tidak"],
    ];
    if (p.variants?.length) {
      specs.push([
        "Varian GSM",
        p.variants
          .slice(0, 4)
          .map((v: any) => `${v.gsm} GSM`)
          .join(" • "),
      ]);
      const totalStock = p.variants.reduce(
        (s: number, v: any) => s + Number(v.stockMeters || 0),
        0
      );
      specs.push(["Stok tersedia", `${formatNumber(totalStock)} meter`]);
    }

    const tiers = (p.priceTiers || []).slice(0, 4);
    const priceTableH = tiers.length ? 18 + tiers.length * 13 : 0;
    const descH = desc ? doc.heightOfString(desc, { width: CONTENT_W - 132 }) + 6 : 0;
    const cardH = 16 + 96 + 12 + priceTableH + descH + 14 + 8;

    // Pindah halaman kalau kartu tidak muat
    if (doc.y + cardH > PAGE_H - 60) {
      addPage();
      drawHeader("Daftar Produk");
      doc.y = 62;
    }

    const cardX = M;
    const cardY = doc.y;
    const pad = 14;

    // Kartu
    doc.roundedRect(cardX, cardY, CONTENT_W, cardH, 10).fill("#FFFFFF");
    doc.roundedRect(cardX, cardY, CONTENT_W, cardH, 10).lineWidth(0.6).stroke(LINE);

    // Gambar / placeholder
    const imgX = cardX + pad;
    const imgY = cardY + pad;
    const imgSize = 96;
    if (thumb) {
      try {
        doc.save();
        doc.roundedRect(imgX, imgY, imgSize, imgSize, 6).clip();
        doc.image(thumb, imgX, imgY, { width: imgSize, height: imgSize });
        doc.restore();
      } catch {
        doc.roundedRect(imgX, imgY, imgSize, imgSize, 6).fill(SURFACE);
      }
    } else {
      doc.roundedRect(imgX, imgY, imgSize, imgSize, 6).fill(SURFACE);
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#CBD5E1")
        .text((p.name || "?").trim().charAt(0).toUpperCase(), imgX, imgY + 34, {
          width: imgSize,
          align: "center",
        });
    }
    doc.roundedRect(imgX, imgY, imgSize, imgSize, 6).lineWidth(0.5).stroke(LINE);

    // Info kanan
    const infoX = imgX + imgSize + 14;
    const infoW = CONTENT_W - (infoX - cardX) - pad;
    let infoY = cardY + pad;

    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(ACCENT)
      .text(category.toUpperCase(), infoX, infoY, { characterSpacing: 0.8 });
    infoY += 10;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(INK)
      .text(clampText(cleanText(p.name) || "Tanpa Nama", 70), infoX, infoY, {
        width: infoW,
      });
    infoY += 16;

    specs.slice(0, 5).forEach(([label, value]) => {
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(MUTED)
        .text(label, infoX, infoY, { width: 62, lineBreak: false });
      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(TEXT)
        .text(clampText(value, 52), infoX + 64, infoY, {
          width: infoW - 64,
          lineBreak: false,
        });
      infoY += 10;
    });

    // Tabel harga
    let tableY = cardY + pad + 96 + 12;
    if (tiers.length) {
      const tableX = cardX + pad;
      const tableW = CONTENT_W - pad * 2;
      const rowH = 13;

      doc.rect(tableX, tableY, tableW, 18).fill(BRAND);
      doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor("#FFFFFF")
        .text("VOLUME", tableX + 8, tableY + 5.5, { width: 160, lineBreak: false });
      doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor("#FFFFFF")
        .text("HARGA / METER", tableX, tableY + 5.5, {
          width: tableW - 8,
          align: "right",
          lineBreak: false,
        });

      tiers.forEach((t: any, i: number) => {
        const ry = tableY + 18 + i * rowH;
        if (i % 2 === 0) doc.rect(tableX, ry, tableW, rowH).fill("#FAFBFC");

        const vol = t.maxMeters
          ? `${t.minMeters}–${t.maxMeters} m`
          : `≥ ${t.minMeters} m`;

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(TEXT)
          .text(vol, tableX + 8, ry + 3.5, { width: 160, lineBreak: false });
        doc
          .font("Helvetica-Bold")
          .fontSize(7)
          .fillColor(INK)
          .text(`${formatRupiah(Number(t.unitPrice))}`, tableX, ry + 3.5, {
            width: tableW - 8,
            align: "right",
            lineBreak: false,
          });
      });

      tableY += 18 + tiers.length * rowH + 8;
    }

    // Deskripsi
    if (desc) {
      doc
        .font("Helvetica")
        .fontSize(7.2)
        .fillColor(MUTED)
        .text(desc, cardX + pad, tableY, {
          width: CONTENT_W - pad * 2,
          lineGap: 1.6,
        });
    }

    doc.y = cardY + cardH + 12;
    drawFooter();
  }

  // =========================================================
  // HALAMAN PENUTUP
  // =========================================================
  addPage();
  drawHeader("Kontak & Pemesanan");

  doc.rect(0, 62, PAGE_W, 176).fill(BRAND);
  doc.rect(0, 62, 8, 176).fill(ACCENT);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#FFFFFF")
    .text("Siap Memesan?", M + 14, 92, { width: CONTENT_W - 40 });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#CBD5E1")
    .text(
      "Kirim kebutuhan kain Anda — jenis kain, estimasi meter, dan file referensi. Tim sales kami akan membalas dengan penawaran harga, termin pembayaran, dan jadwal produksi dalam 1–2 jam kerja.",
      M + 14,
      124,
      { width: CONTENT_W - 80, lineGap: 2.5 }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(ACCENT)
    .text("MINIMUM ORDER 1 METER  •  PROOFING DIGITAL GRATIS", M + 14, 196, {
      characterSpacing: 0.8,
    });

  const contacts: Array<[string, string]> = [
    ["WhatsApp", "+62 858-1064-6157"],
    ["Email", "admin@texoraprima.com"],
    ["Website", "texora.co.id"],
    ["Jam kerja", "Senin – Sabtu, 08.00 – 17.00 WIB"],
    [
      "Alamat pabrik",
      "Jl. Walang Baru VI Blok B1/2, RT 04/RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara 14140",
    ],
  ];

  let cy = 270;
  contacts.forEach(([label, value], i) => {
    const y = cy + i * 42;
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(label.toUpperCase(), M, y, { characterSpacing: 0.7 });
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(INK)
      .text(value, M, y + 10, { width: CONTENT_W - 150, lineGap: 1.5 });
  });

  // QR katalog digital
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";
    const qr = await QRCode.toBuffer(siteUrl, {
      margin: 1,
      width: 240,
      color: { dark: BRAND, light: "#FFFFFF" },
    });
    const qrX = PAGE_W - M - 96;
    const qrY = 290;
    doc.roundedRect(qrX - 8, qrY - 8, 112, 128, 8).stroke(LINE);
    doc.image(qr, qrX, qrY, { width: 96, height: 96 });
    doc
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text("Scan untuk katalog digital", qrX - 8, qrY + 102, {
        width: 112,
        align: "center",
      });
  } catch {
    /* QR opsional */
  }

  keepOnPage(() => {
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        "Katalog ini disusun otomatis dari sistem katalog XoraMateria. Spesifikasi dan harga dapat berubah — mohon konfirmasi ke tim sales sebelum memesan. Toleransi susut kain standar pabrik ±2–3%.",
        M,
        PAGE_H - 96,
        { width: CONTENT_W, lineGap: 1.6 }
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(BRAND)
      .text("XoraMateria — Fabric • Print • Fashion • Sport", M, PAGE_H - 56);
  });

  drawFooter();

  doc.end();
  return finished;
}
