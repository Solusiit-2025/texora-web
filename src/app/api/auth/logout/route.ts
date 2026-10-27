import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
  clearAuthCookies,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const refreshTokenCookie = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshTokenCookie) {
      const decoded = verifyRefreshToken(refreshTokenCookie);
      if (decoded?.sub) {
        // Clear refresh token in database
        await prisma.user.update({
          where: { id: decoded.sub },
          data: { refreshToken: null },
        }).catch(() => {});

        await writeAuditLog({
          action: "LOGOUT",
          userId: decoded.sub,
          description: `Logout dari portal (${decoded.email || "tanpa email"}).`,
          request: req,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Berhasil logout. Sesi dihapus.",
    });

    clearAuthCookies(response);
    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    const response = NextResponse.json({
      success: true,
      message: "Berhasil logout.",
    });
    clearAuthCookies(response);
    return response;
  }
}
