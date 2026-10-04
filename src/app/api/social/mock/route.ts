import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MOCK_COMMENTS, generateRandomDummyComments, insertMockComments } from '@/lib/mock/social-mock';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seed = url.searchParams.get('seed') === 'true';
  const countParam = url.searchParams.get('count');
  const random = url.searchParams.get('random');

  if (seed) {
    const results = await insertMockComments(prisma, MOCK_COMMENTS);
    return NextResponse.json({ seeded: results.length, comments: results });
  }

  if (countParam) {
    const count = parseInt(countParam);
    const dummyComments = generateRandomDummyComments(count);
    const results = await insertMockComments(prisma, dummyComments);
    return NextResponse.json({ inserted: results.length, comments: results });
  }

  if (random === 'true') {
    const dummyComments = generateRandomDummyComments(10);
    const results = await insertMockComments(prisma, dummyComments);
    return NextResponse.json({ inserted: results.length, comments: results });
  }

  const comments = await prisma.socialComment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ comments });
}
