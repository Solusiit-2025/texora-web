/**
 * Route `llms-full.txt` — versi lengkap dari llms.txt.
 *
 * Berisi seluruh konten teks website (katalog lengkap, semua FAQ, profil
 * perusahaan, layanan kustom) dalam bentuk plain text terstruktur.
 * Berguna untuk AI assistant yang membutuhkan konteks mendasar tanpa
 * harus melakukan scraping banyak halaman.
 *
 * https://llmstxt.org/
 */

import { NextResponse } from "next/server";
import { getStorefrontProducts, getStorefrontFaqs } from "@/lib/storefront-data";
import { getSeoSettings } from "@/lib/seo";
import { htmlToPlainText } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/site-url";

// Dokumen panjang & di-request jarang oleh AI crawler; cache 1 jam.
export const revalidate = 3600;

export async function GET() {
  const [products, faqs, seo] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontFaqs(),
    getSeoSettings().catch(() => null),
  ]);

  const disabled = new Set(
    Object.entries(seo?.pages || {})
      .filter(([, meta]) => (meta as any)?.enabled === false)
      .map(([path]) => path)
  );

  const lines: string[] = [];

  lines.push("# XoraMateria — Full Documentation");
  lines.push("");
  lines.push(
    `Generated: ${new Date().toISOString()} | Source: ${SITE_URL}`
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  // ================= PERUSAHAAN =================
  lines.push("## 1. Profil Perusahaan");
  lines.push("");
  lines.push(
    "XoraMateria adalah perusahaan manufaktur tekstil yang beroperasi di Tugu Utara, Tanjung Priok, Jakarta Utara, DKI Jakarta. Perusahaan ini menggabungkan dua lini bisnis dalam satu atap:"
  );
  lines.push("");
  lines.push(
    "1. **Penyediaan kain** — calendaring, dyeing, dan finishing kain poliester (PE 100%) siap sublimasi dalam roll Ready-to-Print, dengan warna dasar Optic White."
  );
  lines.push(
    "2. **Jasa cetak sublimasi** — digital transfer printing (DTP) dan rotary heat press pada 210°C untuk brand garmen, seragam, jaket, dan merchandise."
  );
  lines.push("");
  lines.push("### Kapasitas & Fasilitas");
  lines.push("");
  lines.push("- Kapasitas cetak: 10.000 meter per hari");
  lines.push("- Katalog aktif: 18 jenis kain");
  lines.push("- Mitra garmen aktif: 400+");
  lines.push("- Standar mutu: OEKO-TEX Standard 100 Class 1");
  lines.push("- Uji susut heat press: < 1.5% pada suhu 210°C");
  lines.push("- Tingkat penetrasi tinta: sisi depan 100%, sisi belakang 75–85%");
  lines.push("- Lokasi: Jl. Walang Baru VI Blok B1/2, RT 04/RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara 14140");
  lines.push("- Telepon/WhatsApp: +62 858-1064-6157");
  lines.push("- Email: admin@texoraprima.com");
  lines.push("- Jam operasional: Senin–Sabtu 08:00–17:00 WIB");
  lines.push("");
  lines.push("### Proses Produksi (4 Tahap)");
  lines.push("");
  lines.push(
    "1. **Pemeriksaan Artwork** — validasi resolusi (150–300 DPI), color space, dan bleed sebelum masuk produksi."
  );
  lines.push(
    "2. **Kalibrasi Profil ICC** — penyesuaian color profile printer agar warna konsisten antar-batch dan antar-unit mesin."
  );
  lines.push(
    "3. **Rotary Heat Press 210–215°C** — tinta dispersi di-sublimasi menjadi gas dan menyatu ke dalam serat benang."
  );
  lines.push(
    "4. **QC & Pelabelan** — pemeriksaan kualitas, pengukuran panjang roll, dan pelabelan barcode per roll."
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  // ================= KATALOG =================
  if (!disabled.has("/catalog")) {
    lines.push("## 2. Katalog Kain Lengkap");
    lines.push("");
    lines.push(`Halaman katalog: ${SITE_URL}/catalog`);
    lines.push("");

    for (const p of products) {
      lines.push(`### ${p.name}`);
      lines.push("");
      lines.push(`- URL: ${SITE_URL}/catalog/${p.slug}`);
      lines.push(`- Komposisi: ${p.composition}`);
      lines.push(`- Anyaman: ${p.weaveType || "-"}`);
      lines.push(`- Lebar: ${p.widthInch} inci (~${Math.round(p.widthInch * 2.54)} cm)`);
      lines.push(`- Kategori: ${p.category}`);
      lines.push(`- Siap sublimasi: ${p.isSublimationReady ? "Ya" : "Tidak"}`);

      if (p.variants.length > 0) {
        lines.push(
          `- Varian: ${p.variants
            .map(
              (v) =>
                `${v.gsm} GSM (${v.colorName}) — stok ${v.stockMeters.toLocaleString("id-ID")} m`
            )
            .join("; ")}`
        );
      }

      if (p.priceTiers.length > 0) {
        lines.push("- Harga bertingkat (IDR per meter):");
        for (const t of p.priceTiers) {
          const range = t.maxMeters
            ? `${t.minMeters}–${t.maxMeters} m`
            : `≥ ${t.minMeters} m`;
          lines.push(
            `  - ${range}: Rp${t.unitPrice.toLocaleString("id-ID")}`
          );
        }
      }

      const desc = htmlToPlainText(p.description, 800);
      if (desc) {
        lines.push("");
        lines.push(desc);
      }
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  // ================= LAYANAN KUSTOM =================
  if (!disabled.has("/custom-sublimation")) {
    lines.push("## 3. Layanan Kustom Sublimasi");
    lines.push("");
    lines.push(`URL: ${SITE_URL}/custom-sublimation`);
    lines.push("");
    lines.push(
      "Studio kustom sublimasi menyediakan visualizer motif 3D, unggah file desain, simulasi hasil cetak, serta kalkulator harga untuk setiap jenis kain."
    );
    lines.push("");
    lines.push("### Persyaratan File Desain");
    lines.push("");
    lines.push("- Resolusi: 150–300 DPI pada ukuran cetak sebenarnya");
    lines.push("- Format: PNG, JPG, atau PDF");
    lines.push("- Warna: CMYK (dukungan fluorescent untuk neon)");
    lines.push("- Ukuran maksimal: 300 MB");
    lines.push("");
    lines.push("### Kebijakan Proofing & Revisi");
    lines.push("");
    lines.push("- Proof digital tersedia sebelum masuk produksi massal");
    lines.push(
      "- Tersedia sampel cetak fisik 1 yard untuk verifikasi warna pada pencahayaan standar pelanggan"
    );
    lines.push("- Termasuk 2x revisi minor dan digital 3D proofing mockup");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // ================= FAQ =================
  if (faqs.length > 0) {
    lines.push("## 4. FAQ Lengkap");
    lines.push("");
    for (const f of faqs) {
      lines.push(`### ${htmlToPlainText(f.question, 300)}`);
      lines.push("");
      lines.push(htmlToPlainText(f.answer, 1500));
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  // ================= PENGIRIMAN =================
  lines.push("## 5. Pengiriman & Pembayaran");
  lines.push("");
  lines.push(
    "- Pengiriman roll kain: kargo spesialis (Dakota Cargo, JNE Trucking) untuk seluruh Indonesia, dan armada sendiri untuk Jabodetabek serta Bandung."
  );
  lines.push(
    "- Kemasan: plastik tebal dan karton pelindung untuk menjaga gulungan dari basah dan lecet."
  );
  lines.push(
    "- Pembayaran B2B: transfer bank dengan terminus 30/60 hari untuk mitra terverifikasi, atau QRIS/virtual account untuk transaksi awal."
  );
  lines.push("");
  lines.push("## 6. Catatan Penggunaan");
  lines.push("");
  lines.push(
    "- Seluruh harga dalam Rupiah (IDR) per meter lari dan sudah memperhitungkan harga bertingkat."
  );
  lines.push(
    "- Data pada dokumen ini bersifat informatif dan dapat berubah. Rujuk halaman katalog resmi untuk data terkini."
  );
  lines.push(
    `- Dokumen dibuat otomatis oleh sistem XoraMateria pada ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB.`
  );
  lines.push("");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
