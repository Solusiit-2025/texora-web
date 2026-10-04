import { type NextRequest, NextResponse } from 'next/server';
import { processNewSocialComment, verifyTikTokSignature } from '@/services/social/social.service';

export async function POST(req: NextRequest) {
  const isValid = await verifyTikTokSignature(req);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === 'comment') {
    await processNewSocialComment({
      platform: 'TIKTOK',
      postId: body.video_id,
      commentId: body.comment_id,
      username: body.author?.nickname || 'unknown',
      message: body.text || '',
      timestamp: body.create_time ? new Date(body.create_time * 1000) : undefined,
    });
  }

  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode');
  const challenge = req.nextUrl.searchParams.get('challenge');
  const verifyToken = req.nextUrl.searchParams.get('verify_token');

  // MOCKUP MODE: VERIFY_TOKEN kosong -> terima challenge apapun untuk demo
  if (!process.env.TIKTOK_VERIFY_TOKEN) {
    console.warn('[Webhook Mock] TIKTOK_VERIFY_TOKEN kosong, terima challenge demo.');
    return new NextResponse(challenge ?? 'mock-challenge-ok', { status: 200 });
  }

  if (mode === 'subscribe' && verifyToken === process.env.TIKTOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
