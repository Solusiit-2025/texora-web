import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMenuAccessMap } from "@/lib/rbac/menu-store";
import { getRoleDefinitionById, resolveUserRoleId } from "@/lib/rbac/role-store";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  getDefaultDashboard,
  TokenPayload,
} from "@/lib/auth";
import { signTwoFactorChallenge } from "@/lib/auth/2fa-challenge";
import { getClientIp } from "@/lib/client-ip";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter (per IP). Catatan: untuk multi-instance gunakan Redis/Upstash.
const RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 menit
// Maks percobaan login GAGAL per IP per window. Default 5 (aman untuk produksi).
// Bisa dinaikkan lewat env untuk environment testing/automation.
const RATE_LIMIT_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Periksa apakah IP sedang diblokir.
 *
 * PENTING: hanya login yang GAGAL yang dihitung. Versi lama menghitung
 * semua percobaan, sehingga admin yang login rutin (atau test suite yang
 * login berkali-kali) ikut terkunci 429 padahal tidak ada serangan.
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

/** Catat satu percobaan login gagal. */
function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

/** Login berhasil -> reset penghitung (tidak perlu diblokir). */
function resetFailedAttempts(ip: string): void {
  rateLimitMap.delete(ip);
}

export async function POST(req: NextRequest) {
  // IP dari header yang tidak bisa dipalsukan klien (lihat src/lib/client-ip.ts).
  const ip = getClientIp(req);

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${rl.retryAfter} detik.`,
      },
      { status: 429 }
    );
  }
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Query user from PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        description: `Percobaan login gagal: email ${cleanEmail} tidak ditemukan.`,
        request: req,
      });
      recordFailedAttempt(ip);
      // Pesan generik: jangan bocorkan apakah email terdaftar (anti-enumeration).
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Verify Password
    let passwordMatches = false;
    if (user.passwordHash) {
      passwordMatches = await comparePassword(password, user.passwordHash);
    } else {
      // Backdoor password default HANYA boleh aktif untuk dev/demo lokal atau
      // bila admin sengaja menyalakannya. Di produksi default-nya MATI, supaya
      // password yang tertanam di kode tidak bisa dipakai siapa pun.
      const allowDemoDefaults =
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_DEFAULT_DEMO_PASSWORDS === "true";

      if (allowDemoDefaults) {
        const defaults = [
          "XoraMateria2026!",
          "Admin@XoraMateria2026!",
          "Sales@XoraMateria2026!",
          "Gudang@XoraMateria2026!",
          "Customer@XoraMateria2026!",
        ];
        if (defaults.includes(password)) {
          passwordMatches = true;
          // Auto-hash and save to DB
          const newHash = await hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
        }
      } else {
        console.warn(
          `[auth] Login ditolak: akun ${cleanEmail} belum memiliki password. Setel password via scripts/reset-password.mjs.`
        );
      }
    }

    if (!passwordMatches) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        description: `Percobaan login gagal untuk ${cleanEmail} (password tidak cocok / akun belum punya password).`,
        userId: user.id,
        request: req,
      });
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Login berhasil -> jangan hitung sebagai percobaan bermasalah
    resetFailedAttempts(ip);

    // Peran efektif (mendukung role custom) + halaman tujuan dari definisi role
    const effectiveRole = await resolveUserRoleId(user.id, user.role);
    const roleDef = await getRoleDefinitionById(effectiveRole);
    const menuMap = await getMenuAccessMap();

    // ==========================================================
    // TAHAP 2FA - Kode TOTP / Kode Cadangan wajib diverifikasi
    // ==========================================================
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const challengeToken = signTwoFactorChallenge({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        companyName: user.companyName,
        dash: roleDef?.defaultRoute,
        menu: menuMap[effectiveRole] ?? [],
        purpose: "2fa",
      });

      await writeAuditLog({
        action: "LOGIN_2FA_CHALLENGE",
        userId: user.id,
        description: `Password benar untuk ${cleanEmail}, menunggu verifikasi 2FA.`,
        request: req,
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        challengeToken,
        message: "Kode verifikasi dua faktor diperlukan.",
      });
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      companyName: user.companyName,
      dash: roleDef?.defaultRoute,
      menu: menuMap[effectiveRole] ?? [],
    };

    // Issue tokens
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save hashed refresh token to DB for revocation support
    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const redirectTo = roleDef?.defaultRoute ?? getDefaultDashboard(effectiveRole);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        companyName: user.companyName,
      },
      redirectTo,
    });

    // Set HttpOnly Secure Cookies
    setAuthCookies(response, accessToken, refreshToken);

    // Jejak audit: siapa masuk, kapan, dari IP/perangkat apa.
    await writeAuditLog({
      action: "LOGIN_SUCCESS",
      userId: user.id,
      description: `Login berhasil sebagai ${effectiveRole} (${user.email}).`,
      request: req,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat autentikasi." },
      { status: 500 }
    );
  }
}
