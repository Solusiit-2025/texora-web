import { NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "tokenauth";
export const REFRESH_COOKIE_NAME = "tokenrefresh";

// Helper cookie options
export function getCookieOptions(type: "access" | "refresh") {
  // In production Secure is always true. In development, defaults to false for localhost HTTP
  const isProd = process.env.NODE_ENV === "production";
  const forceSecure = process.env.COOKIE_SECURE === "true";
  const secure = isProd || forceSecure;

  return {
    httpOnly: true,
    secure: secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: type === "access" ? 15 * 60 : 7 * 24 * 60 * 60, // 15 mins vs 7 days
  };
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, getCookieOptions("access"));
  res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions("refresh"));
  return res;
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...getCookieOptions("access"),
    maxAge: 0,
  });
  res.cookies.set(REFRESH_COOKIE_NAME, "", {
    ...getCookieOptions("refresh"),
    maxAge: 0,
  });
  return res;
}
