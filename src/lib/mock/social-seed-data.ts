// Static mock dataset — SUMBER TUNGGAL data demo social media.
// Isi (username, pesan, bobot platform) IDENTIK dengan scripts/seed-social-300.ts.
// Modul murni: tanpa Prisma / DB / API key — aman dipakai di API route,
// seed script, maupun build Netlify.
//
// Generator deterministik (seeded RNG): 300 komentar yang dihasilkan
// SELALU SAMA di semua environment (lokal, Netlify, seed script).

export type StaticSocialComment = {
  id: string;
  platform: 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK';
  postId: string;
  commentId: string;
  username: string;
  message: string;
  timestamp: string; // ISO string
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  aiReply: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export const STATIC_SEED = 42;
export const STATIC_COUNT = 300;

const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'FACEBOOK'] as const;
const SENTIMENTS = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const;
const PLATFORM_WEIGHTS = [0.4, 0.35, 0.25];

const USERNAMES = [
  'fashionlover_bali', 'supir_trucking', 'texoraofficial', 'suka_print_warna',
  'Budi Santoso', 'Rina Wijaya', 'kreator_kain', 'dropship_murah',
  'reseller_lokal', 'mitra_textil', 'supplier_nusantara', 'grosir_cepat',
  'print_online', 'kain_premium', 'toko_kaos', 'baju_gym',
  'fashion_jakarta', 'kreatif_23', 'supplier_kain', 'reseller_bandung',
  'dropship_jakarta', 'wholesale_tex', 'kain_sublim', 'kaos_cool',
  'brand_owner', 'designer_muda', 'print_hub', 'kain_murah',
  'grosir_kain', 'supplier_jaya', 'texora_reseller', 'fashionista89',
  'kain_cantik', 'print_cepat', 'supplier_tetap', 'dropship_sukses',
  'reseller_top', 'mitra_baik', 'klien_loyal', 'pelanggan_setia',
  'toko_baru', 'brand_baru', 'startup_mode', 'UMKM_kita',
];

const POSITIVE_MESSAGES = [
  'Produk bagus banget, puas banget sama kualitasnya',
  'Kainnya enak dipakai, recommend banget!',
  'Top markotop, kualitas memuaskan!',
  'Barang diterima dengan baik, packing rapi.',
  'Harga kompetitif dan kualitas bagus, mantap!',
  'Orderan lancar, pengiriman cepat. Terima kasih!',
  'Warna sesuai deskripsi, puas!',
  'Kain premium untuk event, tim kami senang.',
  'Produk laris, bisa reorder lagi ya?',
  'Terima kasih banyak ya, orderan kami lancar.',
  'Bagus untuk kaos basket, baju gym, dan event kantor.',
  'Senang hasilnya, pengen order lagi.',
  'Pelayanannya baik, harga kompetitif. Mau belanja lagi!',
  'Kainnya tebal dan nyaman dipakai, cocok untuk kegiatan luar ruangan.',
  'Produk sesuai dengan video, mantap!',
  'Orderan cepat, customer service responsif.',
  'Warna merahnya ngrengse! Mantap untuk kaos basket',
  'Kain bagus untuk baju sekolah dan seragam.',
  'Kami puas, bisnis kami lancar berkat produk ini.',
  'Produk laris di toko kami, terus restock ya!',
  'Kualitas premium untuk brand kami, recommended!',
  'Senang bisa belanja di sini, barangnya selalu bagus.',
  'Kainnya rajut enak, cocok untuk baju santai.',
  'Produk ini jadi favorit pelanggan kami.',
  'Orderan kami lancar, pengiriman sesuai jadwal.',
];

const NEGATIVE_MESSAGES = [
  'Lama kirimnya kok ya...',
  'Kualitasnya standar gak? Kok ada beberapa yang rusak.',
  'Barang yang diterima agak berbeda dengan deskripsi.',
  'Harga terlalu mahal untuk kualitas yang didapat.',
  'Barang sampai sudah lama tidak bisa kami tracking ya?',
  'Beberapa sambungan kain ada yang longgar.',
  'Warna lebih pudar dari foto di katalog.',
  ' Packing lama, hampirnya kami cancel order.',
  'Butuh banyak perbaikan, barang agak rusak di tepi.',
  'Pesanan kami tertarik, ada perubahan harga?',
  'Kami dapat komplain dari pelanggan soal kualitas.',
  'Barang kurang tebal dari yang diharapkan, refund gak?',
  'Orderan kemarin msh belum sampai, lama banget.',
  'Produk agak berbeda dari yang kami lihat di video.',
  'Butuh klarifikasi soal ukuran, agak membingungkan.',
  'Barang agak rusak, bisa ganti gak ya?',
];

