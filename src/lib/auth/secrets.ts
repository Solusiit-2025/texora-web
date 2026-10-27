/**
 * Sumber tunggal secret JWT (Node & Edge runtime).
 *
 * SEBELUMNYA setiap file punya fallback hardcoded yang ikut ter-commit di
 * repo (mis. "texora_jwt_access_secret_..."). Kalau `JWT_SECRET` lupa diset
 * di produksi, siapa pun yang tahu isi repo bisa MEMALSUKAN token admin.
 *
 * Aturan sekarang:
 *  - Produksi: secret WAJIB dari environment; kalau kosong → error jelas
 *    (lebih baik gagal daripada diam-diam memakai secret publik).
 *  - Dev/test: fallback khusus dev agar `npm run dev` tetap praktis.
 *
 * Dibuat lazy (fungsi) supaya tidak melempar error saat modul di-import
 * (mis. ketika Next.js melakukan build/prerender).
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function pickSecret(value: string | undefined, name: string, devFallback: string): string {
  const clean = value?.trim();
  if (clean) {
    if (IS_PRODUCTION && clean.length < 32) {
      console.warn(
        `[auth] ${name} terlalu pendek (${clean.length} karakter). Disarankan ≥32 karakter acak.`
      );
    }
    return clean;
  }

  if (IS_PRODUCTION) {
    throw new Error(
      `${name} belum diset di environment produksi. Isi dengan nilai acak ` +
        `(contoh: openssl rand -base64 48) di .env lalu restart aplikasi.`
    );
  }

  return devFallback;
}

export function getAccessSecret(): string {
  return pickSecret(process.env.JWT_SECRET, "JWT_SECRET", "dev-only-access-secret-change-me");
}

export function getRefreshSecret(): string {
  return pickSecret(
    process.env.JWT_REFRESH_SECRET,
    "JWT_REFRESH_SECRET",
    "dev-only-refresh-secret-change-me"
  );
}

export function getTwoFactorSecret(): string {
  return pickSecret(
    process.env.JWT_2FA_SECRET,
    "JWT_2FA_SECRET",
    "dev-only-2fa-secret-change-me"
  );
}
