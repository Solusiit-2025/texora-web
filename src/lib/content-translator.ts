/**
 * AI Content Translation — menerjemahkan konten yang bersumber dari
 * database/CMS (FAQ, hero, testimoni, deskripsi produk, teks About, tarif)
 * ke bahasa pilihan pengunjung.
 *
 * Arsitektur:
 *  - Teks sumber (Bahasa Indonesia) SELALU sumber kebenaran — Google & AI
 *    crawler tetap melihat konten Indonesia yang canonical (aman untuk SEO).
 *  - Terjemahan Gemini di-cache di tabel `content_translations` dengan key
 *    (entity, entityId, field, locale). Hemat: 1 teks = 1 panggilan API,
 *    selama-lamanya, sampai teks aslinya berubah.
 *  - Jika teks asli diubah (source beda dengan yang tersimpan) -> otomatis
 *    diterjemahkan ulang.
 *  - GEMINI_API_KEY kosong / API error -> fallback teks asli (fitur mati
 *    dengan anggun, halaman tidak pernah rusak).
 */

import { prisma } from "@/lib/prisma";
import { cached, invalidateCache } from "@/lib/cache";
import { HERO_TEXT_KEY, HERO_TEXT_FIELDS } from "@/config/hero-text";

export const TRANSLATION_LOCALES = ["en", "zh", "ja", "de", "ar"] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/** Normalisasi input user -> locale valid, atau null (= jangan translate). */
export function normalizeLocale(input: string | null | undefined): TranslationLocale | null {
  const v = String(input || "").toLowerCase().split("-")[0];
  if (!v || v === "id") return null;
  return (TRANSLATION_LOCALES as readonly string[]).includes(v)
    ? (v as TranslationLocale)
    : null;
}

const LOCALE_INSTRUCTION: Record<TranslationLocale, string> = {
  en: "English (clear, professional B2B trade language)",
  zh: "Simplified Chinese (简体中文, business register)",
  ja: "Japanese (日本語, polite です・ます business style)",
  de: "German (Deutsch, formal 'Sie' business style)",
  ar: "Modern Standard Arabic (العربية الفصحى, formal business style)",
};

export function isAiTranslationEnabled(): boolean {
  return Boolean(process.env.NINEROUTER_API_KEY || process.env.GEMINI_API_KEY);
}

/**
 * Model Gemini yang dipakai.
 *
 * CATATAN (hasil tes 21 Okt 2026):
 *  - "gemini-2.5-flash"  -> 404 "no longer available to new users" (ditolak Google)
 *  - "gemini-3.5-flash"  -> sering 503 "high demand" (1 dari 3 percobaan gagal)
 *  - "gemini-3.5-flash-lite" -> stabil 3/3, rata-rata ~1 detik  <- dipakai
 *
 * Bisa dioverride lewat env `GEMINI_MODEL`.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function getAiProviderInfo(): { enabled: boolean; provider: string; model: string } {
  const gKey = process.env.GEMINI_API_KEY;
  const hasNineRouter = !!process.env.NINEROUTER_API_KEY;
  const hasGoogle = !!gKey && isGoogleApiKey(gKey);

  const envOrder = (process.env.AI_PROVIDER_ORDER || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as ("google" | "9router")[];

  let order: ("google" | "9router")[];
  if (envOrder.length) order = envOrder;
  else if (hasNineRouter && !hasGoogle) order = ["9router", "google"];
  else if (hasNineRouter && hasGoogle) order = ["google", "9router"];
  else if (hasGoogle) order = ["google"];
  else order = ["9router"];

  if (!hasNineRouter && !hasGoogle && gKey) {
    // key ada tapi format bukan Google -> diarahkan ke 9Router
    return {
      enabled: true,
      provider: "9Router AI Gateway (key non-Google)",
      model: process.env.NINEROUTER_MODEL || "myCombos1",
    };
  }

  const parts = order
    .filter((p) => (p === "google" ? hasGoogle : hasNineRouter))
    .map((p) =>
      p === "google"
        ? `Google Gemini SDK (${GEMINI_MODEL})`
        : `9Router Gateway (${process.env.NINEROUTER_MODEL || "myCombos1"})`
    );

  if (parts.length === 0) return { enabled: false, provider: "None", model: "-" };

  return {
    enabled: true,
    provider: parts.join(" → "),
    model:
      order[0] === "google"
        ? GEMINI_MODEL
        : process.env.NINEROUTER_MODEL || "myCombos1",
  };
}

/**
 * Deteksi format kunci API:
 *  - Google AI Studio  : "AIza..." (prefix)
 *  - 9Router / gateway : "AQ.Ab..." atau key lain (OpenAI-compatible)
 *
 * Kalau key terdeteksi bukan format Google, dan 9Router lokal tersedia,
 * kita arahkan ke 9Router (punya fallback 3-tier antar provider, jadi tidak
 * dead-end saat satu provider kena kuota).
 */
function isGoogleApiKey(key?: string): boolean {
  return !!key && key.trim().startsWith("AIza");
}

/** Base URL 9Router lokal (atau gateway lain). */
function nineRouterBaseUrl(): string {
  return (process.env.NINEROUTER_BASE_URL || "http://localhost:20128/v1").replace(/\/+$/, "");
}

/** Kunci untuk 9Router: pakai NINEROUTER_API_KEY, fallback ke GEMINI_API_KEY
 *  (beberapa setup memakai satu key untuk keduanya). */
function nineRouterApiKey(): string {
  return process.env.NINEROUTER_API_KEY || process.env.GEMINI_API_KEY || "";
}

