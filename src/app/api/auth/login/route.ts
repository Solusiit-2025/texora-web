import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  getDefaultDashboard,
  TokenPayload,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: "Akun dengan email tersebut tidak ditemukan." },
        { status: 401 }
      );
    }

    // Verify Password
    let passwordMatches = false;
    if (user.passwordHash) {
      passwordMatches = await comparePassword(password, user.passwordHash);
    } else {
      // Default fallback password for initial seeded demo accounts
      const isDefaultMatch = password === "Texora2026!" || password === "Admin@Texora2026!" || password === "Sales@Texora2026!" || password === "Gudang@Texora2026!" || password === "Customer@Texora2026!";
      if (isDefaultMatch) {
        passwordMatches = true;
        // Auto-hash and save to DB
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
      }
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as TokenPayload["role"],
      companyName: user.companyName,
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

    const redirectTo = getDefaultDashboard(user.role as any);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
      redirectTo,
    });

    // Set HttpOnly Secure Cookies
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat autentikasi." },
      { status: 500 }
    );
  }
}
