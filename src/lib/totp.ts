/**
 * Implementasi TOTP (RFC 6238) tanpa dependensi eksternal.
 *
 * Algoritma: HOTP (RFC 4226) dengan HMAC-SHA1, timestep 30 detik, 6 digit.
 * Dipakai untuk Autentikasi Dua Faktor (2FA) pada portal Texora.
 *
 * Referensi: RFC 4226 (HOTP) & RFC 6238 (TOTP).
 */

import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Encode buffer byte menjadi string Base32 (RFC 4648, tanpa padding). */
export function base32Encode(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/** Decode string Base32 menjadi buffer byte. */
export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generate secret acak 20 byte (160 bit) dalam format Base32.
 * Panjang ini direkomendasikan oleh RFC 4226 §4 (shared secret minimum 160 bit).
 */
export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes));
}

/** Hitung kode TOTP pada timestep tertentu (Unix epoch seconds). */
export function generateTotpCode(
  secret: string,
  counter: number = Math.floor(Date.now() / 1000 / 30)
): string {
  const key = base32Decode(secret);

  // Counter sebagai 8 byte big-endian
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto.createHmac("sha1", key).update(buf).digest();

  // Dynamic truncation (RFC 4226 §5.3)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1000000).padStart(6, "0");
}

/**
 * Verifikasi kode TOTP dengan toleransi window.
 * window = 1 berarti menerima timestep [-1, 0, +1] (maks ±30 detik drift).
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  window = 1
): boolean {
  const normalized = String(code || "").replace(/\D/g, "");
  if (normalized.length !== 6) return false;

  const current = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const expected = generateTotpCode(secret, current + i);
    // Perbandingan constant-time untuk mencegah timing attack
    if (
      expected.length === normalized.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Bangun URI otpauth:// untuk QR code Google Authenticator / Authy / 1Password.
 */
export function buildOtpAuthUri(
  secret: string,
  accountEmail: string,
  issuer = "PT. Texora Visi Prima"
): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Generate 10 kode cadangan (backup codes) format 10 digit.
 *
 * PENTING: fungsi ini mengembalikan kode DALAM format tersimpan (tanpa dash).
 * Tampilan berformat "XXXX-XXXX" dibuat terpisah di UI. Hash bcrypt harus
 * dibuat dari nilai yang sudah dinormalisasi (lihat `normalizeBackupCode`),
 * jika tidak kode tidak akan pernah cocok saat verifikasi.
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomInt(0, 100000000).toString().padStart(8, "0"));
  }
  return codes;
}

/**
 * Format kode cadangan untuk ditampilkan ke pengguna: "12345678" -> "1234-5678".
 */
export function formatBackupCode(code: string): string {
  const clean = normalizeBackupCode(code);
  if (clean.length !== 8) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

/** Normalisasi kode cadangan: uppercase, hapus spasi & tanda hubung. */
export function normalizeBackupCode(code: string): string {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