const NEUTRAL_MESSAGES = [
  'Kualitasnya standar gak? Aku butuh banyak untuk driver',
  'Harga grosir untuk pesanan 1000 meter bisa nego gak?',
  'Bisa kirim ke Medan ga ya?',
  'Apakah kain ini tersedia dalam warna lain?',
  'Berapa lama proses produksinya ya?',
  'Ada diskon untuk order grosir?',
  'Bisa kirim invoice lengkap ga ya?',
  'Produk ini cocok untuk kegiatan apa ya?',
  'Berapa harga untuk 100 meter?',
  'Apakah ada garansi atas produk ini?',
  'Bisa kami pesan contoh dulu?',
  'Berapa minimal ordernya?',
  'Apakah kain ini tahan lama?',
  'Bagaimana cara perawatan kain ini?',
  'Apakah kami bisa tracking order kami?',
  'Berapa biaya kirim ke luar kota?',
  'Apakah kain ini eco-friendly?',
  'Bisa kirimkan spesifikasi lengkap ga?',
  'Apakah kami bisa custom ukurannya?',
  'Produk ini untuk usaha kami, butuh grosir.',
  'Berapa stock tersedia ya?',
  'Bagaimana cara pembayarannya?',
  'Apakah bisa COD?',
  'Produk ini bagus, mau tanya soal harga.',
  'Butuh kain premium untuk event, info?',
];

// Seeded RNG (mulberry32) — deterministik, hasil selalu sama per seed.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mockAiReply(sentiment: string, username: string): string {
  switch (sentiment) {
    case 'POSITIVE':
      return `Terima kasih ${username}! Kami senang kualitasnya memuaskan. Silakan cek katalog lengkap di website kami ya.`;
    case 'NEGATIVE':
      return `Mohon maaf atas ketidaknyamanannya ${username}. Kami akan segera menindaklanjuti via DM untuk solusi terbaik.`;
    case 'NEUTRAL':
    default:
      return `Hai ${username}! Terima kasih atas pertanyaannya. Silakan DM kami untuk info lebih detail.`;
  }
}

export function generateStaticMockComments(
  count: number = STATIC_COUNT,
  seed: number = STATIC_SEED,
): StaticSocialComment[] {
  const rand = mulberry32(seed);
  // Dibulatkan ke jam — dataset byte-identik dalam jam yang sama,
  // tren 14 hari tetap valid.
  const now = Math.floor(Date.now() / 3600000) * 3600000;
  const nowIso = new Date(now).toISOString();
  const result: StaticSocialComment[] = [];

  for (let i = 0; i < count; i++) {
    // Weighted platform pick (bobot sama dengan seed script)
    let platform = PLATFORMS[PLATFORMS.length - 1];
    for (let w = 0; w < PLATFORM_WEIGHTS.length; w++) {
      if (rand() < PLATFORM_WEIGHTS[w]) {
        platform = PLATFORMS[w];
        break;
      }
    }

    const sentiment = SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)];
    const username = USERNAMES[Math.floor(rand() * USERNAMES.length)];
    const pool =
      sentiment === 'POSITIVE'
        ? POSITIVE_MESSAGES
        : sentiment === 'NEGATIVE'
          ? NEGATIVE_MESSAGES
          : NEUTRAL_MESSAGES;
    const message = pool[Math.floor(rand() * pool.length)];
    const timestamp = new Date(
      now - Math.floor(rand() * 14 * 24 * 60 * 60 * 1000),
    ).toISOString();

    result.push({
      id: `mock-${i + 1}`,
      platform,
      postId: `${platform.toLowerCase()}_${Math.floor(rand() * 1000000)}`,
      commentId: `cmt_${platform.toLowerCase()}_${i + 1}`,
      username,
      message,
      timestamp,
      sentiment,
      aiReply: mockAiReply(sentiment, username),
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // Urut terbaru dulu (seperti orderBy createdAt desc di API)
  result.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  return result;
}

// Cache per-proses — dataset identik untuk semua request.
let cache: StaticSocialComment[] | null = null;

export function getStaticMockComments(): StaticSocialComment[] {
  if (!cache) cache = generateStaticMockComments(STATIC_COUNT, STATIC_SEED);
  return cache;
}
