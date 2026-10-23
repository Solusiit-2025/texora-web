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

const TITLE = "Kebijakan Privasi — Perlindungan Data Pelanggan | XoraMateria";
const DESCRIPTION =
  "Kebijakan Privasi XoraMateria: data apa yang dikumpulkan, tujuan pemrosesan, dasar hukum, masa penyimpanan, dan hak Anda sebagai pelanggan B2B maupun pengunjung website.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isPrimary = locale === "id";
  return buildPageMetadata({
    locale,
    path: "/privacy",
    // Halaman legal hanya tersedia dalam Bahasa Indonesia. Versi /en/privacy
    // dsb. tidak perlu diindeks agar tidak menjadi duplikat.
    canonical: "/privacy",
    noindex: !isPrimary,
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
      "kebijakan privasi xoramateria",
      "perlindungan data pelanggan",
      "privasi website tekstil",
    ],
    schemaType: "organization",
  });
}

const SECTIONS: LegalSection[] = [
  {
    heading: "Tentang dokumen ini",
    paragraphs: [
      "Kebijakan Privasi ini menjelaskan bagaimana XoraMateria (PT. Texora Visi Prima) mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi pengunjung website, calon pelanggan, serta mitra B2B.",
      "Dokumen ini berlaku untuk situs texora.co.id, portal mitra, formulir permintaan penawaran, dan kanal komunikasi resmi XoraMateria (email dan WhatsApp).",
    ],
  },
  {
    heading: "Data yang kami kumpulkan",
    paragraphs: [
      "Kami hanya mengumpulkan data yang diperlukan untuk menjawab pertanyaan, menyiapkan penawaran, dan memproses pesanan:",
    ],
    bullets: [
      "Identitas dan kontak: nama, nama perusahaan, jabatan, email, nomor telepon/WhatsApp.",
      "Data bisnis: alamat penagihan dan pengiriman, NPWP (untuk faktur pajak), serta preferensi pembayaran.",
      "Konten pesanan: jenis kain, varian GSM, jumlah meter, catatan produksi, dan file desain/artwork.",
      "Data teknis: alamat IP, jenis perangkat, browser, halaman yang dikunjungi, dan cookie analitik.",
    ],
  },
  {
    heading: "Cara data dikumpulkan",
    bullets: [
      "Formulir di website: kontak, permintaan penawaran (RFQ), pendaftaran mitra, dan checkout.",
      "Komunikasi langsung: email, WhatsApp, atau pertemuan dengan tim sales.",
      "Cookie dan teknologi serupa untuk mengingat preferensi bahasa/tema serta mengukur performa halaman.",
      "Pihak ketiga yang bekerja sama dengan kami, seperti penyedia logistik atau payment gateway, sebatas yang diperlukan untuk pesanan Anda.",
    ],
  },
  {
    heading: "Tujuan dan dasar pemrosesan",
    paragraphs: [
      "Data diproses untuk: (a) menjawab pertanyaan dan menyiapkan penawaran; (b) memproses pesanan, produksi, dan pengiriman; (c) menerbitkan invoice serta memenuhi kewajiban perpajakan; (d) meningkatkan kualitas layanan dan keamanan website; dan (e) mengirim informasi produk hanya bila Anda menyetujuinya.",
      "Dasar pemrosesan adalah pelaksanaan kontrak, kewajiban hukum, kepentingan sah yang wajar (mis. pencegahan penyalahgunaan), dan persetujuan Anda untuk komunikasi pemasaran.",
    ],
  },
  {
    heading: "Berbagi data dengan pihak ketiga",
    paragraphs: [
      "Kami tidak menjual data pribadi. Data hanya dibagikan kepada pihak yang membantu operasional dan terikat kewajiban kerahasiaan:",
    ],
    bullets: [
      "Jasa pengiriman/kargo dan mitra logistik untuk pengiriman roll kain.",
      "Penyedia payment gateway dan bank untuk pemrosesan pembayaran.",
      "Penyedia hosting, penyimpanan file, email, dan WhatsApp gateway.",
      "Konsultan pajak/akuntan bila diwajibkan oleh peraturan perpajakan Indonesia.",
    ],
  },
  {
    heading: "Penyimpanan dan keamanan",
    paragraphs: [
      "Data disimpan selama hubungan bisnis berlangsung dan selama diperlukan untuk memenuhi kewajiban hukum (mis. dokumen pajak). Setelah tidak diperlukan, data dihapus atau dianonimkan.",
      "Kami menerapkan kontrol akses berbasis peran, enkripsi saat transmisi (HTTPS/TLS), pencatatan aktivitas admin (audit log), serta pencadangan berkala untuk mengurangi risiko kehilangan data.",
    ],
  },
  {
    heading: "Hak Anda",
    paragraphs: [
      "Anda berhak meminta akses, koreksi, atau penghapusan data pribadi, menarik persetujuan komunikasi pemasaran, serta meminta informasi mengenai pemrosesan data Anda.",
      "Permintaan dapat dikirim ke alamat email resmi kami. Kami akan memverifikasi identitas pemohon sebelum memproses permintaan agar data tidak disalahgunakan.",
    ],
  },
  {
    heading: "Cookie dan analitik",
    paragraphs: [
      "Cookie digunakan untuk mengingat preferensi bahasa dan tema, menjaga sesi login portal, serta mengukur performa halaman melalui alat analitik.",
      "Anda dapat menonaktifkan cookie melalui pengaturan browser. Beberapa fitur (mis. keranjang atau preferensi bahasa) mungkin tidak berjalan optimal tanpa cookie.",
    ],
  },
  {
    heading: "Perubahan kebijakan",
    paragraphs: [
      "Kebijakan ini dapat diperbarui seiring perubahan layanan atau peraturan. Versi terbaru selalu ditampilkan di halaman ini beserta tanggal pembaruan.",
    ],
  },
  {
    heading: "Kontak pengendali data",
    paragraphs: [
      "XoraMateria (PT. Texora Visi Prima) — Jl. Walang Baru VI Blok B1/2, RT 04/RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara 14140.",
      "Email: admin@texoraprima.com • WhatsApp: +62 858-1064-6157 • Jam kerja: Senin–Sabtu, 08.00–17.00 WIB.",
    ],
  },
];

export default function PrivacyPage() {
  const breadcrumb = [{ name: "Kebijakan Privasi", path: "/privacy" }];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumb),
    buildWebPageSchema({
      path: "/privacy",
      name: "Kebijakan Privasi — XoraMateria",
      description: DESCRIPTION,
      breadcrumb,
    }),
  ];

  return (
    <>
      <JsonLd schema={jsonLd} id="ld-privacy" />
      <LegalDocument
        eyebrow="Legal & Privasi"
        title="Kebijakan Privasi"
        intro="Kami menghargai kepercayaan Anda. Dokumen ini menjelaskan data apa yang kami kumpulkan, mengapa, dan bagaimana Anda dapat mengendalikannya."
        updatedAt="23 Oktober 2026"
        sections={SECTIONS}
      />
    </>
  );
}
