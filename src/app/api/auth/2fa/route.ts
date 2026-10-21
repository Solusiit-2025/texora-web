import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import {
  generateTotpSecret,
  buildOtpAuthUri,
  verifyTotpCode,
  generateBackupCodes,
  normalizeBackupCode,
  formatBackupCode,
} from "@/lib/totp";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/2fa -> status 2FA pengguna saat ini
 * POST /api/auth/2fa -> aksi: setup | enable | disable | regenerate-codes
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorEnabledAt: true,
        twoFactorBackupCodes: true,
      },
    });

    const remainingCodes = record?.twoFactorBackupCodes
      ? JSON.parse(record.twoFactorBackupCodes).length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        enabled: record?.twoFactorEnabled === true,
        enabledAt: record?.twoFactorEnabledAt || null,
        remainingBackupCodes: record?.twoFactorEnabled ? remainingCodes : 0,
      },
    });
  } catch (error: any) {
    console.error("[2fa] Gagal memuat status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat status 2FA." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;
    const code = body?.code;
    const password = body?.password;

    // ---------------- SETUP: buat secret + QR (belum aktif) ----------------
    if (action === "setup") {
      const secret = generateTotpSecret();
      const otpauth = buildOtpAuthUri(secret, user.email);
      const qrDataUrl = await QRCode.toDataURL(otpauth, {
        width: 260,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });

      // Simpan secret sementara (twoFactorEnabled masih false)
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret, twoFactorEnabled: false },
      });

      await prisma.auditLog.create({
        data: {
          action: "2FA_SETUP_INITIATED",
          userId: user.id,
          description: `Memulai proses aktivasi 2FA untuk ${user.email}.`,
        },
      });

      return NextResponse.json({
        success: true,
        data: { secret, otpauth, qrDataUrl },
      });
    }

    // ---------------- ENABLE: verifikasi kode TOTP ----------------
    if (action === "enable") {
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
      });

      if (!record?.twoFactorSecret) {
        return NextResponse.json(
          { success: false, error: "Silakan jalankan langkah setup terlebih dahulu." },
          { status: 400 }
        );
      }

      if (!code || String(code).trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: "Masukkan 6 digit kode dari aplikasi autentikator." },
          { status: 400 }
        );
      }

      if (!verifyTotpCode(record.twoFactorSecret, String(code).trim())) {
        await prisma.auditLog.create({
          data: {
            action: "2FA_ENABLE_FAILED",
            userId: user.id,
            description: `Verifikasi kode TOTP gagal untuk ${user.email}.`,
          },
        });
        return NextResponse.json(
          { success: false, error: "Kode tidak valid atau sudah kedaluwarsa. Coba lagi." },
          { status: 400 }
        );
      }

      // Generate kode cadangan (10 buah) - plaintext hanya ditampilkan sekali
      // Hash dibuat dari kode yang sudah dinormalisasi (tanpa dash) agar cocok saat verifikasi.
      const plainCodes = generateBackupCodes(10);
      const hashedCodes = await Promise.all(
        plainCodes.map((c) => hashPassword(normalizeBackupCode(c)))
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorEnabledAt: new Date(),
          twoFactorBackupCodes: JSON.stringify(hashedCodes),
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "2FA_ENABLED",
          userId: user.id,
          description: `2FA berhasil diaktifkan untuk ${user.email}.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Autentikasi dua faktor berhasil diaktifkan.",
        data: { backupCodes: plainCodes.map(formatBackupCode) },
      });
    }

    // ---------------- DISABLE: butuh password + kode TOTP ----------------
    if (action === "disable") {
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true,
          passwordHash: true,
        },
      });

      if (!record?.twoFactorEnabled) {
        return NextResponse.json(
          { success: false, error: "2FA belum aktif pada akun ini." },
          { status: 400 }
        );
      }

      if (!password) {
        return NextResponse.json(
          { success: false, error: "Masukkan password akun Anda." },
          { status: 400 }
        );
      }

      const passwordOk = record.passwordHash
        ? await comparePassword(String(password), record.passwordHash)
        : false;

      if (!passwordOk) {
        return NextResponse.json(
          { success: false, error: "Password salah." },
          { status: 401 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { success: false, error: "Masukkan kode 6 digit dari aplikasi autentikator." },
          { status: 400 }
        );
      }

      if (!record.twoFactorSecret || !verifyTotpCode(record.twoFactorSecret, String(code).trim())) {
        return NextResponse.json(
          { success: false, error: "Kode TOTP tidak valid." },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
          twoFactorEnabledAt: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "2FA_DISABLED",
          userId: user.id,
          description: `2FA dinonaktifkan untuk ${user.email}.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Autentikasi dua faktor telah dinonaktifkan.",
      });
    }

    // ---------------- REGENERATE BACKUP CODES ----------------
    if (action === "regenerate-codes") {
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { twoFactorEnabled: true, twoFactorSecret: true },
      });

      if (!record?.twoFactorEnabled || !record.twoFactorSecret) {
        return NextResponse.json(
          { success: false, error: "2FA belum aktif pada akun ini." },
          { status: 400 }
        );
      }

      if (!code || !verifyTotpCode(record.twoFactorSecret, String(code).trim())) {
        return NextResponse.json(
          { success: false, error: "Kode TOTP tidak valid." },
          { status: 400 }
        );
      }

      const plainCodes = generateBackupCodes(10);
      const hashedCodes = await Promise.all(
        plainCodes.map((c) => hashPassword(normalizeBackupCode(c)))
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: JSON.stringify(hashedCodes) },
      });

      await prisma.auditLog.create({
        data: {
          action: "2FA_BACKUP_CODES_REGENERATED",
          userId: user.id,
          description: `Kode cadangan 2FA dibuat ulang untuk ${user.email}.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Kode cadangan baru berhasil dibuat.",
        data: { backupCodes: plainCodes.map(formatBackupCode) },
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenal." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[2fa] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Terjadi kesalahan pada proses 2FA." },
      { status: 500 }
    );
  }
}