/**
 * Panggil 9Router (OpenAI-compatible AI Gateway).
 * 9Router otomatis menangani 3-tier fallback jika provider/model utama limit.
 *
 * `maxRetries` = 0 (default) -> jalur on-demand, tidak menunggu saat limit.
 */
async function callNineRouter(
  contents: string,
  isJson = false,
  maxRetries = 0
): Promise<string> {
  const baseURL = nineRouterBaseUrl();
  const apiKey = nineRouterApiKey();
  const model = process.env.NINEROUTER_MODEL || "google/gemini-2.5-flash";

  let attempt = 0;
  const backoff = [10000, 30000, 60000, 120000];

  for (;;) {
    try {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: contents }],
          temperature: 0.2,
          ...(isJson ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const err: any = new Error(
          `9Router error (${res.status}): ${errorText.slice(0, 200)}`
        );
        err.status = res.status;
        throw err;
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content ?? "";
      return text;
    } catch (err: any) {
      attempt += 1;
      const limited = err?.status === 429 || isRateLimited(err);
      if (attempt > maxRetries || !limited) throw err;
      const wait = backoff[Math.min(attempt - 1, backoff.length - 1)];
      console.warn(
        `[i18n] 9Router rate-limited, retry ${attempt}/${maxRetries} dalam ${Math.round(wait / 1000)}s`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

/**
 * Jeda minimal antar panggilan Gemini direct SDK.
 * Free tier ~15 RPM -> default 5000ms (12 RPM) aman. Naikkan kalau kuota besar.
 * Atur lewat env GEMINI_MIN_CALL_GAP_MS.
 */
const MIN_CALL_GAP_MS = Number(process.env.GEMINI_MIN_CALL_GAP_MS) || 5000;

/**
 * Cooldown setelah kuota habis: selama periode ini, permintaan on-demand
 * TIDAK memanggil API sama sekali (langsung pakai teks asli) supaya halaman
 * tetap cepat walaupun kuota Gemini habis.
 */
let quotaBlockedUntil = 0;

export function isQuotaBlocked(): boolean {
  return Date.now() < quotaBlockedUntil;
}

/**
 * Antrean serialize: semua panggilan Gemini direct dijalankan berurutan dengan
 * jeda minimum sehingga tidak memicu 429 (quota exceeded).
 */
let geminiChain: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function enqueueGemini<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = lastCallAt + MIN_CALL_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();
    return fn();
  };
  const next = geminiChain.then(run, run);
  geminiChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function isRateLimited(err: any): boolean {
  const code = err?.code ?? err?.status;
  const msg = String(err?.message || err?.error?.message || "");
  // 503 "high demand" = beban model sedang tinggi (bukan kuota habis),
  // jadi layak dicoba ulang dengan backoff.
  return (
    code === 429 ||
    code === 503 ||
    /429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|high demand|quota|rate limit/i.test(msg)
  );
}

/**
 * Ambil jeda retry yang disarankan server ("Please retry in 35m42s" /
 * RetryInfo google.rpc) supaya tidak memborbos kuota dengan percobaan sia-sia.
 */
function extractRetryDelayMs(err: any): number | null {
  const msg = String(err?.message || err?.error?.message || "");
  const m = msg.match(/retry in\s+(\d+)m(\d+(?:\.\d+)?)s/i);
  if (m) return (Number(m[1]) * 60 + Number(m[2])) * 1000;
  const s = msg.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  if (s) return Number(s[1]) * 1000;
  return null;
}

/**
 * Panggil Gemini dengan retry + backoff untuk 429.
 *
 * `maxRetries` = 0 dipakai untuk jalur on-demand (render halaman) supaya
 * halaman TIDAK pernah tertahan lama saat kuota habis - langsung fallback.
 * Job background memakai maxRetries tinggi + backoff panjang.
 */
async function callGemini(
  ai: any,
  contents: string,
  config: Record<string, any>,
  maxRetries = 4,
  backoff: number[] = [10000, 30000, 60000, 120000]
): Promise<string> {
  let attempt = 0;

  for (;;) {
    try {
      const response = (await enqueueGemini(() =>
        ai.models.generateContent({ model: GEMINI_MODEL, contents, config })
      )) as any;
      return response?.text ?? "";
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries || !isRateLimited(err)) throw err;

      // Hormati jeda yang disarankan server (bisa "retry in 35m42s" -> jangan
      // retry cepat, kuota free tier sudah habis).
      const serverDelay = extractRetryDelayMs(err);
      if (serverDelay && serverDelay > 10 * 60 * 1000) {
        // Aktifkan cooldown: request on-demand berikutnya TIDAK memanggil API
        // (langsung pakai teks asli) sampai kuota pulih.
        quotaBlockedUntil = Date.now() + Math.min(serverDelay, 60 * 60 * 1000);
        const quotaErr: any = new Error(
          `Kuota Gemini free tier habis, coba lagi dalam ${Math.round(serverDelay / 60000)} menit.`
        );
        quotaErr.quotaExhausted = true;
        quotaErr.retryAfterMs = serverDelay;
        throw quotaErr;
      }
      const wait = serverDelay ?? backoff[Math.min(attempt - 1, backoff.length - 1)];
      console.warn(
        `[i18n] Gemini rate-limited, retry ${attempt}/${maxRetries} dalam ${Math.round(wait / 1000)}s`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

/**
 * Jalur pemanggilan AI terpadu dengan FALLBACK BERANTAI.
 *
 * Urutan provider (bisa diatur lewat env `AI_PROVIDER_ORDER`):
 *   default  -> "google,9router"  (kalau GEMINI_API_KEY format AIza)
 *               "9router,google"  (kalau NINEROUTER_API_KEY yang jadi primary)
 *
 * Kalau provider pertama gagal (503 high demand, 401, dll), otomatis pindah
 * ke provider berikutnya. Jadi satu provider mati tidak mematikan fitur
 * terjemahan.
 *
 * `maxRetries`:
 *  - 0 (default) -> jalur on-demand (render halaman). Tidak pernah menunggu
 *    saat kuota habis; halaman langsung fallback ke teks asli.
 *  - 4 -> job background, boleh menunggu kuota pulih.
 */
async function callAiTranslator(
  contents: string,
  isJson = false,
  maxRetries = 0
): Promise<string> {
  const gKey = process.env.GEMINI_API_KEY;
  const hasNineRouter = !!process.env.NINEROUTER_API_KEY;
  const hasGoogle = !!gKey && isGoogleApiKey(gKey);

  // Susun urutan chain
  const envOrder = (process.env.AI_PROVIDER_ORDER || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as ("google" | "9router")[];

  let order: ("google" | "9router")[];
  if (envOrder.length) {
    order = envOrder;
  } else if (hasNineRouter && !hasGoogle) {
    order = ["9router", "google"];
  } else if (hasNineRouter && hasGoogle) {
    order = ["google", "9router"];
  } else if (hasGoogle) {
    order = ["google"];
  } else {
    // key ada tapi formatnya bukan Google -> arahkan ke 9Router
    order = ["9router"];
  }

  const runGoogle = async () => {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: gKey! });
    return callGemini(
      ai,
      contents,
      isJson ? { temperature: 0.2, responseMimeType: "application/json" } : { temperature: 0.2 },
      maxRetries
    );
  };

  const runNineRouter = async () =>
    callNineRouter(contents, isJson, maxRetries);

  let lastError: unknown = null;

  for (const provider of order) {
    if (provider === "google" && !hasGoogle) continue;
    if (provider === "9router" && !hasNineRouter) continue;

    try {
      return provider === "google" ? await runGoogle() : await runNineRouter();
    } catch (err: any) {
      lastError = err;
      // Kuota habis total -> jangan coba provider lain
      if (err?.quotaExhausted) throw err;
      console.warn(
        `[i18n] Provider ${provider} gagal, coba provider berikutnya:`,
        String(err?.message || err).slice(0, 120)
      );
    }
  }

  if (lastError) throw lastError;
  throw new Error(
    "Kunci API AI belum diatur (isi NINEROUTER_API_KEY atau GEMINI_API_KEY)."
  );
}

/**
 * Terjemahkan sekumpulan teks sekaligus (1 panggilan AI per batch).
 * Selalu mengembalikan array sepanjang input — isi bisa fallback teks asli.
 */
async function translateBatch(
  texts: string[],
  locale: TranslationLocale,
  maxRetries = 0
): Promise<string[]> {
  if (texts.length === 0) return texts;
  if (!isAiTranslationEnabled()) return texts;
  // Kuota baru saja habis -> jangan panggil API, langsung fallback (halaman
  // tetap cepat & normal dalam Bahasa Indonesia).
  if (isQuotaBlocked()) return texts;

  const CHUNK = 40; // batasi ukuran prompt
  const out: string[] = [];

  for (let start = 0; start < texts.length; start += CHUNK) {
    const slice = texts.slice(start, start + CHUNK);
    try {
      const prompt = `You are a professional translator for "PT. Texora Visi Prima", an Indonesian industrial textile sublimation-printing manufacturer (B2B).

Translate each Indonesian text below into ${LOCALE_INSTRUCTION[locale]}.

Strict rules:
- Keep brand & industry terms untranslated where natural: "PT. Texora Visi Prima", "Texora", product names like "Dryfit Milano", "Voal Ultrafine", "OEKO-TEX", "GSM", "QRIS", "SPK".
- Preserve HTML tags, placeholders, numbers, prices and line structure EXACTLY as in the source. Do not add or remove tags.
- Do not transliterate if unsure — mixing Latin brand terms is normal.
- Output ONLY a JSON array (no markdown, no prose): [{"i": <index>, "t": "<translation>"}], same order and count as input.

INPUT:
${JSON.stringify(slice)}`;

      const raw = await callAiTranslator(prompt, true);

      // Parser TAHAN BANYAK FORMAT balasan AI:
      //  - array langsung            : [{"i":0,"t":"..."}]
      //  - object pembungkus array   : {"translations":[{"i":0,"t":"..."}]}
      //  - map indeks -> objek        : {"0":{"t":"..."},"1":{"t":"..."}}
      //  - map indeks -> string      : {"0":"...","1":"..."}
      //  - index sebagai string      : [{"i":"0","t":"..."}]
      //  - alias kolom                : index/id/idx  &  t/text/translation
      const parsed = parseAiJson(raw);
      const map = new Map<number, string>();

      const absorb = (item: any, fallbackIdx?: number) => {
        if (!item) return;
        let idx: number | undefined;
        if (typeof item.i === "number") idx = item.i;
        else if (typeof item.i === "string" && item.i.trim() !== "") idx = Number(item.i);
        else if (typeof item.index === "number") idx = item.index;
        else if (typeof item.id === "number") idx = item.id;
        else if (typeof item.idx === "number") idx = item.idx;
        else if (fallbackIdx !== undefined) idx = fallbackIdx;

        let text: string | undefined;
        if (typeof item.t === "string") text = item.t;
        else if (typeof item.text === "string") text = item.text;
        else if (typeof item.translation === "string") text = item.translation;
        else if (typeof item.translated === "string") text = item.translated;
        else if (typeof item === "string") text = item;

        if (idx === undefined || !text || !text.trim()) return;
        if (!Number.isFinite(idx)) return;
        map.set(idx, text.trim());
      };

      if (Array.isArray(parsed)) {
        parsed.forEach((item, i) => absorb(item, i));
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, any>;
        // Cari properti yang berisi array
        const arrProp = Object.values(obj).find((v) => Array.isArray(v));
        if (arrProp) {
          (arrProp as any[]).forEach((item, i) => absorb(item, i));
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const numericKey = Number(key);
            if (Number.isFinite(numericKey)) {
              if (value && typeof value === "object") absorb(value, numericKey);
              else if (typeof value === "string") map.set(numericKey, value.trim());
            } else {
              // {"translations": ...} sudahhandled; wrapper lain
              absorb(value, undefined);
            }
          });
        }
      }

      // Item yang hilang -> retry satu per satu (biaya kecil, kualitas terjaga).
      // CATATAN: kondisi lama `missing.length < slice.length` membuat SELURUH
      // batch hilang tanpa retry sama sekali saat balasan AI tidak bisa diparse
      // (mis. JSON rusak karena newline mentah di dalam string HTML panjang).
      // Sekarang: retry per item, dibatasi maksimal 12 item per batch supaya
      // tidak meledak kuota.
      const missing: number[] = [];
      slice.forEach((_, idx) => {
        if (!map.has(idx)) missing.push(idx);
      });

      if (missing.length > 0) {
        const MAX_RETRY = 12;
        const toRetry = missing.slice(0, MAX_RETRY);
        if (missing.length > MAX_RETRY) {
          console.warn(
            `[i18n] ${missing.length} teks gagal diparse, retry ${MAX_RETRY} sisanya dilewati (batch ${start / CHUNK})`
          );
        }
        for (const idx of toRetry) {
          try {
            const t = (
              await callAiTranslator(
                `Translate this Indonesian text into ${LOCALE_INSTRUCTION[locale]}. Keep brand names, numbers, prices and HTML tags unchanged. Reply ONLY with the translated text, nothing else.\n\nTEXT: ${slice[idx]}`,
                false
              )
            ).trim();
            if (t) map.set(idx, t);
          } catch {
            /* biarkan fallback ke teks asli */
          }
        }
      }

      slice.forEach((orig, idx) => out.push(map.get(idx) ?? orig));
    } catch (err) {
      // Error kuota harus meneruskan ke pemanggil (job background) supaya bisa
      // menunggu kuota pulih & melanjutkan — bukan diam-diam fallback.
      if ((err as any)?.quotaExhausted) throw err;
      console.warn(
        `[i18n] AI error (batch ${start / CHUNK}), fallback teks asli:`,
        String((err as Error)?.message).slice(0, 140)
      );
      out.push(...slice); // fallback teks asli
    }
  }

  return out;
}

/**
 * Terjemahkan SATU teks via AI (dipanggil khusus saat admin klik tombol AI translate di CMS).
 */
export async function translateSingleText(
  text: string,
  locale: TranslationLocale
): Promise<string> {
  if (!text || !text.trim()) return text;
  if (!isAiTranslationEnabled()) {
    throw new Error("Kunci API AI belum diatur (isi NINEROUTER_API_KEY atau GEMINI_API_KEY).");
  }

  const prompt = `You are a professional translator for "PT. Texora Visi Prima", an Indonesian industrial textile sublimation-printing manufacturer (B2B).

Translate this Indonesian text into ${LOCALE_INSTRUCTION[locale]}.
Strict rules:
- Keep brand & industry terms untranslated where natural: "PT. Texora Visi Prima", "Texora", product names like "Dryfit Milano", "Voal Ultrafine", "OEKO-TEX", "GSM", "QRIS", "SPK".
- Preserve HTML tags, placeholders, numbers, prices and line structure EXACTLY as in the source. Do not add or remove tags.
- Output ONLY the translated text, nothing else.

TEXT:
${text}`;

  const translated = (await callAiTranslator(prompt, false)).trim();
  return translated || text;
}

interface CacheEntry {
  source: string;
  text: string;
}

/**
 * Terjemahkan baris-baris konten (list dari DB) secara offline via database cache.
 *
 * PENTING: Fungsi ini HANYA membaca dari tabel `content_translations`.
 * Gemini API TIDAK PERNAH dipanggil saat pengunjung membuka halaman web,
 * sehingga:
 *  - Kuota Gemini tidak akan terkuras oleh traffic pengunjung web.
 *  - Halaman web selalu dimuat instan (0ms AI latency).
 *  - Jika terjemahan belum ada di cache, otomatis fallback ke teks asli (Bahasa Indonesia).
 *  - Terjemahan dibuat secara terkontrol lewat panel CMS (AI atau manual).
 */
export async function localizeRows<T extends Record<string, any>>(
  entity: string,
  rows: T[],
  getId: (row: T) => string,
  fields: string[],
  locale: string | null | undefined
): Promise<T[]> {
  const lang = normalizeLocale(locale);
  if (!lang || !Array.isArray(rows) || rows.length === 0) return rows;

  try {
    const ids = rows.map((r) => String(getId(r)));

    // 1. Ambil cache yang ada dari database.
    //    Cache 60 detik: DB remote ~180ms/query, dan halaman versi bahasa
    //    asing memanggil localizeRows berkali-kali (hero, faq, produk, dll).
    const translationRows = await cached(
      `translations:${entity}:${lang}`,
      () =>
        prisma.contentTranslation.findMany({
          where: { entity, locale: lang },
        }),
      { ttl: 60_000, stale: 600_000 }
    );

    const cache = new Map<string, CacheEntry>(
      translationRows
        .filter((c) => ids.includes(String(c.entityId)) && fields.includes(c.field))
        .map((c) => [
          `${c.entityId}|${c.field}`,
          { source: c.source, text: c.translation },
        ])
    );

    // 2. Terapkan hasil cache ke salinan rows.
    //    PENTING: hanya pakai cache bila teks sumber TIDAK berubah. Kalau admin
    //    mengubah teks aslinya, cache lama dianggap basi -> tampilkan teks asli
    //    sampai terjemahan baru dibuat (oleh job/panel admin).
    const out = rows.map((r) => ({ ...r })) as T[];
    rows.forEach((row, idx) => {
      const id = String(getId(row));
      for (const f of fields) {
        const val = (row as any)[f];
        if (typeof val !== "string" || !val.trim()) continue;
        const hit = cache.get(`${id}|${f}`);
        if (hit && hit.text && hit.text.trim() && hit.source === val) {
          (out[idx] as any)[f] = hit.text;
        }
      }
    });

    return out;
  } catch (err) {
    console.warn(`[i18n] localizeRows(${entity}) error, pakai teks asli:`, (err as Error)?.message);
    return rows;
  }
}

/**
 * Terjemahkan field teks dari satu objek (mis. JSON site.pages / pricing).
 */
export async function localizeObject<T extends Record<string, any>>(
  entity: string,
  entityId: string,
  obj: T,
  fields: string[],
  locale: string | null | undefined
): Promise<T> {
  if (!obj || typeof obj !== "object") return obj;
  const [out] = await localizeRows(entity, [obj], () => entityId, fields, locale);
  return out as T;
}

/** Key JSON pada site_content yang punya field teks terjemahan. */
const SITE_CONTENT_JSON_FIELDS: Record<string, string[]> = {
  "site.pages": ["aboutTitle", "aboutDescription", "aboutCaption"],
  "homepage.cta_b2b": ["title", "description", "actionText"],
  // Copy hero homepage (badge, judul 3 baris, lead, 3 poin, 2 CTA).
  [HERO_TEXT_KEY]: [...HERO_TEXT_FIELDS],
};

/**
 * Terjemahkan baris site_content yang value-nya JSON string
 * (site.pages, homepage.cta_b2b, homepage.stats). Key lain lolos apa adanya.
 */
export async function localizeSiteContentRows(
  rows: any[],
  locale: string | null | undefined
): Promise<any[]> {
  const lang = normalizeLocale(locale);
  if (!lang || !Array.isArray(rows)) return rows;

  const out: any[] = [];
  for (const row of rows) {
    try {
      if (row.key === "homepage.stats" && row.value) {
        const arr = JSON.parse(row.value);
        if (Array.isArray(arr)) {
          const localized = await localizeStatLabels("homepage.stats", arr, lang);
          out.push({ ...row, value: JSON.stringify(localized) });
          continue;
        }
      }
      const fields = SITE_CONTENT_JSON_FIELDS[row.key];
      if (fields && row.value) {
        const obj = JSON.parse(row.value);
        if (obj && typeof obj === "object") {
          const localized = await localizeObject("siteContent", row.key, obj, fields, lang);
          out.push({ ...row, value: JSON.stringify(localized) });
          continue;
        }
      }
    } catch {
      /* JSON tidak valid -> pakai nilai asli */
    }
    out.push(row);
  }
  return out;
}

/**
 * Terjemahkan label statistik homepage: [{v,k}] -> k saja.
 */
export async function localizeStatLabels(
  entityId: string,
  stats: Array<{ v: string; k: string }>,
  locale: string | null | undefined
): Promise<Array<{ v: string; k: string }>> {
  if (!Array.isArray(stats)) return stats;
  const rows = stats.map((s, i) => ({ _id: String(i), k: s.k, v: s.v }));
  const localized = await localizeRows(
    "siteContent",
    rows,
    (r) => r._id,
    ["k"],
    locale
  );
  return localized.map((s) => ({ v: s.v, k: s.k }));
}

export interface TranslatableItem {
  entity: string;
  entityId: string;
  field: string;
  text: string;
}

/**
 * Parse balasan JSON dari AI dengan proses yang tahan banting.
 *
 * Masalah nyata: untuk teks panjang (isi artikel HTML beberapa KB), model
 * kadang menulis newline/tab mentah DI DALAM string JSON. Itu illegal JSON
 * -> `JSON.parse` gagal -> seluruh batch hilang (fallback ke teks asli).
 *
 * Solusi: coba parse biasa; kalau gagal, escape karakter kontrol yang ada
 * di dalam string literal, lalu parse ulang. Kalau masih gagal, ambil
 * potongan array pertama yang balancing.
 */
function parseAiJson(raw: string): any {
  const text = String(raw || "").trim();

  // Buang pagar markdown yang sering ditambahkan model
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const attempts = [cleaned, escapeControlCharsInJson(cleaned)];
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      /* coba strategi berikutnya */
    }
  }

  // Kasus ekstrem: ambil substring array pertama yang balancing
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const slice = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {
      try {
        return JSON.parse(escapeControlCharsInJson(slice));
      } catch {
        /* gagal total */
      }
    }
  }

  throw new Error("Balasan AI bukan JSON yang valid: " + cleaned.slice(0, 120));
}

