import { type SocialComment, SocialPlatform, CommentSentiment } from '@prisma/client';

export interface MockCommentInput {
  platform: SocialPlatform;
  commentId: string;
  username: string;
  message: string;
  timestamp?: Date;
}

export const MOCK_COMMENTS: MockCommentInput[] = [
  {
    platform: SocialPlatform.TIKTOK,
    commentId: 'cmt_tiktok_001',
    username: 'fashionlover_bali',
    message: 'Wah keren banget nih! Kainnya bagus untuk baju kaos',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    platform: SocialPlatform.TIKTOK,
    commentId: 'cmt_tiktok_002',
    username: 'supir_trucking',
    message: 'Kualitasnya standar gak? Aku butuh banyak untuk driver',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    platform: SocialPlatform.INSTAGRAM,
    commentId: 'cmt_ig_001',
    username: 'texoraofficial',
    message: 'Barang sampai sudah lama tidak bisa kami tracking ya?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    platform: SocialPlatform.INSTAGRAM,
    commentId: 'cmt_ig_002',
    username: 'suka_print_warna',
    message: 'Warna merahnya ngrengse! Mantap untuk kaos basket',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    platform: SocialPlatform.FACEBOOK,
    commentId: 'cmt_fb_001',
    username: 'Budi Santoso',
    message: 'Harga grosir untuk pesanan 1000 meter bisa nego gak?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    platform: SocialPlatform.FACEBOOK,
    commentId: 'cmt_fb_002',
    username: 'Rina Wijaya',
    message: 'Terima kasih banyak ya, orderan kami lancar',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
];

export function generateRandomDummyComments(count: number): MockCommentInput[] {
  const usernames = ['nasabah_jagoan', 'kreator_kain', 'print_online', 'grosir_cepat', 'supplier_nusantara', 'mitra_textil', 'dropship_murah', 'reseller_lokal'];
  const sampleMessages = [
    'Top markotop, kain bagus dan harga kompetitif!',
    'Barang diterima, kualitas memuaskan. Recommend!',
    'Bisa kirim ke Medan ga ya?',
    'Harga untuk 500 meter gimana?',
    'Lama kirimnya kok ya...',
    'Warna sesuai foto. Puas!',
    'Bisa custom ukuran gak?',
    'Kualitas standar, butuh yang premium',
  ];

  const platforms = [SocialPlatform.TIKTOK, SocialPlatform.INSTAGRAM, SocialPlatform.FACEBOOK];
  const result: MockCommentInput[] = [];

  for (let i = 0; i < count; i++) {
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    result.push({
      platform: randomPlatform,
      commentId: `dummy_${randomPlatform.toLowerCase()}_${Date.now()}_${i}`,
      username: randomUsername,
      message: randomMessage,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 6)),
    });
  }

  return result;
}

export async function insertMockComments(prismaClient: any, comments: MockCommentInput[] = MOCK_COMMENTS) {
  const results: SocialComment[] = [];

  for (const comment of comments) {
    try {
      const doc = await prismaClient.socialComment.upsert({
        where: { commentId: comment.commentId },
        update: {
          message: comment.message,
          username: comment.username,
          timestamp: comment.timestamp ?? new Date(),
        },
        create: {
          platform: comment.platform,
          commentId: comment.commentId,
          username: comment.username,
          message: comment.message,
          timestamp: comment.timestamp ?? new Date(),
        },
      });
      results.push(doc);
    } catch (err) {
      console.warn(`[Mock Insert Failed] ${comment.commentId}:`, err);
    }
  }

  return results;
}

export const SENTIMENT_COLORS: Record<CommentSentiment, string> = {
  [CommentSentiment.POSITIVE]: 'bg-green-100 text-green-800',
  [CommentSentiment.NEUTRAL]: 'bg-yellow-100 text-yellow-800',
  [CommentSentiment.NEGATIVE]: 'bg-red-100 text-red-800',
};
