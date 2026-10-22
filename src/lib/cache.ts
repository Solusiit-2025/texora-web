/**
 * Cache in-memory untuk data read-only yang sering diakses.
 *
 * KONDISI DI PROYEK INI: database Postgres berada di server REMOTE
 * (latensi ~180ms per query!). Tanpa cache, satu halaman bisa memicu
 * 8-10 query berurutan = 1,5 detik+ (dan sering 10-20 detik kalau salah satu
 * koneksi ket Alaskan oleh firewall).
 *
 * Strategi:
 *  - `fresh`  : pakai nilai dari memory, tanpa query DB
 *  - `stale`  : pakai nilai lama (tetep cepat), refresh di background
 *  - `expired`: query DB, sekaligus dedupe request paralel (hanya 1 query)
 *
 * Cache invalidated manual setelah admin menyimpan konten (lihat
 * `invalidateCache`).
 */

interface Entry<T> {
  value: T;
  freshUntil: number;
  staleUntil: number;
  promise?: Promise<T>;
}

const store = new Map<string, Entry<any>>();

/**
 * Kill-switch untuk debugging/benchmark: set `DISABLE_APP_CACHE=1` supaya
 * semua data dibaca langsung dari DB (berguna saat menelusuri masalah data).
 */
function cacheDisabled(): boolean {
  return process.env.DISABLE_APP_CACHE === "1";
}

export interface CacheOptions {
  /** Umur data dianggap segar (ms). Default 60 detik. */
  ttl?: number;
  /** Umur data masih boleh dipakai sambil di-refresh (ms). Default 10 menit. */
  stale?: number;
  /**
   * Lewati cache sepenuhnya (baca & tulis).
   *
   * Dipakai oleh panel admin yang butuh data terbaru (mis. daftar konten
   * sesudah admin menyimpan/mengubah sesuatu). Tanpa ini, admin membaca
   * respons basi selama masa TTL.
   */
  bypass?: boolean;
}

/**
 * Ambil data dari cache; jalankan `loader` hanya bila perlu.
 * `loader` harus idempotent (query read-only).
 */
export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  opts: CacheOptions = {}
): Promise<T> {
  if (cacheDisabled() || opts.bypass) return loader();

  const ttl = opts.ttl ?? 60_000;
  const stale = opts.stale ?? 600_000;
  const now = Date.now();

  const hit = store.get(key) as Entry<T> | undefined;

  // 1. Masih segar -> tanpa query
  if (hit && now < hit.freshUntil) return hit.value;

  // 2. Masih bisa dipakai (stale) -> kembalikan yang lama, refresh di belakang
  if (hit && now < hit.staleUntil) {
    void refresh(key, loader, ttl, stale);
    return hit.value;
  }

  // 3. Expired -> query (dedupe kalau ada request paralel)
  return refresh(key, loader, ttl, stale);
}

async function refresh<T>(
  key: string,
  loader: () => Promise<T>,
  ttl: number,
  stale: number
): Promise<T> {
  const existing = store.get(key) as Entry<T> | undefined;

  // Request paralel untuk key yang sama: pakai promise yang sedang jalan
  if (existing?.promise) return existing.promise;

  const promise = loader()
    .then((value) => {
      store.set(key, {
        value,
        freshUntil: Date.now() + ttl,
        staleUntil: Date.now() + ttl + stale,
      });
      return value;
    })
    .catch((err) => {
      // Query gagal (mis. koneksi DB terputus): jangan hapus cache lama,
      // tapi kurangi masa segarnya supaya coba lagi sebentar lagi.
      const prev = store.get(key) as Entry<T> | undefined;
      if (prev) {
        prev.freshUntil = Date.now() + 5_000;
        store.set(key, prev);
        return prev.value;
      }
      throw err;
    });

  store.set(key, {
    value: existing?.value as T,
    freshUntil: existing?.freshUntil ?? 0,
    staleUntil: existing?.staleUntil ?? 0,
    promise,
  });

  return promise;
}

/**
 * Hapus cache (dipanggil setelah admin menyimpan/mengubah konten).
 * Tanpa argumen = hapus semua.
 */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/** Daftar key yang sedang di-cache (untuk debug). */
export function cacheKeys(): string[] {
  return Array.from(store.keys());
}
