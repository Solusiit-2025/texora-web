import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  TokenPayload,
} from "@/lib/auth";
import { getClientIp } from "@/lib/client-ip";

export const dynamic = "force-dynamic";

// Rate limit registrasi (per IP) — mencegah bot membuat akun massal.
const REGISTER_WINDOW_MS =
  Number(process.env.REGISTER_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000; // 1 jam
const REGISTER_MAX = Number(process.env.REGISTER_RATE_LIMIT_MAX) || 5;
const registerRateLimit = new Map<string, { count: number; resetAt: number }>();

function tooManyRegistrations(ip: string): { blocked: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = registerRateLimit.get(ip);
  if (!entry || now > entry.resetAt) return { blocked: false };
  if (entry.count >= REGISTER_MAX) {
    return { blocked: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { blocked: false };
}

function recordRegistration(ip: string): void {
  const now = Date.now();
  const entry = registerRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    // Bersihkan entri kedaluwarsa sesekali agar map tidak tumbuh tanpa batas.
    if (registerRateLimit.size > 5000) {
      for (const key of Array.from(registerRateLimit.keys())) {
        const value = registerRateLimit.get(key);
        if (value && now > value.resetAt) registerRateLimit.delete(key);
      }
    }
    registerRateLimit.set(ip, { count: 1, resetAt: now + REGISTER_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = tooManyRegistrations(ip);
  if (limit.blocked) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak pendaftaran dari jaringan ini. Coba lagi dalam ${limit.retryAfter} detik.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      fullName,
      companyName,
      businessType,
      email,
      phone,
      taxId,
      password,
    } = body;

    // 1. Validasi Keberadaan Input Utama
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama penanggung jawab, email bisnis, nomor WhatsApp, dan kata sandi wajib diisi.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid. Harap masukkan email yang benar." },
        { status: 400 }
      );
    }

    // 2. Validasi Nomor Telepon / WhatsApp
    const cleanPhone = String(phone).replace(/[^0-9+]/g, "").trim();
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor WhatsApp harus valid (antara 10 hingga 15 digit angka).",
        },
        { status: 400 }
      );
    }

    // 3. Validasi Kekuatan Password
    if (String(password).length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Kata sandi terlalu pendek. Gunakan minimal 8 karakter demi keamanan akun kemitraan Anda.",
        },
        { status: 400 }
      );
    }

    // 4. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ini sudah terdaftar sebagai mitra XoraMateria. Silakan masuk melalui halaman login.",
        },
        { status: 409 }
      );
    }

    // 5. Enkripsi Kata Sandi (Bcrypt)
    const passwordHash = await hashPassword(password);

    // Catat percobaan registrasi yang valid (dihitung untuk rate limit).
    recordRegistration(ip);

    // 6. Buat Akun Pengguna Baru di PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: String(fullName).trim(),
        email: cleanEmail,
        passwordHash,
        phoneNumber: cleanPhone,
        companyName: companyName ? String(companyName).trim() : null,
        taxId: taxId ? String(taxId).trim() : null,
        role: "CUSTOMER",
      },
    });

    // 7. Otomatis Teruskan ke Modul CRM Leads untuk Tim Sales
    try {
      await prisma.lead.create({
        data: {
          title: `Pendaftaran Kemitraan B2B - ${companyName ? String(companyName).trim() : String(fullName).trim()}`,
          customerId: newUser.id,
          contactPerson: String(fullName).trim(),
          companyName: companyName ? String(companyName).trim() : null,
          email: cleanEmail,
          phone: cleanPhone,
          fabricInterest: businessType || "Sportswear & Sublimasi",
          stage: "NEW_INQUIRY",
          notes: `Pendaftaran mandiri melalui portal website (Storefront B2B). Sektor bisnis: ${businessType || "Kemitraan Tekstil"} | NPWP: ${taxId || "Belum dilampirkan"}`,
        },
      });
    } catch (leadError) {
      console.warn("Gagal membuat lead otomatis di CRM (non-fatal):", leadError);
    }

    // 8. Generate JWT Access Token & Refresh Token untuk Auto-Login
    const payload: TokenPayload = {
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as TokenPayload["role"],
      companyName: newUser.companyName,
      menu: [],
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Simpan hashed refresh token ke DB
    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // 9. Terbitkan HttpOnly Secure Cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Akun bisnis berhasil didaftarkan. Selamat datang di XoraMateria!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          companyName: newUser.companyName,
        },
        redirectTo: "/customer/dashboard",
      },
      { status: 201 }
    );

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error: any) {
    console.error("Kesalahan API Registrasi:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Terjadi kesalahan pada server saat memproses pendaftaran akun.",
      },
      { status: 500 }
    );
  }
}