/** Escape karakter kontrol (0x00-0x1F) yang berada DI DALAM string JSON. */
function escapeControlCharsInJson(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        out += ch;
        inString = false;
        continue;
      }
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        out += "\\u" + code.toString(16).padStart(4, "0");
        continue;
      }
      out += ch;
      continue;
    }

    if (ch === '"') inString = true;
    out += ch;
  }

  return out;
}

/**
 * Terjemahkan BANYAK item (bisa dari beberapa entity) dengan SEDIKIT
 * panggilan Gemini: semua teks unik dikirim dalam satu batch (dipecah 40/batch),
 * lalu hasilnya dipetakan balik ke cache per item.
 *
 * Ini penting karena kuota Gemini free tier hanya 20 request/menit.
 */
export async function translateItems(
  items: TranslatableItem[],
  locale: string | null | undefined
): Promise<number> {
  const lang = normalizeLocale(locale);
  if (!lang || !isAiTranslationEnabled() || items.length === 0) return 0;

  // 1. Ambil cache yang ada untuk entity terkait
  const entities = Array.from(new Set(items.map((i) => i.entity)));
  const cached = await prisma.contentTranslation.findMany({
    where: { entity: { in: entities }, locale: lang },
  });
  const cache = new Map(
    cached.map((c) => [`${c.entity}|${c.entityId}|${c.field}`, c])
  );

  // 2. Tentukan yang perlu diterjemahkan (cache miss / sumber berubah)
  const needs: TranslatableItem[] = [];
  const uniqueTexts: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (!item.text || !item.text.trim()) continue;
    const key = `${item.entity}|${item.entityId}|${item.field}`;
    const hit = cache.get(key);
    if (hit && hit.source === item.text) continue;
    needs.push(item);
    if (!seen.has(item.text)) {
      seen.add(item.text);
      uniqueTexts.push(item.text);
    }
  }

  if (needs.length === 0) return 0;

  // 3. SATU batch translate untuk semua teks unik
  // Job background: boleh menunggu kuota pulih (retry panjang).
  const translated = await translateBatch(uniqueTexts, lang, 4);
  const byText = new Map<string, string>();
  uniqueTexts.forEach((t, i) => byText.set(t, translated[i] || t));

  // 4. Simpan cache per item (yang gagal -> tidak dicache, dicoba lagi nanti)
  let saved = 0;
  await Promise.allSettled(
    needs.map((item) => {
      const tr = byText.get(item.text) || item.text;
      if (tr === item.text && item.text.trim().length > 20) return Promise.resolve();
      saved += 1;
      return prisma.contentTranslation.upsert({
        where: {
          entity_entityId_field_locale: {
            entity: item.entity,
            entityId: item.entityId,
            field: item.field,
            locale: lang,
          },
        },
        create: {
          entity: item.entity,
          entityId: item.entityId,
          field: item.field,
          locale: lang,
          source: item.text,
          translation: tr,
        },
        update: { source: item.text, translation: tr },
      });
    })
  );

  // Cache terjemahan di memory jadi basi -> buang supaya request berikutnya
  // langsung memakai versi terbaru.
  invalidateCache("translations:");

  return saved;
}

