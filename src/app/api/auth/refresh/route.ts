import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashPassword,
  comparePassword,
  setAuthCookies,
  clearAuthCookies,
  TokenPayload,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const refreshTokenCookie = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json(
        { success: false, error: "Refresh token tidak ditemukan." },
        { status: 401 }
      );
    }

    // Verify token validity
    const decoded = verifyRefreshToken(refreshTokenCookie);
    if (!decoded || !decoded.sub) {
      const response = NextResponse.json(
        { success: false, error: "Refresh token tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Lookup user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.refreshToken) {
      const response = NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan atau telah dicabut." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Validate refresh token matches stored hash
    const isTokenValid = await comparePassword(refreshTokenCookie, user.refreshToken);
    if (!isTokenValid) {
      // Possible token reuse / breach: revoke token in DB
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      const response = NextResponse.json(
        { success: false, error: "Token reuse terdeteksi. Sesi dibatalkan demi keamanan." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as TokenPayload["role"],
      companyName: user.companyName,
    };

    // Rotate tokens (Issue new access token and rotated refresh token)
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // Update rotated refresh token hash in DB
    const newHashedRefreshToken = await hashPassword(newRefreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newHashedRefreshToken },
    });

    const response = NextResponse.json({
      success: true,
      message: "Token berhasil diperbarui.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });

    setAuthCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui token autentikasi." },
      { status: 500 }
    );
  }
}
