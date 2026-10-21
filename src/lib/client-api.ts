"use client";

/**
 * Client-side fetch dengan dedupe + TTL pendek.
 *
 * KONDISI DI PROYEK INI: satu halaman memicu banyak komponen yang sama
 * memanggil API yang sama:
 *   - /api/seo        : SeoHead + PageGate + Navbar        (3x)
 *   - /api/social-links: SocialLinks + FloatingSocial       (2x)
 *   - /api/auth/me    : Navbar + halaman terkait             (2x)
 *
 * Dengan dedupe, 3 request jadi 1 request (satu promise dipakai bersama).
 * Ditambah TTL pendek supaya tidak perlu request ulang tiap navigasi.
 */

interface Entry {
  ts: number;
  promise: Promise<any>;
}

const inflight = new Map<string, Entry>();

export function cachedClientFetch<T = any>(
  url: string,
  ttl = 60_000
): Promise<T> {
  const now = Date.now();
  const hit = inflight.get(url);

  if (hit && now - hit.ts < ttl) {
    return hit.promise as Promise<T>;
  }

  const promise = fetch(url, { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  inflight.set(url, { ts: now, promise });
  return promise as Promise<T>;
}

/** Paksa request ulang (dipanggil setelah admin menyimpan pengaturan). */
export function invalidateClientFetch(url?: string): void {
  if (!url) {
    inflight.clear();
    return;
  }
  inflight.delete(url);
}
