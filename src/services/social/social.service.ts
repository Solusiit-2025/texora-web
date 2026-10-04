import { type SocialComment, type SocialPlatform, type CommentSentiment, PrismaClient } from '@prisma/client';
import { analyzeComment } from '../../lib/ai/gemini';
import { type NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function processNewSocialComment(
  data: {
    platform: SocialPlatform;
    postId: string;
    commentId: string;
    username: string;
    message: string;
    timestamp?: Date;
  },
): Promise<SocialComment> {
  const comment = await prisma.socialComment.create({
    data: {
      platform: data.platform,
      postId: data.postId,
      commentId: data.commentId,
      username: data.username,
      message: data.message,
      timestamp: data.timestamp ?? new Date(),
    },
  });

  // Trigger AI analysis (mockup: tanpa API key -> analisis lokal)
  const { sentiment, aiReply } = await analyzeComment(comment);
  const normalized = sentiment.toUpperCase() as CommentSentiment;

  await prisma.socialComment.update({
    where: { id: comment.id },
    data: {
      sentiment: normalized,
      aiReply,
    },
  });

  return { ...comment, sentiment: normalized, aiReply };
}

export const isMockWebhookMode =
  !process.env.META_WEBHOOK_SECRET && !process.env.TIKTOK_WEBHOOK_SECRET;

export async function verifyMetaSignature(req: NextRequest): Promise<boolean> {
  const secret = process.env.META_WEBHOOK_SECRET;

  // MOCKUP MODE: secret kosong -> lewati verifikasi agar bisa demo
  if (!secret) {
    console.warn('[Webhook Mock] META_WEBHOOK_SECRET kosong, verifikasi dilewati.');
    return true;
  }

  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;

  const body = await req.clone().text();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signature.replace('sha256=', '') === expectedHex;
}

export async function verifyTikTokSignature(req: NextRequest): Promise<boolean> {
  const secret = process.env.TIKTOK_WEBHOOK_SECRET;

  // MOCKUP MODE: secret kosong -> lewati verifikasi agar bisa demo
  if (!secret) {
    console.warn('[Webhook Mock] TIKTOK_WEBHOOK_SECRET kosong, verifikasi dilewati.');
    return true;
  }

  const signature = req.headers.get('x-tiktok-signature');
  if (!signature) return false;

  const body = await req.clone().text();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedHex;
}
