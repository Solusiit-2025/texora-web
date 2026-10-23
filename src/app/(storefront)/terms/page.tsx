import type { Metadata } from "next";
import { JsonLd } from "@/components/common/JsonLd";
import { LegalDocument, type LegalSection } from "@/components/storefront/LegalDocument";
import { getRequestLocale } from "@/lib/server-locale";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

const TITLE = "Syarat & Ketentuan Layanan — Pemesanan Kain & Sublimasi | XoraMateria";
const DESCRIPTION =
  "Syarat dan ketentuan XoraMateria untuk pemesanan kain sublimasi, jasa cetak roll, proofing, pembayaran, pengiriman, klaim, dan hak kekayaan intelektual artwork.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isPrimary = locale === "id";
  return buildPageMetadata({
    locale,
    path: "/terms",
    // Sama seperti Kebijakan Privasi: hanya versi Indonesia yang diindeks.
    canonical: "/terms",
    noindex: !isPrimary,
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
      "syarat ketentuan xoramateria",
      "ketentuan pemesanan kain sublimasi",
      "kontrak cetak sublimasi b2b",
    ],
    schemaType: "organization",
  });
}

const SECTIONS: LegalSection[] = [
  {
    heading: "Penerimaan ketentuan",
    paragraphs: [
      "Dengan mengakses website, mendaftar sebagai mitra, atau mengirim pesanan kepada XoraMateria (PT. Texora Visi Prima), Anda menyetujui Syarat & Ketentuan ini.",
      "Jika Anda mewakili perusahaan, Anda menyatakan berwenang mengikat perusahaan tersebut terhadap ketentuan ini.",
    ],
  },
  {
    heading: "Akun mitra dan kelayakan",
    bullets: [
      "Layanan utama ditujukan untuk pelanggan bisnis (B2B): brand garmen, konveksi, reseller, dan institusi.",
      "Anda bertanggung jawab menjaga kerahasiaan kredensial akun portal dan seluruh aktivitas yang terjadi di dalamnya.",
      "Kami dapat menolak atau menonaktifkan akun yang memberikan data tidak benar atau menyalahgunakan layanan.",
    ],
  },
  {
    heading: "Penawaran, pesanan, dan kontrak",
    bullets: [
      "Harga di website bersifat indikatif dan dapat berubah. Harga final mengikuti penawaran resmi (quotation) yang disetujui.",
      "Pesanan dianggap sah setelah PO diterima, spesifikasi disepakati, dan pembayaran awal (bila disyaratkan) diterima.",
      "Surat Perintah Kerja (SPK) memuat jenis kain, varian GSM, jumlah meter, harga, jadwal produksi, dan catatan khusus.",
      "Ketersediaan stok dapat berubah; kami akan mengonfirmasi sebelum produksi dimulai.",
    ],
  },
  {
    heading: "Harga, pajak, dan pembayaran",
    bullets: [
      "Semua harga dalam Rupiah (IDR) dan belum termasuk PPN kecuali dinyatakan lain.",
      "Pembayaran dilakukan ke rekening resmi atas nama PT. Texora Visi Prima. Kami tidak bertanggung jawab atas transfer ke rekening selain yang tercantum pada invoice resmi.",
      "Termin pembayaran (mis. DP 30% dan pelunasan sebelum pengiriman, atau termin 30/60 hari untuk mitra terverifikasi) diatur dalam penawaran.",
      "Keterlambatan pembayaran dapat menunda produksi/pengiriman dan dikenakan ketentuan yang disepakati dalam kontrak.",
    ],
  },
  {
    heading: "Proofing, persetujuan, dan toleransi produksi",
    bullets: [
      "Proof digital dan/atau sampel cetak disediakan sebelum produksi. Produksi dijalankan setelah Anda menyetujui proof secara tertulis.",
      "Terdapat toleransi warna yang wajar antar-lot dan antar-media (layar vs hasil cetak) akibat karakter tinta dispersi dan serat kain.",
      "Toleransi susut kain standar pabrik ±2–3% dari panjang yang dipesan, serta toleransi dimensi sesuai karakter bahan.",
      "Perbedaan repeat motif akibat lebar kain dan penempatan pola wajib dikonfirmasi pada tahap proof.",
    ],
  },
  {
    heading: "Hak kekayaan intelektual artwork",
    bullets: [
      "Anda menjamin memiliki hak atau izin penuh atas artwork, logo, dan motif yang dikirimkan.",
      "Anda memberikan lisensi terbatas kepada kami untuk mereproduksi artwork semata-mata untuk memenuhi pesanan Anda.",
      "Kami tidak bertanggung jawab atas klaim pihak ketiga akibat artwork yang melanggar hak cipta, merek, atau hak lain.",
      "Kami dapat menyimpan file produksi untuk keperluan reorder dan audit mutu, dengan akses terbatas.",
    ],
  },
  {
    heading: "Pengiriman, risiko, dan klaim",
    bullets: [
      "Pengiriman menggunakan kargo khusus roll atau ekspedisi yang disepakati. Risiko berpindah sesuai syarat penyerahan (mis. FOB gudang) pada kontrak.",
      "Klaim kekurangan jumlah, kerusakan, atau ketidaksesuaian wajib disertai foto/video dan diajukan maksimal 3×24 jam setelah barang diterima.",
      "Klaim yang timbul dari penyimpanan atau penanganan yang tidak sesuai (terpapar panas/lembap, lipatan tajam) di luar tanggung jawab kami.",
    ],
  },
  {
    heading: "Pembatalan dan retur",
    bullets: [
      "Pembatalan sebelum produksi dimulai dapat dilakukan dengan pemberitahuan tertulis; biaya yang sudah timbul (desain, proof, material khusus) tetap ditagihkan.",
      "Pembatalan setelah produksi berjalan tidak dapat mengembalikan biaya material dan cetak yang telah dikerjakan.",
      "Retur hanya diproses untuk pesanan yang terbukti tidak sesuai spesifikasi yang disetujui, setelah verifikasi tim QC.",
    ],
  },
  {
    heading: "Force majeure",
    paragraphs: [
      "Kami tidak bertanggung jawab atas keterlambatan atau kegagalan akibat kejadian di luar kendali wajar, termasuk bencana alam, pemadaman listrik berkepanjangan, gangguan mesin utama, kerusuhan, kebijakan pemerintah, atau gangguan logistik nasional.",
    ],
  },
  {
    heading: "Batasan tanggung jawab",
    paragraphs: [
      "Sepanjang diizinkan hukum, tanggung jawab kami atas suatu pesanan dibatasi pada nilai pesanan tersebut. Kami tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kerugian reputasi.",
    ],
  },
  {
    heading: "Hukum yang berlaku dan sengketa",
    paragraphs: [
      "Ketentuan ini diatur oleh hukum Republik Indonesia. Perselisihan diselesaikan terlebih dahulu secara musyawarah; bila tidak tercapai, diselesaikan melalui pengadilan yang berwenang di Jakarta Utara.",
    ],
  },
  {
    heading: "Perubahan ketentuan dan kontak",
    paragraphs: [
      "Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Versi terbaru selalu tersedia di halaman ini.",
      "Pertanyaan: admin@texoraprima.com • WhatsApp +62 858-1064-6157 • Jl. Walang Baru VI Blok B1/2, Tugu Utara, Tanjung Priok, Jakarta Utara 14140.",
    ],
  },
];

export default function TermsPage() {
  const breadcrumb = [{ name: "Syarat & Ketentuan", path: "/terms" }];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumb),
    buildWebPageSchema({
      path: "/terms",
      name: "Syarat & Ketentuan — XoraMateria",
      description: DESCRIPTION,
      breadcrumb,
    }),
  ];

  return (
    <>
      <JsonLd schema={jsonLd} id="ld-terms" />
      <LegalDocument
        eyebrow="Legal & Ketentuan"
        title="Syarat & Ketentuan Layanan"
        intro="Ketentuan pemesanan kain sublimasi dan jasa cetak roll: penawaran, pembayaran, proofing, toleransi produksi, pengiriman, dan hak kekayaan intelektual."
        updatedAt="23 Oktober 2026"
        sections={SECTIONS}
      />
    </>
  );
}
