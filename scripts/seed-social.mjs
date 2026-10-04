/**
 * Seed script - Insert mock social comments directly into database
 * Usage: node scripts/seed-social.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockComments = [
  {
    platform: 'TIKTOK',
    postId: 'video_1234567890',
    commentId: 'cmt_tiktok_001',
    username: 'fashionlover_bali',
    message: 'Wah keren banget nih! Kainnya bagus untuk baju kaos',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    sentiment: 'POSITIVE',
    aiReply: 'Terima kasih banyak! Kami senang kainnya cocok untuk kaos. Silakan cek katalog lengkap di website kami ya.',
  },
  {
    platform: 'TIKTOK',
    postId: 'video_1234567891',
    commentId: 'cmt_tiktok_002',
    username: 'supir_trucking',
    message: 'Kualitasnya standar gak? Aku butuh banyak untuk driver',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    sentiment: 'NEUTRAL',
    aiReply: 'Hai! Kami menyediakan kain berkualitas menengah untuk kebutuhan komersial. Bisa kami kirimkan spesifikasi lengkap?',
  },
  {
    platform: 'INSTAGRAM',
    postId: 'ig_post_789012',
    commentId: 'cmt_ig_001',
    username: 'texoraofficial',
    message: 'Barang sampai sudah lama tidak bisa kami tracking ya?',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    sentiment: 'NEGATIVE',
    aiReply: 'Mohon maaf atas ketidaknyamanannya. Kami akan cek langsung ke tim logistik kami dan hubungi via DM dengan info terbaru.',
  },
  {
    platform: 'INSTAGRAM',
    postId: 'ig_post_789013',
    commentId: 'cmt_ig_002',
    username: 'suka_print_warna',
    message: 'Warna merahnya ngrengse! Mantap untuk kaos basket',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    sentiment: 'POSITIVE',
    aiReply: 'Senang warna merahnya cocok untuk kaos basket! Kami juga punya warna lain yang bisa disesuaikan dengan kebutuhan tim Anda.',
  },
  {
    platform: 'FACEBOOK',
    postId: 'fb_post_456789',
    commentId: 'cmt_fb_001',
    username: 'Budi Santoso',
    message: 'Harga grosir untuk pesanan 1000 meter bisa nego gak?',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    sentiment: 'NEUTRAL',
    aiReply: 'Hai Pak Budi! Untuk pesanan 1000 meter, kami bisa diskusi harga grosir langsung via DM. Tim sales kami siap membantu.',
  },
  {
    platform: 'FACEBOOK',
    postId: 'fb_post_456790',
    commentId: 'cmt_fb_002',
    username: 'Rina Wijaya',
    message: 'Terima kasih banyak ya, orderan kami lancar',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    sentiment: 'POSITIVE',
    aiReply: 'Sama-sama, Ibu Rina! Senang orderannya lancar. Semoga hasil printnya memuaskan untuk bisnis Ibu.',
  },
  {
    platform: 'TIKTOK',
    postId: 'video_1234567892',
    commentId: 'cmt_tiktok_003',
    username: 'kreator_kain',
    message: 'Kualitas tetep standar, butuh yang premium untuk event nanti',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    sentiment: 'NEUTRAL',
    aiReply: 'Kami paham kebutuhan kualitas premium! Silakan hubungi tim sales kami untuk opsi kain premium dan harga khusus event.',
  },
  {
    platform: 'INSTAGRAM',
    postId: 'ig_post_789014',
    commentId: 'cmt_ig_003',
    username: 'dropship_murah',
    message: 'Produk bagus, pengen order grosir buat reseller',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    sentiment: 'POSITIVE',
    aiReply: 'Terima kasih! Untuk program reseller, kami punya diskon grosir khusus. Silakan DM kami untuk info lengkapnya.',
  },
];

async function main() {
  console.log('Seeding mock social comments...');
  
  for (const comment of mockComments) {
    const existing = await prisma.socialComment.findUnique({
      where: { commentId: comment.commentId },
    });

    if (existing) {
      await prisma.socialComment.update({
        where: { commentId: comment.commentId },
        data: {
          message: comment.message,
          username: comment.username,
          timestamp: comment.timestamp,
          sentiment: comment.sentiment,
          aiReply: comment.aiReply,
        },
      });
      console.log(`Updated: ${comment.commentId}`);
    } else {
      await prisma.socialComment.create({ data: comment });
      console.log(`Created: ${comment.commentId}`);
    }
  }

  const total = await prisma.socialComment.count();
  const sentimentCounts = await prisma.socialComment.groupBy({
    by: ['sentiment'],
    _count: true,
  });

  console.log(`\n✅ Seed complete! Total comments: ${total}`);
  console.log('Sentiment breakdown:');
  sentimentCounts.forEach((g) => {
    console.log(`  ${g.sentiment}: ${g._count}`);
  });

  process.exit(0);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
