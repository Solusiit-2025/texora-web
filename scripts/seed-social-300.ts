// @ts-nocheck
/**
 * Seed script - Insert 300 mock social comments into database
 * Usage: npx tsx scripts/seed-social-300.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'FACEBOOK'];
const SENTIMENTS = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
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

function getRandomMessage(sentiment) {
  switch (sentiment) {
    case 'POSITIVE':
      return POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
    case 'NEGATIVE':
      return NEGATIVE_MESSAGES[Math.floor(Math.random() * NEGATIVE_MESSAGES.length)];
    case 'NEUTRAL':
    default:
      return NEUTRAL_MESSAGES[Math.floor(Math.random() * NEUTRAL_MESSAGES.length)];
  }
}

function weightedRandom(items, weights) {
  let i;
  for (i = 0; i < weights.length; i++) {
    if (Math.random() < weights[i]) return items[i];
  }
  return items[i - 1];
}

async function main() {
  console.log('Seeding 300 mock social comments...');

  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < 300; i++) {
    const platform = weightedRandom(PLATFORMS, PLATFORM_WEIGHTS);
    const sentiment = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];
    const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
    const message = getRandomMessage(sentiment);
    const postId = `${platform.toLowerCase()}_${Math.floor(Math.random() * 1000000)}`;
    const commentId = `cmt_${platform.toLowerCase()}_${i + 1}`;
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));

    try {
      await prisma.socialComment.upsert({
        where: { commentId },
        update: {
          platform,
          postId,
          username,
          message,
          timestamp,
          sentiment,
          aiReply: generateAiReply(sentiment, username),
        },
        create: {
          platform,
          postId,
          commentId,
          username,
          message,
          timestamp,
          sentiment,
          aiReply: generateAiReply(sentiment, username),
        },
      });
      totalInserted++;
    } catch (err) {
      if (totalInserted % 50 === 0 || err instanceof Error && err.message.includes('duplicate')) {
        // Ignore duplicates
      } else {
        console.warn(`Failed to insert ${commentId}:`, err instanceof Error ? err.message : err);
      }
    }

    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(`Progress: ${i + 1}/300`);
    }
  }

  const total = await prisma.socialComment.count();
  const sentimentCounts = await prisma.socialComment.groupBy({
    by: ['sentiment'],
    _count: true,
  });
  const platformCounts = await prisma.socialComment.groupBy({
    by: ['platform'],
    _count: true,
  });

  console.log(`\n✅ Seed complete! Inserted/updated ${totalInserted} of 300. Total in DB: ${total}`);
  console.log('\nSentiment breakdown:');
  sentimentCounts.forEach((g) => {
    console.log(`  ${g.sentiment}: ${g._count}`);
  });
  console.log('\nPlatform breakdown:');
  platformCounts.forEach((g) => {
    console.log(`  ${g.platform}: ${g._count}`);
  });

  process.exit(0);
}

function generateAiReply(sentiment: string, username: string): string {
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

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
