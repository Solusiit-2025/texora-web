import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMenuAccessMap } from "@/lib/rbac/menu-store";
import { getRoleDefinitionById, resolveUserRoleId } from "@/lib/rbac/role-store";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  getCookieOptions,
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  TokenPayload,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    let payload = accessToken ? verifyAccessToken(accessToken) : null;

    // If access token is missing or expired, attempt fallback with refresh token
    if (!payload) {
      if (refreshToken) {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        if (decodedRefresh?.sub) {
          const user = await prisma.user.findUnique({
            where: { id: decodedRefresh.sub },
          });

          if (user && user.refreshToken) {
            const effectiveRole = await resolveUserRoleId(user.id, user.role);
            const roleDef = await getRoleDefinitionById(effectiveRole);
            const menuMap = await getMenuAccessMap();

            payload = {
              sub: user.id,
              email: user.email,
              name: user.name,
              role: effectiveRole,
              companyName: user.companyName,
              dash: roleDef?.defaultRoute,
              menu: menuMap[effectiveRole] ?? [],
            };

            // Issue new access token silently
            const newAccessToken = signAccessToken(payload);
            const response = NextResponse.json({
              authenticated: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: effectiveRole,
                companyName: user.companyName,
                dash: roleDef?.defaultRoute,
              },
              menuIds: payload.menu ?? [],
            });
            response.cookies.set(
              ACCESS_COOKIE_NAME,
              newAccessToken,
              getCookieOptions("access")
            );
            response.cookies.set(
              REFRESH_COOKIE_NAME,
              refreshToken,
              getCookieOptions("refresh")
            );
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

    // Sinkronkan klaim peran & menu pada access token dengan konfigurasi terbaru,
    // sehingga perubahan di Role & Menu Management langsung berlaku.
    const effectiveRole = await resolveUserRoleId(user.id, user.role);
    const roleDef = await getRoleDefinitionById(effectiveRole);
    const menuMap = await getMenuAccessMap();
    const menuIds = menuMap[effectiveRole] ?? [];

    const refreshedPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      companyName: user.companyName,
      dash: roleDef?.defaultRoute,
      menu: menuIds,
    };

    const response = NextResponse.json({
      authenticated: true,
      user: { ...user, role: effectiveRole, dash: roleDef?.defaultRoute },
      menuIds,
    });

    response.cookies.set(
      ACCESS_COOKIE_NAME,
      signAccessToken(refreshedPayload),
      getCookieOptions("access")
    );
    if (refreshToken) {
      response.cookies.set(
        REFRESH_COOKIE_NAME,
        refreshToken,
        getCookieOptions("refresh")
      );
    }

    return response;
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}
