import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  setAuthCookies,
  TokenPayload,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
    let payload = accessToken ? verifyAccessToken(accessToken) : null;

    // If access token is missing or expired, attempt fallback with refresh token
    if (!payload) {
      const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
      if (refreshToken) {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        if (decodedRefresh?.sub) {
          const user = await prisma.user.findUnique({
            where: { id: decodedRefresh.sub },
          });

          if (user && user.refreshToken) {
            payload = {
              sub: user.id,
              email: user.email,
              name: user.name,
              role: user.role as TokenPayload["role"],
              companyName: user.companyName,
            };

            // Issue new access token silently
            const newAccessToken = signAccessToken(payload);
            const response = NextResponse.json({
              authenticated: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
              },
            });
            setAuthCookies(response, newAccessToken, refreshToken);
            return response;
          }
        }
      }

      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Lookup fresh user info from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        phoneNumber: true,
        taxId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}
