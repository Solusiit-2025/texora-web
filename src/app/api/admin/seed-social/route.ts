import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateStaticMockComments, STATIC_COUNT, STATIC_SEED } from '@/lib/mock/social-seed-data';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { SYSTEM_ADMIN_ROLE } from '@/lib/rbac/authorize';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const prisma = new PrismaClient();

/**
 * Seed data demo komentar sosial.
 *
 * SEBELUMNYA: `GET ?secret=<NEXTAUTH_SECRET>` dengan fallback hardcoded
 * ('texora-seed-2026') — secret yang bocor lewat repo bisa dipakai siapa pun
 * untuk menimpa data produksi, dan secret di URL tercatat di access log.
 *
 * SEKARANG:
 *  - hanya POST (bukan GET yang mengubah data),
 *  - wajib sesi ADMINISTRATOR, ATAU header `x-seed-secret` yang sama dengan
 *    `SEED_SECRET` di env (tanpa nilai default).
 */
async function isAuthorized(req: Request): Promise<boolean> {
  const seedSecret = process.env.SEED_SECRET?.trim();
  const headerSecret = req.headers.get('x-seed-secret')?.trim();
  if (seedSecret && headerSecret && headerSecret === seedSecret) return true;

  const user = await getAuthenticatedUser();
  return user?.role === SYSTEM_ADMIN_ROLE;
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json(
      { error: 'Unauthorized. Login sebagai Administrator atau kirim header x-seed-secret.' },
      { status: 401 },
    );
  }

  try {
    // Generate FRESH setiap dipanggil (pakai jam server sekarang),
    // bukan dari cache — jadi rentang selalu sampai hari ini.
    const comments = generateStaticMockComments(STATIC_COUNT, STATIC_SEED);

    // Jamin ada data hari ini: timpa 30 item pertama agar tersebar
    // dalam 48 jam terakhir sampai jam sekarang.
    const nowMs = Date.now();
    for (let i = 0; i < Math.min(30, comments.length); i++) {
      const hoursAgo = (i * 48) / 30; // 0 .. 48 jam ke belakang
      const ts = new Date(nowMs - hoursAgo * 3600 * 1000);
      comments[i].timestamp = ts.toISOString();
    }
    // Urutkan ulang terbaru dulu setelah override
    comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    let inserted = 0;
    const errors: string[] = [];

    for (const c of comments) {
      try {
        await prisma.socialComment.upsert({
          where: { commentId: c.commentId },
          update: {
            platform: c.platform as any,
            postId: c.postId,
            username: c.username,
            message: c.message,
            timestamp: new Date(c.timestamp),
            sentiment: c.sentiment as any,
            aiReply: c.aiReply,
          },
          create: {
            platform: c.platform as any,
            postId: c.postId,
            commentId: c.commentId,
            username: c.username,
            message: c.message,
            timestamp: new Date(c.timestamp),
            sentiment: c.sentiment as any,
            aiReply: c.aiReply,
          },
        });
        inserted++;
      } catch (e: any) {
        errors.push(`${c.commentId}: ${e?.message || 'gagal'}`);
      }
    }

    const total = await prisma.socialComment.count();
    const newest = await prisma.socialComment.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return NextResponse.json({
      success: true,
      inserted,
      sourceTotal: comments.length,
      totalInDb: total,
      newestTimestamp: newest?.timestamp ?? null,
      serverNow: new Date().toISOString(),
      errors: errors.slice(0, 10),
      next: 'Cek /api/social?limit=1 (total harus 300, mock:false), lalu refresh /portal/social-media',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Seed gagal' },
      { status: 500 },
    );
  }
}
