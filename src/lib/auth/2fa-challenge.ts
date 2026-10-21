/**
 * Token sementara (challenge) untuk tahap verifikasi 2FA saat login.
 *
 * Token ini SANGAT pendek masa berlaku (default 5 menit) dan TIDAK memberi
 * akses ke portal - hanya membuktikan bahwa password sudah benar sehingga
 * server boleh memverifikasi kode TOTP / kode cadangan.
 */

import jwt from "jsonwebtoken";

const CHALLENGE_SECRET =
  process.env.JWT_2FA_SECRET || "texora_jwt_2fa_challenge_secret_secure_key_2026_z77";
const CHALLENGE_EXPIRES_IN = process.env.JWT_2FA_EXPIRES_IN || "5m";

export interface TwoFactorChallengePayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: string;
  companyName?: string | null;
  dash?: string;
  menu?: string[];
  /** Tandai token ini hanya untuk verifikasi 2FA. */
  purpose: "2fa";
}

export function signTwoFactorChallenge(payload: TwoFactorChallengePayload): string {
  return jwt.sign(payload, CHALLENGE_SECRET, {
    expiresIn: CHALLENGE_EXPIRES_IN as any,
  });
}

export function verifyTwoFactorChallenge(
  token: string
): TwoFactorChallengePayload | null {
  try {
    const decoded = jwt.verify(token, CHALLENGE_SECRET) as TwoFactorChallengePayload;
    if (decoded?.purpose !== "2fa" || !decoded.sub) return null;
    return decoded;
  } catch {
    return null;
  }
}
