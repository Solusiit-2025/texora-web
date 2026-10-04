// @ts-nocheck
/**
 * Seed script - Insert 300 mock social comments into database.
 * Data berasal dari SUMBER TUNGGAL: src/lib/mock/social-seed-data.ts
 * (identik dengan fallback statis dashboard saat DB offline).
 * Usage: npx tsx scripts/seed-social-300.ts
 */
import { PrismaClient } from '@prisma/client';
import { getStaticMockComments } from '../src/lib/mock/social-seed-data';

const prisma = new PrismaClient();

async function main() {
  const comments = getStaticMockComments();
  console.log(`Seeding ${comments.length} mock social comments (static dataset)...`);

  let totalInserted = 0;

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    try {
      await prisma.socialComment.upsert({
        where: { commentId: c.commentId },
        update: {
          platform: c.platform,
          postId: c.postId,
          username: c.username,
          message: c.message,
          timestamp: new Date(c.timestamp),
          sentiment: c.sentiment,
          aiReply: c.aiReply,
        },
        create: {
          platform: c.platform,
          postId: c.postId,
          commentId: c.commentId,
          username: c.username,
          message: c.message,
          timestamp: new Date(c.timestamp),
          sentiment: c.sentiment,
          aiReply: c.aiReply,
        },
      });
      totalInserted++;
    } catch (err) {
      console.warn(`Failed to insert ${c.commentId}:`, err instanceof Error ? err.message : err);
    }

    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${comments.length}`);
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

  console.log(`\n✅ Seed complete! Inserted/updated ${totalInserted} of ${comments.length}. Total in DB: ${total}`);
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

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