/* ==========================================================================
   TAHAP 3 — Pre-translate & translate-all (untuk panel admin)
   ========================================================================== */

/**
 * Terjemahkan satu objek ke SEMUA bahasa sekaligus (pre-warm cache).
 * Aman dipanggil secara fire-and-forget setelah admin menyimpan konten.
 *
 * CATATAN: sebelumnya fungsi ini hanya MEMBACA cache (lewat localizeObject),
 * sehingga tidak pernah benar-benar menerjemahkan. Sekarang memakai
 * translateItems() yang benar-benar memanggil AI lalu menyimpan hasilnya
 * ke tabel content_translations.
 */
export async function preTranslateFields(
  entity: string,
  entityId: string,
  obj: Record<string, any>,
  fields: string[]
): Promise<void> {
  if (!isAiTranslationEnabled()) return;

  const items = fields
    .map((f) => ({
      entity,
      entityId,
      field: f,
      text: typeof obj?.[f] === "string" ? String(obj[f]) : "",
    }))
    .filter((i) => i.text.trim().length > 0);

  if (items.length === 0) return;

  await Promise.allSettled(
    TRANSLATION_LOCALES.map((l) => translateItems(items, l))
  );
}

/**
 * Terjemahkan satu map field->teks milik satu entitas (mis. 1 kategori dengan
 * 20 baris teks) dengan SATU panggilan Gemini, lalu simpan per field.
 */
