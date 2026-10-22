/**
 * Profil tim editorial & teknis.
 *
 * Dipakai untuk sinyal E-E-A-T (Experience, Expertise, Authoritativeness,
 * Trustworthiness): pembaca dan Google bisa melihat siapa yang menulis
 * panduan, apa keahliannya, dan bagaimana konten diverifikasi.
 *
 * Catatan: nama tim sengaja memakai nama divisi (bukan nama pribadi) agar
 * tetap akurat walaupun personel berganti. Penulis artikel disimpan pada
 * field `Article.author` dan dipetakan ke profil di bawah.
 */
export interface AuthorProfile {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Bidang keahlian yang ditampilkan sebagai chip. */
  expertise: string[];
  /** Pengalaman konkret yang mendasari konten. */
  experience: string;
}

export const AUTHORS: AuthorProfile[] = [
  {
    slug: "tim-tekstil",
    name: "Tim Tekstil XoraMateria",
    role: "Divisi Teknis & Produksi",
    bio: "Tim teknis yang menangani pemilihan serat, spesifikasi gramasi (GSM), anyaman, serta pengujian kain sebelum masuk lini cetak sublimasi. Menulis panduan berdasarkan data produksi harian dan hasil QC, bukan sekadar teori.",
    expertise: [
      "Spesifikasi kain poliester",
      "Gramasi (GSM) & anyaman",
      "Kontrol kualitas (QC)",
      "Toleransi susut kain",
    ],
    experience:
      "Terlibat langsung dalam pemeriksaan incoming material, kalibrasi mesin, dan evaluasi hasil cetak antar-lot di pabrik Jakarta Utara.",
  },
  {
    slug: "tim-desain-warna",
    name: "Tim Desain & Warna",
    role: "Pra-cetak & Color Management",
    bio: "Tim pra-cetak yang menyiapkan file, mengelola profil warna ICC, dan membuat proof digital sebelum produksi. Fokus pada konsistensi warna antara layar, proof, dan hasil akhir di kain.",
    expertise: [
      "Profil warna ICC",
      "Proofing digital",
      "Repeat motif & resolusi",
      "Kalender rotary 210°C",
    ],
    experience:
      "Menangani ribuan file artwork untuk brand sportswear, hijab, dan merchandise — termasuk revisi minor dan approval proof sebelum mesin berjalan.",
  },
  {
    slug: "tim-sales-b2b",
    name: "Tim Sales B2B",
    role: "Konsultasi Pengadaan & Termin",
    bio: "Tim yang mendampingi calon mitra sejak pemilihan kain, perhitungan kebutuhan meter, hingga penawaran harga bertingkat dan termin pembayaran untuk kontrak suplai rutin.",
    expertise: [
      "Harga bertingkat per volume",
      "Termin 30/60 hari",
      "Kontrak suplai B2B",
      "Estimasi kebutuhan produksi",
    ],
    experience:
      "Mendampingi brand garmen dan konveksi dalam menyusun spesifikasi pesanan, jadwal produksi, dan pengiriman kargo roll ke seluruh Indonesia.",
  },
];

/** Cari profil berdasarkan nama penulis di artikel; fallback ke tim teknis. */
export function getAuthorProfile(name?: string | null): AuthorProfile {
  const needle = String(name || "").trim().toLowerCase();
  if (needle) {
    const found = AUTHORS.find(
      (author) =>
        author.name.toLowerCase() === needle ||
        needle.includes(author.name.toLowerCase()) ||
        author.name.toLowerCase().includes(needle)
    );
    if (found) return found;
  }
  return AUTHORS[0];
}
