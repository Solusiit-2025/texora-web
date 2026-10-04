import { type NextRequest, NextResponse } from 'next/server';
import { processNewSocialComment, verifyMetaSignature } from '@/services/social/social.service';

export async function POST(req: NextRequest) {
  const isValid = await verifyMetaSignature(req);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = await req.json();

  if (body.object) {
    if (body.entry && body.entry[0]?.changes) {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'comments') {
            const comment = change.value;
            await processNewSocialComment({
              platform: 'FACEBOOK',
              postId: comment.post_id || comment.media_id,
              commentId: comment.id,
              username: comment.from?.name || 'unknown',
              message: comment.message || '',
              timestamp: comment.timestamp ? new Date(parseInt(comment.timestamp) * 1000) : undefined,
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  // MOCKUP MODE: VERIFY_TOKEN kosong -> terima challenge apapun untuk demo
  if (!process.env.META_VERIFY_TOKEN) {
    console.warn('[Webhook Mock] META_VERIFY_TOKEN kosong, terima challenge demo.');
    return new NextResponse(challenge ?? 'mock-challenge-ok', { status: 200 });
  }

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
