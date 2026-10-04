import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getStaticMockComments } from '@/lib/mock/social-seed-data';

const prisma = new PrismaClient();

type TrendRow = {
  date: string;
  POSITIVE: number;
  NEUTRAL: number;
  NEGATIVE: number;
  total: number;
};

function buildDailyTrend(
  rows: { timestamp: Date | string; sentiment: string | null }[],
): TrendRow[] {
  const days: (TrendRow & { key: string })[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    days.push({ date: label, key, POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, total: 0 });
  }
  const dayMap = new Map(days.map((d) => [d.key, d]));
  for (const r of rows) {
    const key = new Date(r.timestamp).toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (bucket && r.sentiment && r.sentiment in bucket) {
      (bucket as any)[r.sentiment] += 1;
      bucket.total += 1;
    }
  }
  return days.map(({ key, ...rest }) => rest);
}

function aggregate(rows: { platform: string; sentiment: string | null }[]) {
  const sentimentCount: Record<string, number> = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  const platformCount: Record<string, number> = {};
  const platformSentiment: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    if (r.sentiment && r.sentiment in sentimentCount) sentimentCount[r.sentiment] += 1;
    platformCount[r.platform] = (platformCount[r.platform] ?? 0) + 1;
    if (!platformSentiment[r.platform]) {
      platformSentiment[r.platform] = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
    }
    if (r.sentiment && r.sentiment in platformSentiment[r.platform]) {
      platformSentiment[r.platform][r.sentiment] += 1;
    }
  }
  return { sentimentCount, platformCount, platformSentiment };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get('platform');
  const sentiment = url.searchParams.get('sentiment');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const search = url.searchParams.get('search');
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 100;

  // ---- 1) Coba database dulu (mode live) ----
  try {
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

    const [comments, total] = await Promise.all([
      prisma.socialComment.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
      prisma.socialComment.count({ where }),
    ]);

    const allRows = await prisma.socialComment.findMany({
      select: { platform: true, sentiment: true, timestamp: true },
    });
    const { sentimentCount, platformCount, platformSentiment } = aggregate(allRows);
    const dailyTrend = buildDailyTrend(allRows);

    return NextResponse.json({
      comments, total, sentimentCount, platformCount, platformSentiment, dailyTrend,
      mock: false,
    });
  } catch (err) {
    console.warn('[Social API] DB tidak reachable, fallback ke data statis:', (err as Error)?.message);
  }

  // ---- 2) Fallback: dataset statis identik seed (mode mockup/Netlify tanpa DB) ----
  const all = getStaticMockComments();
  const q = (search ?? '').toLowerCase();

  const filtered = all.filter((c) => {
    if (platform && platform !== 'ALL' && c.platform !== platform.toUpperCase()) return false;
    if (sentiment && sentiment !== 'ALL' && c.sentiment !== sentiment.toUpperCase()) return false;
    if (from && new Date(c.timestamp) < new Date(from)) return false;
    if (to && new Date(c.timestamp) > new Date(to)) return false;
    if (q && !c.message.toLowerCase().includes(q) && !c.username.toLowerCase().includes(q)) return false;
    return true;
  });

  const { sentimentCount, platformCount, platformSentiment } = aggregate(all);
  const dailyTrend = buildDailyTrend(all);

  return NextResponse.json({
    comments: filtered.slice(0, limit),
    total: filtered.length,
    sentimentCount,
    platformCount,
    platformSentiment,
    dailyTrend,
    mock: true,
  });
}