export async function localizeFieldMap(
  entity: string,
  entityId: string,
  map: Record<string, string>,
  locale: string | null | undefined
): Promise<void> {
  const lang = normalizeLocale(locale);
  if (!lang || !isAiTranslationEnabled()) return;

  const entries = Object.entries(map).filter(
    ([, t]) => typeof t === "string" && t.trim().length > 0
  );
  if (entries.length === 0) return;

  const cached = await prisma.contentTranslation.findMany({
    where: {
      entity,
      entityId,
      locale: lang,
      field: { in: entries.map(([f]) => f) },
    },
  });
  const cache = new Map(cached.map((c) => [c.field, c]));

  const need = entries.filter(([field, text]) => {
    const hit = cache.get(field);
    return !(hit && hit.source === text);
  });
  if (need.length === 0) return;

  const translated = await translateBatch(
    need.map(([, t]) => t),
    lang
  );

  await Promise.allSettled(
    need.map(([field, text], i) => {
      const tr = translated[i] || text;
      // Hasil identik dgn sumber (teks panjang) = indikasi gagal -> jangan cache
      if (tr === text && text.trim().length > 20) return Promise.resolve();
      return prisma.contentTranslation.upsert({
        where: {
          entity_entityId_field_locale: { entity, entityId, field, locale: lang },
        },
        create: { entity, entityId, field, locale: lang, source: text, translation: tr },
        update: { source: text, translation: tr },
      });
    })
  );
}

