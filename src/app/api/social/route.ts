import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get('platform');
  const sentiment = url.searchParams.get('sentiment');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const search = url.searchParams.get('search');
  const limitParam = url.searchParams.get('limit');

  const where: any = {};
  if (platform && platform !== 'ALL') where.platform = platform.toUpperCase();
  if (sentiment && sentiment !== 'ALL') where.sentiment = sentiment.toUpperCase();
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }
  if (search) {
    where.OR = [
      { message: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ];
  }

  const limit = limitParam ? parseInt(limitParam, 10) : 100;

  const [comments, total] = await Promise.all([
    prisma.socialComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.socialComment.count({ where }),
  ]);

  // Global stats (tanpa filter, untuk ringkasan)
  const allComments = await prisma.socialComment.groupBy({
    by: ['sentiment'],
    _count: true,
  });
  const platformStats = await prisma.socialComment.groupBy({
    by: ['platform'],
    _count: true,
  });

  const sentimentCount: Record<string, number> = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
  };
  for (const g of allComments) {
    if (g.sentiment) sentimentCount[g.sentiment] = g._count;
  }

  const platformCount: Record<string, number> = {};
  for (const g of platformStats) {
    platformCount[g.platform] = g._count;
  }

  // Matrix platform x sentiment (global, untuk stacked bar)
  const matrixRaw = await prisma.socialComment.groupBy({
    by: ['platform', 'sentiment'],
    _count: true,
  });
  const platformSentiment: Record<string, Record<string, number>> = {};
  for (const g of matrixRaw) {
    if (!platformSentiment[g.platform]) {
      platformSentiment[g.platform] = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
    }
    if (g.sentiment) platformSentiment[g.platform][g.sentiment] = g._count;
  }

  // Tren harian 14 hari terakhir (global, untuk line/area chart)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const recent = await prisma.socialComment.findMany({
    where: { timestamp: { gte: fourteenDaysAgo } },
    select: { timestamp: true, sentiment: true },
  });

  const days: { date: string; POSITIVE: number; NEUTRAL: number; NEGATIVE: number; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    days.push({ date: label, key, POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, total: 0 } as any);
  }
  const dayMap = new Map(days.map((d: any) => [d.key, d]));
  for (const r of recent) {
    const key = new Date(r.timestamp).toISOString().slice(0, 10);
    const bucket = dayMap.get(key) as any;
    if (bucket && r.sentiment) {
      bucket[r.sentiment] += 1;
      bucket.total += 1;
    }
  }
  const dailyTrend = days.map(({ key, ...rest }: any) => rest);

  return NextResponse.json({
    comments,
    total,
    sentimentCount,
    platformCount,
    platformSentiment,
    dailyTrend,
  });
}
