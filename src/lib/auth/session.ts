import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveUserRoleId } from "@/lib/rbac/role-store";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "./cookies";
import { verifyAccessToken, verifyRefreshToken, TokenPayload } from "./jwt";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  /** Kunci peran efektif (termasuk role custom). */
  role: string;
  companyName: string | null;
  phoneNumber?: string | null;
}

/**
 * Extracts and verifies the current authenticated user from request cookies.
 * Supports both NextRequest and standard Node/Next cookies().
 */
export async function getAuthenticatedUser(
  req?: NextRequest
): Promise<AuthenticatedUser | null> {
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  if (req) {
    accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
    refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
      refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    } catch {
      // Ignore if called outside of request context
    }
  }

  // 1. Verify Access Token
  let payload: TokenPayload | null = accessToken
    ? verifyAccessToken(accessToken)
    : null;

  // 2. Fallback to Refresh Token
  if (!payload && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (refreshPayload?.sub) {
      payload = refreshPayload;
    }
  }

  if (!payload?.sub) {
    return null;
  }

  // 3. Fetch up-to-date user from PostgreSQL
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        phoneNumber: true,
      },
    });

    if (!user) return null;

    // Peran efektif: override role custom > kolom enum `role`
    const effectiveRole = await resolveUserRoleId(user.id, user.role);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      companyName: user.companyName,
      phoneNumber: user.phoneNumber,
    };
  } catch (err) {
    console.error("Failed to query authenticated user:", err);
    return null;
  }
}
