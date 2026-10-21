/**
 * Manager Redirect untuk SEO.
 *
 * Menyimpan peta pengalihan URL (301/308 permanen, 302 sementara) di
 * `system_settings` dengan key `seo.redirects` agar dapat dikelola dari
 * dashboard CMS tanpa deploy ulang.
 *
 *|width本案| Edge middleware tidak dapat mengakses Prisma secara langsung,
 * sehingga peta redirect diambil via fetch ke route handler publik dan
 * disimpan di cache memory (TTL 5 menit) supaya tidak menambah latency
 * pada setiap request.
 */

export const REDIRECTS_KEY = "seo.redirects";

export type RedirectType = "301" | "302" | "307" | "308";

export interface RedirectRule {
  /** Path sumber, contoh: "/kain/lama" */
  from: string;
  /** Path tujuan, contoh: "/catalog/dryfit-milano" */
  to: string;
  /** Status code. Default 301 (permanen). */
  type: RedirectType;
  /** Catatan internal untuk admin. */
  note?: string;
  createdAt?: string;
}

export const DEFAULT_REDIRECTS: RedirectRule[] = [];

/** Normalisasi path: pastikan diawali "/" dan tanpa trailing slash. */
export function normalizePath(path: string): string {
  if (!path) return "/";
  let p = String(path).trim();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  return p || "/";
}

/**
 * Cocokkan pathname dengan peta redirect.
 * Mengembalikan rule yang cocok (persis atau wildcard `*` di akhir).
 */
export function matchRedirect(
  pathname: string,
  rules: RedirectRule[]
): RedirectRule | null {
  const path = normalizePath(pathname);

  // 1. Kecocokan persis
  const exact = rules.find((r) => normalizePath(r.from) === path);
  if (exact) return exact;

  // 2. Wildcard: "/kain/*" -> "/catalog"
  for (const rule of rules) {
    const from = normalizePath(rule.from);
    if (from.endsWith("/*")) {
      const prefix = from.slice(0, -2);
      if (prefix && path.startsWith(prefix)) {
        const rest = path.slice(prefix.length);
        const to = rule.to.includes("*")
          ? rule.to.replace("*", rest)
          : `${normalizePath(rule.to)}${rest}`;
        return { ...rule, to };
      }
    }
  }

  return null;
}

/** Validasi rule sebelum disimpan. */
export function validateRedirectRule(rule: Partial<RedirectRule>): {
  ok: boolean;
  error?: string;
  normalized?: RedirectRule;
} {
  const from = normalizePath(rule.from || "");
  const to = String(rule.to || "").trim();

  if (!rule.from || !to) {
    return { ok: false, error: "URL sumber dan tujuan wajib diisi." };
  }

  if (from === "/") {
    return { ok: false, error: "URL sumber tidak boleh '/' (root)." };
  }

  // Tujuan boleh absolut (eksternal) atau path internal
  const isExternal = /^https?:\/\//i.test(to);
  if (!isExternal && !to.startsWith("/")) {
    return { ok: false, error: "URL tujuan harus diawali '/' atau 'http(s)://'." };
  }

  if (from === normalizePath(isExternal ? to : to)) {
    return { ok: false, error: "URL sumber dan tujuan tidak boleh sama." };
  }

  const type: RedirectType = (["301", "302", "307", "308"] as string[]).includes(
    rule.type || ""
  )
    ? (rule.type as RedirectType)
    : "301";

  return {
    ok: true,
    normalized: {
      from,
      to,
      type,
      note: rule.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    },
  };
}
