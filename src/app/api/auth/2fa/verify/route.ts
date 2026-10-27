import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { verifyTwoFactorChallenge } from "@/lib/auth/2fa-challenge";
import { verifyTotpCode, normalizeBackupCode } from "@/lib/totp";
import { getClientIp } from "@/lib/client-ip";

export const dynamic = "force-dynamic";

// Rate limit khusus verifikasi 2FA (per IP) - mencegah brute force kode 6 digit
const RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.LOGIN_RATE_LIMIT_2FA_MAX) || 8;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

/**
 * POST /api/auth/2fa/verify
 * Verifikasi kode TOTP (6 digit) atau kode cadangan (10 digit) lalu terbitkan sesi.
 */
export async function POST(req: NextRequest) {
  // IP dari header yang tidak bisa dipalsukan klien (lihat src/lib/client-ip.ts).
  const ip = getClientIp(req);

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan verifikasi. Coba lagi dalam ${rl.retryAfter} detik.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const { challengeToken, code, useBackupCode } = body || {};

    if (!challengeToken || !code) {
      return NextResponse.json(
        { success: false, error: "Token verifikasi dan kode wajib diisi." },
        { status: 400 }
      );
    }

    const challenge = verifyTwoFactorChallenge(String(challengeToken));
    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesi verifikasi tidak valid atau sudah kedaluwarsa. Silakan login kembali.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: challenge.sub },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { success: false, error: "2FA tidak aktif pada akun ini. Silakan login kembali." },
        { status: 400 }
      );
    }

    let verified = false;
    let usedBackupIndex = -1;

    if (useBackupCode) {
      // Verifikasi kode cadangan (bcrypt hash)
      const hashes: string[] = user.twoFactorBackupCodes
        ? JSON.parse(user.twoFactorBackupCodes)
        : [];
      const normalized = normalizeBackupCode(String(code));

      for (let i = 0; i < hashes.length; i++) {
        if (await comparePassword(normalized, hashes[i])) {
          verified = true;
          usedBackupIndex = i;
          break;
        }
      }

      if (!verified) {
        await prisma.auditLog.create({
          data: {
            action: "LOGIN_2FA_FAILED",
            userId: user.id,
            description: `Kode cadangan 2FA salah untuk ${user.email}.`,
          },
        });
        return NextResponse.json(
          { success: false, error: "Kode cadangan salah atau sudah pernah dipakai." },
          { status: 401 }
        );
      }
    } else {
      verified = verifyTotpCode(user.twoFactorSecret, String(code).trim());
      if (!verified) {
        await prisma.auditLog.create({
          data: {
            action: "LOGIN_2FA_FAILED",
            userId: user.id,
            description: `Kode TOTP salah untuk ${user.email}.`,
          },
        });
        return NextResponse.json(
          { success: false, error: "Kode verifikasi salah atau sudah kedaluwarsa." },
          { status: 401 }
        );
      }
    }

    // Kode cadangan yang dipakai dihapus agar tidak bisa dipakai ulang
    if (usedBackupIndex >= 0 && user.twoFactorBackupCodes) {
      const hashes: string[] = JSON.parse(user.twoFactorBackupCodes);
      hashes.splice(usedBackupIndex, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: JSON.stringify(hashes) },
      });
    }

    // Terbitkan sesi penuh
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: challenge.role,
      companyName: user.companyName,
      dash: challenge.dash,
      menu: challenge.menu ?? [],
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const hashedRefreshToken = await hashPassword(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOGIN_SUCCESS",
        userId: user.id,
        description: `Login berhasil (2FA terverifikasi${usedBackupIndex >= 0 ? " via kode cadangan" : ""}) untuk ${user.email}.`,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: challenge.role,
        companyName: user.companyName,
      },
      redirectTo: challenge.dash || "/portal/dashboard",
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error: any) {
    console.error("[2fa verify] Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat verifikasi 2FA." },
      { status: 500 }
    );
  }
}
