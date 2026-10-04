import { type SocialComment } from '@prisma/client';

// Mockup mode: kalau GEMINI_API_KEY kosong, pakai analisis lokal
// tanpa call API sama sekali. Aman untuk demo / mockup.
export const isMockAiMode = !process.env.GEMINI_API_KEY;

const POSITIVE_KEYWORDS = [
  'bagus',
  'keren',
  'mantap',
  'puas',
  'senang',
  'terima kasih',
  'thanks',
  'thank',
  'recommend',
  'top',
  'lancar',
  'cepat',
  'rapi',
  'cocok',
  'suka',
  'love',
  'keren banget',
];
const NEGATIVE_KEYWORDS = [
  'lama',
  'rusak',
  'kecewa',
  'mahal',
  'pudar',
  'berbeda',
  'komplain',
  'refund',
  'cancel',
  'gagal',
  'tracking',
  'longgar',
  'kurang',
  'buruk',
  'jelek',
  'parah',
];

function mockAnalyze(message: string, username: string): {
  sentiment: string;
  aiReply: string;
} {
  const lower = message.toLowerCase();
  const isNegative = NEGATIVE_KEYWORDS.some((k) => lower.includes(k));
  const isPositive = POSITIVE_KEYWORDS.some((k) => lower.includes(k));

  if (isNegative && !isPositive) {
    return {
      sentiment: 'NEGATIVE',
      aiReply: `Mohon maaf atas ketidaknyamanannya ${username}. Kami akan segera menindaklanjuti via DM untuk solusi terbaik. (mock-AI)`,
    };
  }
  if (isPositive) {
    return {
      sentiment: 'POSITIVE',
      aiReply: `Terima kasih ${username}! Kami senang kualitasnya memuaskan. Silakan cek katalog lengkap di website kami ya. (mock-AI)`,
    };
  }
  return {
    sentiment: 'NEUTRAL',
    aiReply: `Hai ${username}! Terima kasih atas pertanyaannya. Silakan DM kami untuk info lebih detail. (mock-AI)`,
  };
}

export async function analyzeComment(
  comment: SocialComment,
): Promise<{ sentiment: string; aiReply: string }> {
  // MOCK MODE: tanpa API key -> analisis lokal instan, tanpa network call
  if (isMockAiMode) {
    return mockAnalyze(comment.message, comment.username);
  }

  const prompt = `
You are an AI assistant that analyzes social media comments and generates polite response suggestions.

Comment from ${comment.username} on ${comment.platform}:
"${comment.message}"

Please:
1. Analyze the sentiment and classify it as one of: POSITIVE, NEUTRAL, or NEGATIVE (uppercase)
2. Generate a polite, professional, and contextually appropriate reply in Indonesian

Return your response as JSON without any markdown:
{"sentiment": "POSITIVE/NEUTRAL/NEGATIVE", "aiReply": "your suggested reply here"}
`;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    const parsed = JSON.parse(text.trim());
    const sentiment = String(parsed.sentiment ?? 'NEUTRAL').toUpperCase();

    return {
      sentiment: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(sentiment)
        ? sentiment
        : 'NEUTRAL',
      aiReply: parsed.aiReply ?? '',
    };
  } catch (error) {
    console.error('[Gemini AI Error, fallback ke mock]', error);
    return mockAnalyze(comment.message, comment.username);
  }
}
