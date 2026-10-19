import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "./lib/auth/cookies";
import { verifyAccessTokenEdge, verifyRefreshTokenEdge } from "./lib/auth/edge";
import { isRouteAllowed, getDefaultDashboard, UserRole } from "./lib/auth/rbac";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  // 1. Verify access token (or fallback to refresh token)
  let userPayload = accessToken ? await verifyAccessTokenEdge(accessToken) : null;

  if (!userPayload && refreshToken) {
    userPayload = await verifyRefreshTokenEdge(refreshToken);
  }

  const isAuthenticated = Boolean(userPayload);

  // 2. Handling Guest-Only Pages (/login, /register)
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated && userPayload) {
      const redirectParam = req.nextUrl.searchParams.get("redirect");
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        return NextResponse.redirect(new URL(redirectParam, req.url));
      }
      const redirectUrl = new URL(getDefaultDashboard(userPayload.role), req.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 3. Protected Portal Routes (/portal/*)
  if (pathname.startsWith("/portal")) {
    if (!isAuthenticated || !userPayload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC: Check if role has access to portal at all
    if (userPayload.role === "CUSTOMER") {
      const customerUrl = new URL("/customer/dashboard", req.url);
      customerUrl.searchParams.set("error", "unauthorized_portal");
      return NextResponse.redirect(customerUrl);
    }

    // RBAC: Check specific sub-route permission within portal
    const allowed = isRouteAllowed(pathname, userPayload.role);
    if (!allowed) {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("from", pathname);
      unauthorizedUrl.searchParams.set("role", userPayload.role);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Add user headers for downstream server components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", userPayload.sub);
    requestHeaders.set("x-user-role", userPayload.role);
    requestHeaders.set("x-user-email", userPayload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Protected Customer Routes (/customer/*)
  if (pathname.startsWith("/customer")) {
    if (!isAuthenticated || !userPayload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const allowed = isRouteAllowed(pathname, userPayload.role);
    if (!allowed) {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", userPayload.sub);
    requestHeaders.set("x-user-role", userPayload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5. Protected E-Commerce & Transaction Routes (/custom-sublimation, /checkout, /cart, /track-order)
  if (
    pathname.startsWith("/custom-sublimation") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/track-order")
  ) {
    if (!isAuthenticated || !userPayload) {
      const fullRedirectPath = req.nextUrl.pathname + req.nextUrl.search;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", fullRedirectPath);
      loginUrl.searchParams.set("reason", "auth_required");
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", userPayload.sub);
    requestHeaders.set("x-user-role", userPayload.role);
    requestHeaders.set("x-user-email", userPayload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/customer/:path*",
    "/custom-sublimation/:path*",
    "/custom-sublimation",
    "/checkout/:path*",
    "/checkout",
    "/cart/:path*",
    "/cart",
    "/track-order/:path*",
    "/track-order",
    "/login",
    "/register",
  ],
};