/* ==========================================================================
   JOB BACKGROUND (translate-all)
   ========================================================================== */

export interface TranslationJobState {
  running: boolean;
  phase: string;
  done: number;
  total: number;
  message: string;
  startedAt: string | null;
  finishedAt: string | null;
}

let jobState: TranslationJobState = {
  running: false,
  phase: "idle",
  done: 0,
  total: 0,
  message: "Belum ada proses terjemahan.",
  startedAt: null,
  finishedAt: null,
};

/** Key SystemSetting untuk menyimpan status job (bertahanacross reload/restart). */
const JOB_STATE_KEY = "i18n.translation_job";

/** Simpan status job ke DB (fire-and-forget, tidak menghambat alur). */
function persistJobState(state: TranslationJobState) {
  try {
    prisma.systemSetting
      .upsert({
        where: { key: JOB_STATE_KEY },
        create: { key: JOB_STATE_KEY, value: JSON.stringify(state) },
        update: { value: JSON.stringify(state) },
      })
      .catch(() => {});
  } catch {
    /* diamkan */
  }
}

/**
 * Status job terjemahan.
 *
 * Sumber utama = memori ( cepat ). Bila memori terlihat "idle" (mis. dev
 * server reload karena ada file yang berubah), status terakhir di DB dipakai
 * supaya panel admin tetap menampilkan progres yang benar.
 */
