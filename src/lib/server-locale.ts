/**
 * Deteksi locale pada SERVER component / generateMetadata.
 *
 * Prioritas:
 *  1. Header `x-locale` — diset oleh middleware saat URL memakai prefix
 *     bahasa (/en/catalog, /de/about, ...). Ini yang dianggap Google.
 *  2. Cookie `texora-locale` — preferensi pengunjung pada URL non-prefik
 *     (personalisasi UX; Googlebot tanpa cookie selalu melihat Indonesia).
 *  3. Default "id".
 *
 * Googlebot & AI crawler tidak mengirim cookie/header -> selalu melihat versi
 * Indonesia kanonik pada URL non-prefik, dan versi terjemahan pada URL
 * berprefik (yang diumumkan lewat hreflang & sitemap) — bersih, tanpa
 * risiko cloaking.
 */

import { headers, cookies } from "next/headers";
import { LOCALES, type Locale } from "@/lib/i18n/dictionary";

export const CONTENT_LOCALES = ["en", "zh", "ja", "de", "ar"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** Locale utk server rendering (chrome UI). */
export async function getRequestLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const fromUrl = h.get("x-locale");
    if (isLocale(fromUrl)) return fromUrl;
  } catch {
    /* headers() tidak tersedia (build time / static) */
  }
  try {
    const c = await cookies();
    const fromCookie = c.get("texora-locale")?.value;
    if (isLocale(fromCookie)) return fromCookie;
  } catch {
    /* cookies() tidak tersedia saat prerender statis */
  }
  return "id";
}

/** Locale untuk terjemahan KONTEN DB (null utk "id"/invalid = jangan translate). */
export async function getContentLocale(): Promise<ContentLocale | null> {
  const l = await getRequestLocale();
  return l === "id" ? null : (l as ContentLocale);
}
