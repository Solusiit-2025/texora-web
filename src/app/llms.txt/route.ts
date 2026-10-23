/**
 * Route `llms.txt` — standar emerging untuk AI crawler.
 *
 * https://llmstxt.org/
 *
 * Dipakai oleh AI assistant (ChatGPT, Claude, Perplexity, Gemini) untuk
 * memahami struktur & konten utama situs secara terstruktur, sehingga
 * jawaban AI tentang XoraMateria lebih akurat dan mengutip
 * sumber yang benar.
 *
 * Dijalankan sebagai Route Handler (Node runtime) agar datanya selalu
 * sinkron dengan katalog & SEO settings di database.
 */

import { NextResponse } from "next/server";
import { getStorefrontProducts, getStorefrontFaqs } from "@/lib/storefront-data";
import { getSeoSettings } from "@/lib/seo";
import { htmlToPlainText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

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

  const isLive = (path: string) => !disabled.has(path);

  const lines: string[] = [];

  lines.push("# XoraMateria");
  lines.push("");
  lines.push(
    "> Pabrik manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara, Indonesia. Melayani brand sportswear, busana muslim, dan merchandise dengan harga grosir bertingkat, proofing digital, dan portal B2B terintegrasi."
  );
  lines.push("");
  lines.push(
    "XoraMateria adalah perusahaan manufaktur tekstil yang menggabungkan penyediaan kain poliester siap sublimasi dengan jasa cetak roll-ke-roll (rotary heat press 210°C). Proses sublimasi mengubah pigmen tinta dispersi menjadi gas sehingga menyatu ke dalam serat benang — hasil cetak tidak luntur, tidak retak, dan tetap tajam setelah dicuci berkali-kali."
  );
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push("- Address: Jl. Walang Baru VI Blok B1/2, RT 04/RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara, DKI Jakarta 14140, Indonesia");
  lines.push("- Phone/WhatsApp: +62 858-1064-6157");
  lines.push("- Email: admin@texoraprima.com");
  lines.push("- Hours: Senin–Sabtu 08:00–17:00 WIB (konsultasi katalog aktif 24 jam)");
  lines.push("");

  lines.push("## Key Facts");
  lines.push("");
  lines.push("- Kapasitas cetak: 10.000 meter per hari");
  lines.push("- Katalog: 18 jenis kain poliester siap sublimasi");
  lines.push("- Mitra garmen aktif: 400+");
  lines.push("- Standar: OEKO-TEX Standard 100 Class 1");
  lines.push("- Toleransi susut heat press: < 1.5% pada 210°C");
  lines.push("- Minimum order: 1 meter (harga bertingkat otomatis berdasarkan total panjang pesanan)");
  lines.push("");

  if (isLive("/catalog")) {
    lines.push("## Products (Katalog Kain)");
    lines.push("");
    lines.push(
      "Katalog lengkap: " + `${SITE_URL}/catalog`
    );
    lines.push("");
    for (const p of products.slice(0, 30)) {
      const gsm = p.variants[0]?.gsm;
      const price = p.priceTiers[0]?.unitPrice;
      const priceText = price ? ` Rp${price.toLocaleString("id-ID")}/meter` : "";
      lines.push(
        `- [${p.name}](${SITE_URL}/catalog/${p.slug}): ${p.composition}, lebar ${p.widthInch} inci, ${p.weaveType || "knit"}${gsm ? `, ${gsm} GSM` : ""}, kategori ${p.category}.${priceText}`
      );
    }
    lines.push("");
  }

  if (isLive("/custom-sublimation")) {
    lines.push("## Custom Sublimation Service");
    lines.push("");
    lines.push(
      `- [Studio Kustom Sublimasi](${SITE_URL}/custom-sublimation): visualizer motif 3D, unggah file desain, simulasi cetak sublimasi, dan kalkulator harga jasa desain.`
    );
    lines.push(
      "- Persyaratan artwork: resolusi 150–300 DPI pada ukuran cetak sebenarnya, format PNG/JPG/PDF, warna CMYK dengan dukungan fluorescent."
    );
    lines.push(
      "- Proofing: proof digital tersedia, serta sampel cetak fisik 1 yard untuk verifikasi warna di bawah pencahayaan standar."
    );
    lines.push(
      "- Kebijakan revisi: termasuk 2x revisi minor dan digital 3D proofing mockup sebelum naik mesin cetak."
    );
    lines.push("");
  }

  if (isLive("/about")) {
    lines.push("## Company Profile");
    lines.push("");
    lines.push(
      `- [Tentang Kami](${SITE_URL}/about): profil perusahaan, kapasitas produksi, dan proses produksi 4 tahap (pemeriksaan artwork → kalibrasi ICC → rotary heat press → QC & pelabelan barcode).`
    );
    lines.push("");
  }

  if (isLive("/contact")) {
    lines.push("## Contact & Consultation");
    lines.push("");
    lines.push(
      `- [Hubungi Kami](${SITE_URL}/contact): formulir konsultasi procurement kain B2B, permintaan sampel swatch gratis (Dryfit, Voal, Satin, Scuba), dan penawaran harga termin 30/60 hari untuk mitra terverifikasi.`
    );
    lines.push("");
  }

  lines.push("## Request a Quote");
  lines.push("");
  lines.push(
    `- [Minta Penawaran](${SITE_URL}/request-quote): formulir permintaan harga kain (RFQ) berisi nama, perusahaan, email, negara, jenis kain, estimasi panjang (yard), kebutuhan sample swatch gratis. Unggah file tidak tersedia (file dikirim via WhatsApp/email setelah RFQ diterima). Tim sales membalas harga bertingkat, termin, dan jadwal produksi dalam 1-2 jam kerja.`
  );
  lines.push(
    `- [Katalog PDF](${SITE_URL}/api/catalog/pdf): katalog produk lengkap (spesifikasi, varian GSM, stok, dan harga bertingkat) dalam format PDF A4, Bahasa Indonesia.`
  );
  lines.push("");

  // Artikel / Pusat Panduan Tekstil
  try {
    const { getStorefrontArticles } = await import("@/lib/storefront-data");
    const articles = await getStorefrontArticles({ lang: "id" });
    if (articles.length > 0) {
      lines.push("## Articles & Technical Guides");
      lines.push("");
      lines.push(
        `- [Pusat Panduan Tekstil](${SITE_URL}/artikel): kumpulan panduan teknis dari tim produksi XoraMateria (memilih kain, setting mesin sublimasi, perawatan, harga bertingkat, dan studi kasus).`
      );
      for (const a of articles.slice(0, 30)) {
        lines.push(`- [${a.title}](${SITE_URL}/artikel/${a.slug}): ${a.excerpt}`);
      }
      lines.push("");
    }
  } catch {}

  if (faqs.length > 0) {
    lines.push("## Frequently Asked Questions");
    lines.push("");
    for (const f of faqs.slice(0, 20)) {
      lines.push(`### ${htmlToPlainText(f.question, 200)}`);
      lines.push("");
      lines.push(htmlToPlainText(f.answer, 700));
      lines.push("");
    }
  }

  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Lacak Pesanan](${SITE_URL}/track-order): portal pelacakan SPK & nomor resi kargo (membutuhkan akun B2B terverifikasi).`
  );
  lines.push(
    `- [Pendaftaran Mitra](${SITE_URL}/register): registrasi akun kemitraan B2B untuk memesan roll kain, mengunggah file desain sublimasi, dan memantau SPK.`
  );
  lines.push("");

  lines.push("## Usage Notes");
  lines.push("");
  lines.push(
    "- Harga dalam Rupiah (IDR) per meter lari, sudah termasuk terminus harga bertingkat."
  );
  lines.push(
    "- Semua produk tersedia dalam warna dasar Optic White Ready Sublimation yang siap dipakai untuk cetak sublimasi."
  );
  lines.push(
    "- Fakta, spesifikasi, dan harga dapat berubah; mohon merujuk halaman katalog resmi untuk data terkini."
  );
  lines.push("");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