export async function resolveTranslationJob(): Promise<TranslationJobState> {
  const mem = getTranslationJob();
  if (mem.running || mem.startedAt) return mem;

  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: JOB_STATE_KEY } });
    if (!row?.value) return mem;
    const saved = JSON.parse(row.value) as TranslationJobState;
    // Abaikan status lama (> 30 menit)
    if (saved?.startedAt && Date.now() - new Date(saved.startedAt).getTime() < 30 * 60 * 1000) {
      return saved;
    }
  } catch {
    /* fallback ke memori */
  }
  return mem;
}

export function getTranslationJob(): TranslationJobState {
  return { ...jobState };
}

/**
 * Jalankan translate-all sebagai JOB BACKGROUND (tidak memblokir request
 * admin, aman dari timeout & quota).
 */
export function startTranslationJob(): boolean {
  if (jobState.running) return false;
  jobState = {
    running: true,
    phase: "memulai",
    done: 0,
    total: 0,
    message: "Menerjemahkan seluruh konten ke 5 bahasa...",
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };

  (async () => {
    let attempt = 0;
    while (attempt < 4) {
      try {
        const pruned = await pruneBrokenTranslations();
        jobState.message = pruned
          ? `Membersihkan ${pruned} baris bermasalah...`
          : "Menerjemahkan...";
        persistJobState(jobState);
        const summary = await translateAllContent((phase) => {
          jobState.phase = phase;
          jobState.done += 1;
          persistJobState(jobState);
        });
        jobState.phase = "selesai";
        jobState.message = `Selesai. Cache per bahasa: ${Object.entries(summary)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}`;
        break;
      } catch (err: any) {
        const msg = String(err?.message || err);
        const quotaHit = /Kuota Gemini free tier habis/i.test(msg);
        attempt += 1;

        if (quotaHit && attempt < 4) {
          // Tunggu kuota pulih lalu lanjutkan (maks 40 menit per percobaan).
          const wait = 40 * 60 * 1000;
          jobState.phase = "menunggu kuota";
          jobState.message = `Kuota Gemini habis — otomatis melanjutkan dalam ${Math.round(
            wait / 60000
          )} menit. Jangan tutup server.`;
          console.warn(
            `[i18n] Job terjemahan menunggu kuota (${Math.round(wait / 60000)} menit), attempt ${attempt}/4`
          );
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        jobState.phase = "error";
        jobState.message = `Gagal: ${msg.slice(0, 200)}`;
        persistJobState(jobState);
        break;
      }
    }
    jobState.running = false;
    jobState.finishedAt = new Date().toISOString();
    persistJobState(jobState);
  })();

  persistJobState(jobState);
  return true;
}

/**
 * Terjemahkan SELURUH konten utama ke semua bahasa (tombol "Terjemahkan Semua"
 * di panel admin). Mengembalikan jumlah baris cache per bahasa sebagai ringkasan.
 */
export async function translateAllContent(
  onProgress?: (phase: string) => void
): Promise<Record<string, number>> {
  if (!isAiTranslationEnabled()) return {};

  const [products, faqs, heroes, testis, sitePages, cta, statsRow, articles] = await Promise.all([
    prisma.fabricProduct.findMany({ select: { slug: true, description: true } }).catch(() => []),
    prisma.faqItem.findMany({ select: { id: true, question: true, answer: true } }).catch(() => []),
    prisma.heroSlide.findMany({ select: { id: true, tag: true, caption: true, alt: true } }).catch(() => []),
    prisma.testimonial.findMany({ select: { id: true, quote: true } }).catch(() => []),
    prisma.siteContent.findUnique({ where: { key: "site.pages" } }).catch(() => null),
    prisma.siteContent.findUnique({ where: { key: "homepage.cta_b2b" } }).catch(() => null),
    prisma.siteContent.findUnique({ where: { key: "homepage.stats" } }).catch(() => null),
    prisma.article.findMany({
      select: { id: true, title: true, excerpt: true, body: true, seoTitle: true },
    }).catch(() => []),
  ]);

  // Metadata per halaman (judul + deskripsi) -> agar /en/, /de/ dll langsung
  // menampilkan title/description terjemahan, bukan Bahasa Indonesia.
  const { SEO_PAGES } = await import("@/lib/seo-pages");
  const { CATEGORY_SEO } = await import("@/lib/category-seo");

  const metaEntries: Array<{ path: string; title: string; description: string }> = [];
  for (const [path, meta] of Object.entries(SEO_PAGES)) {
    metaEntries.push({ path, title: meta.title, description: meta.description });
  }
  metaEntries.push({
    path: "/kategori",
    title: "Kategori Kain Sublimasi — Panduan & Katalog | Texora",
    description:
      "Panduan lengkap memilih kain sublimasi sesuai kebutuhan industri dan fashion: sportswear & jersey, voal & satin hijab, home living & dekorasi, hingga merchandise, banner, dan flag event.",
  });
  for (const cat of CATEGORY_SEO) {
    metaEntries.push({
      path: `/kategori/${cat.slug}`,
      title: cat.metaTitle,
      description: cat.metaDescription,
    });
  }

  // Kumpulkan SEMUA teks yang perlu diterjemahkan (1 batch per bahasa)
  const items: TranslatableItem[] = [];

  for (const p of products) {
    if (p.description) {
      items.push({ entity: "product", entityId: p.slug, field: "description", text: p.description });
    }
  }
  for (const f of faqs) {
    if (f.question) items.push({ entity: "faq", entityId: String(f.id), field: "question", text: f.question });
    if (f.answer) items.push({ entity: "faq", entityId: String(f.id), field: "answer", text: f.answer });
  }
  for (const h of heroes) {
    if (h.tag) items.push({ entity: "hero", entityId: String(h.id), field: "tag", text: h.tag });
    if (h.caption) items.push({ entity: "hero", entityId: String(h.id), field: "caption", text: h.caption });
    if (h.alt) items.push({ entity: "hero", entityId: String(h.id), field: "alt", text: h.alt });
  }
  for (const t of testis) {
    if (t.quote) items.push({ entity: "testimonial", entityId: String(t.id), field: "quote", text: t.quote });
  }
  for (const a of articles) {
    const id = String(a.id);
    if (a.title) items.push({ entity: "article", entityId: id, field: "title", text: a.title });
    if (a.excerpt) items.push({ entity: "article", entityId: id, field: "excerpt", text: a.excerpt });
    if (a.seoTitle) items.push({ entity: "article", entityId: id, field: "seoTitle", text: a.seoTitle });
    if (a.body) items.push({ entity: "article", entityId: id, field: "body", text: a.body });
  }
  for (const m of metaEntries) {
    items.push({ entity: "seoMeta", entityId: m.path, field: "title", text: m.title });
    items.push({ entity: "seoMeta", entityId: m.path, field: "description", text: m.description });
  }
  if (sitePages?.value) {
    try {
      const obj = JSON.parse(sitePages.value);
      for (const field of ["aboutTitle", "aboutDescription", "aboutCaption"]) {
        if (obj?.[field]) {
          items.push({ entity: "siteContent", entityId: "site.pages", field, text: obj[field] });
        }
      }
    } catch {}
  }
  if (cta?.value) {
    try {
      const obj = JSON.parse(cta.value);
      for (const field of ["title", "description", "actionText"]) {
        if (obj?.[field]) {
          items.push({ entity: "siteContent", entityId: "homepage.cta_b2b", field, text: obj[field] });
        }
      }
    } catch {}
  }
  if (statsRow?.value) {
    try {
      const arr = JSON.parse(statsRow.value);
      if (Array.isArray(arr)) {
        arr.forEach((s: any, i: number) => {
          if (s?.k) {
            items.push({ entity: "siteContent", entityId: `homepage.stats:${i}`, field: "k", text: s.k });
          }
        });
      }
    } catch {}
  }
  for (const cat of CATEGORY_SEO) {
    items.push({ entity: "categorySeo", entityId: cat.slug, field: "title", text: cat.title });
    items.push({ entity: "categorySeo", entityId: cat.slug, field: "intro", text: cat.intro });
    cat.benefits.forEach((b, i) => {
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `b${i}-t`, text: b.title });
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `b${i}-b`, text: b.body });
    });
    cat.guide.forEach((g, i) => {
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `g${i}-h`, text: g.heading });
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `g${i}-t`, text: g.body });
    });
    cat.faqs.forEach((f, i) => {
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `f${i}-q`, text: f.question });
      items.push({ entity: "categorySeo", entityId: cat.slug, field: `f${i}-a`, text: f.answer });
    });
  }

  for (const lang of TRANSLATION_LOCALES) {
    onProgress?.(`${lang}: menerjemahkan ${items.length} teks...`);

    // SATU batch per bahasa (semua entity digabung) -> hanya ~5 panggilan API
    // per bahasa, aman untuk kuota free tier 20 request/menit.
    const saved = await translateItems(items, lang);
    onProgress?.(`${lang}: ${saved} baris tersimpan`);
  }

  // Ringkasan: jumlah baris cache per bahasa
  const summary: Record<string, number> = {};
  for (const lang of TRANSLATION_LOCALES) {
    summary[lang] = await prisma.contentTranslation
      .count({ where: { locale: lang } })
      .catch(() => 0);
  }
  return summary;
}

/**
 * Hapus baris cache yang "basi" (terjemahan == sumber untuk teks panjang) —
 * indikasi batch Gemini gagal parsed. Baris ini akan diterjemahkan ulang
 * pada pemanggilan berikutnya.
 */
export async function pruneBrokenTranslations(): Promise<number> {
  const rows = await prisma.contentTranslation.findMany({
    where: { locale: { in: [...TRANSLATION_LOCALES] } },
  });
  const broken = rows.filter(
    (r) => r.translation === r.source && r.source.trim().length > 20
  );
  if (broken.length === 0) return 0;
  await prisma.contentTranslation.deleteMany({
    where: { id: { in: broken.map((b) => b.id) } },
  });
  return broken.length;
}
