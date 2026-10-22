/**
 * Seed FAQ bawaan ke tabel cms_faq_items.
 *
 * Kenapa perlu: API /api/cms memakai DEFAULT_FAQS sebagai cadangan kalau
 * tabelnya kosong. ID bawaan ("default-1") bukan ID database, jadi admin
 * tidak bisa edit/hapus -> errornya "Record to delete does not exist".
 *
 * Setelah script ini, semua FAQ punya ID asli dan bisa dikelola normal.
 *
 * Jalankan: node scripts/seed-faqs.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_FAQS = [
  {
    question: "Berapa resolusi minimal file untuk sublimasi?",
    answer:
      "Kami menyarankan 150–300 DPI pada ukuran cetak sebenarnya. Visualizer akan memberi peringatan bila resolusi file di bawah ambang tersebut.",
    order: 1,
  },
  {
    question: "Bagaimana harga bertingkat dihitung?",
    answer:
      "Harga per meter turun sesuai total panjang pesanan per jenis kain. Tier yang berlaku langsung terlihat di kalkulator dan keranjang.",
    order: 2,
  },
  {
    question: "Apakah bisa proofing fisik sebelum produksi massal?",
    answer:
      "Bisa. Selain proofing digital, kami menyediakan cetak sampel 1 yard agar warna dapat dicek di bawah pencahayaan standar Anda.",
    order: 3,
  },
  {
    question: "Bagaimana pengiriman ke luar kota?",
    answer:
      "Melalui kargo spesialis roll (Dakota Cargo, JNE Trucking) atau armada sendiri untuk Bandung dan Jabodetabek. Gulungan dikemas plastik tebal dan karton pelindung.",
    order: 4,
  },
];

(async () => {
  const existing = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });

  if (existing.length > 0) {
    console.log(`Tabel FAQ sudah berisi ${existing.length} baris - tidak ada yang diubah.`);
    await prisma.$disconnect();
    return;
  }

  for (const f of DEFAULT_FAQS) {
    const row = await prisma.faqItem.create({
      data: { ...f, isActive: true },
    });
    console.log(`CREATE ${row.id} | ${row.question.slice(0, 50)}`);
  }

  const total = await prisma.faqItem.count();
  console.log(`\nSelesai: ${total} FAQ tersimpan di database.`);
  await prisma.$disconnect();
})();
