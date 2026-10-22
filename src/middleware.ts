import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "./lib/auth/cookies";
import { verifyAccessTokenEdge, verifyRefreshTokenEdge } from "./lib/auth/edge";
import { isRouteAllowed, getDefaultDashboard, isMenuDenied, UserRole } from "./lib/auth/rbac";

/* ==========================================================================
   REDIRECT MANAGER (SEO)
   Peta redirect diambil dari route handler publik & di-cache 5 menit agar
   tidak menambah latency pada setiap request. Edge runtime tidak bisa
   mengakses Prisma secara langsung.
   ========================================================================== */

interface EdgeRedirectRule {
  from: string;
  to: string;
  type: "301" | "302" | "307" | "308";
}

// TTL cache peta redirect. 60 detik dipilih agar perubahan dari dashboard
// CMS langsung terasa (maks 1 menit), tanpa membebani server dengan fetch
// pada setiap request (cache disimpan per-instance, bukan per-request).
const REDIRECT_CACHE_TTL_MS = 60 * 1000;
let redirectCache: { rules: EdgeRedirectRule[]; fetchedAt: number } | null = null;
let redirectFetchInFlight: Promise<EdgeRedirectRule[]> | null = null;

/**
 * Cache peta hak akses menu per role (dipakai untuk guarding route portal).
 *
 * Kenapa tidak cukup pakai klaim `menu` di JWT?
 *  - Klaim JWT dibuat saat login -> kalau admin mengubah Role & Menu
 *    Management, akses route portal masih TERBUKA sampai user login ulang
 *    (bisa 30-60 menit).
 *  - Menu di sidebar sendiri diambil dari DB (via /api/rbac/menu?scope=me),
 *    jadi sidebar & route guard bisa berbeda -> membingungkan.
 *
 * Solusi: middleware mengambil peta menu FRESH dari API publik (di-cache
 * CDN 60 detik + cache memory di edge). Bila API tidak terjangkau, fallback
 * ke klaim JWT (fail open, tidak memblokir user yang sah).
 */
const MENU_CACHE_TTL_MS = 60 * 1000;
let menuCache: {
  byRole: Record<string, string[]>;
  fetchedAt: number;
} | null = null;
let menuFetchInFlight: Promise<Record<string, string[]>> | null = null;

async function getRoleMenuIds(
  origin: string,
  role: string
): Promise<string[] | null> {
  const now = Date.now();
  if (menuCache && now - menuCache.fetchedAt < MENU_CACHE_TTL_MS) {
    return menuCache.byRole[role] ?? null;
  }

  if (!menuFetchInFlight) {
    menuFetchInFlight = fetch(
      `${origin}/api/rbac/menu?public=1&role=${encodeURIComponent(role)}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const ids: string[] = Array.isArray(json?.data?.menuIds)
          ? json.data.menuIds
          : [];
        menuCache = { byRole: { [role]: ids }, fetchedAt: Date.now() };
        return { [role]: ids };
      })
      .catch(() => {
        menuCache = { byRole: {}, fetchedAt: Date.now() };
        return {} as Record<string, string[]>;
      })
      .finally(() => {
        menuFetchInFlight = null;
      });
  }

  const map = await menuFetchInFlight;
  return map[role] ?? null;
}

/**
 * Cache "slug artikel tidak ada" per instance.
 *
 * Dipakai middleware untuk mengembalikan 404 yang SEBENARNYA (bukan 200
 * "soft 404") untuk artikel yang tidak dipublikasikan. Cache 60 detik
 * supaya tidak query DB pada setiap permintaan artikel.
 */
const ARTICLE_CHECK_TTL_MS = 60 * 1000;
const articleMissingCache = new Map<string, { missing: boolean; fetchedAt: number }>();

/**
 * Apakah path ini artikel yang tidak ada?
 *
 * Hanya untuk path "/artikel/<slug>". Non-artikel -> false.
 */
async function isMissingArticle(
  origin: string,
  path: string
): Promise<boolean> {
  const m = path.match(/^\/artikel\/([^/]+)$/);
  if (!m) return false;

  const slug = decodeURIComponent(m[1]);
  const now = Date.now();
  const hit = articleMissingCache.get(slug);
  if (hit && now - hit.fetchedAt < ARTICLE_CHECK_TTL_MS) {
    return hit.missing;
  }

  try {
    const res = await fetch(
      `${origin}/api/articles?check=1&slug=${encodeURIComponent(slug)}`
    );
    // Body harus dibaca APA ADANYA status (endpoint balas 404 kalau artikelnya
    // tidak ada, jadi res.ok = false di kasus yang justru kita cari).
    const json = await res.json().catch(() => null);
    const missing = json?.exists === false;
    articleMissingCache.set(slug, { missing, fetchedAt: now });
    return missing;
  } catch {
    // Gagal cek -> jangan blokir user (fail open)
    return false;
  }
}

/**
 * Respons 404 untuk artikel yang tidak ada.
 *
 * Render halaman not-found (tetap bagus untuk user) TETAPI dengan status
 * HTTP 404 yang benar -> Google tidak mengindeksnya.
 */
function notFoundResponse(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/not-found";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

function normalizePath(path: string): string {
  if (!path) return "/";
  let p = String(path).trim();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  return p || "/";
}

/**
 * Segmen yang boleh muncul setelah prefix bahasa (hanya halaman storefront).
 * Area privat (/portal, /customer, /api) & halaman noindex (login, register,
 * track-order, cart, checkout) TIDAK dilokalkan.
 */
const LOCALE_ALLOWED_SEGMENTS = [
  "catalog",
  "kategori",
  "about",
  "contact",
  "custom-sublimation",
  "request-quote",
  "artikel",
];

async function getRedirectRules(origin: string): Promise<EdgeRedirectRule[]> {  const now = Date.now();
  if (redirectCache && now - redirectCache.fetchedAt < REDIRECT_CACHE_TTL_MS) {
    return redirectCache.rules;
  }

  if (!redirectFetchInFlight) {
    redirectFetchInFlight = fetch(`${origin}/api/seo/redirects?public=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const rules: EdgeRedirectRule[] = Array.isArray(json?.data) ? json.data : [];
        redirectCache = { rules, fetchedAt: Date.now() };
        console.log(
          `[seo-redirect] Cache diperbarui: ${rules.length} rule dari ${origin}`
        );
        return rules;
      })
      .catch((err) => {
        // Fail open: jangan pernah blokir request bila API tidak terjangkau.
        console.warn(`[seo-redirect] Gagal fetch peta redirect: ${err?.message}`);
        redirectCache = { rules: [], fetchedAt: Date.now() };
        return [] as EdgeRedirectRule[];
      })
      .finally(() => {
        redirectFetchInFlight = null;
      });
  }

  return redirectFetchInFlight;
}

function matchRedirectRule(
  pathname: string,
  rules: EdgeRedirectRule[]
): EdgeRedirectRule | null {
  const path = normalizePath(pathname);

  const exact = rules.find((r) => normalizePath(r.from) === path);
  if (exact) return exact;

  for (const rule of rules) {
    const from = normalizePath(rule.from);
    if (from.endsWith("/*")) {
      const prefix = from.slice(0, -2);
      if (prefix && path.startsWith(prefix)) {
        const rest = path.slice(prefix.length);
        const to = rule.to.includes("*")
          ? rule.to.replace("*", rest)
          : `${normalizePath(rule.to)}${rest}`;
        return { ...rule, to };
      }
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. SEO Redirects (harus dicek sebelum auth & sebelum route match)
  if (req.method === "GET" && !pathname.startsWith("/api")) {
    const rules = await getRedirectRules(req.nextUrl.origin);
    if (rules.length > 0) {
      const rule = matchRedirectRule(pathname, rules);
      if (rule) {
        const target = /^https?:\/\//i.test(rule.to)
          ? rule.to
          : new URL(rule.to, req.url).toString();
        const status = Number(rule.type) || 301;
        const response = NextResponse.redirect(target, status);
        // Hapus canonical dari URL tujuan agar Google tidak mengindeks
        // URL lama (yang sudah dipindahkan).
        response.headers.set("X-Redirect-By", "xoramateria-seo-redirect");
        return response;
      }
    }
  }

  /* ==========================================================================
     0b. LOCALE ROUTING (SEO multi-bahasa — Tahap 2)
     URL bernuansa bahasa: /en/catalog, /de/about, /zh/kategori/...
     Middleware me-rewrite ke path asli + mengirim header `x-locale` sehingga
     server component me-render HTML dalam bahasa tsb (terjemahan cache DB).
     Hanya halaman storefront yang boleh; area privat/auth tidak dilokalkan.
     ========================================================================== */
  if (req.method === "GET") {
    const seg = pathname.match(/^\/(en|zh|ja|de|ar)(?=\/|$)/);
    if (seg) {
      const locale = seg[1];
      const rest = pathname.slice(locale.length + 1); // "" | "/" | "/catalog/xxx"

      // /de dan /de/ keduanya = home (tanpa redirect manual; Next.js sendiri
      // menangani normalisasi trailing slash). /de/catalog -> /catalog, dst.
      const clean = rest === "" || rest === "/" ? "/" : `/${rest.replace(/^\/+/, "")}`;
      const firstSegment =
        clean === "/" ? "" : clean.replace(/^\//, "").split("/")[0];

      if (clean === "/" || LOCALE_ALLOWED_SEGMENTS.includes(firstSegment)) {
        // Slug artikel yang tidak ada -> 404 SEBELUM render (bukan soft 404).
        const articleMissing = await isMissingArticle(req.nextUrl.origin, clean);
        if (articleMissing) {
          return notFoundResponse(req);
        }

        const url = req.nextUrl.clone();
        url.pathname = clean;
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-locale", locale);
        // Path tanpa prefix bahasa -> dipakai server component untuk
        // mengecek apakah halaman ini dinonaktifkan di CMS.
        requestHeaders.set("x-pathname", clean);
        return NextResponse.rewrite(url, {
          request: { headers: requestHeaders },
        });
      }

      // Prefix bahasa untuk area privat (mis. /en/login) -> 404 alami.
      return NextResponse.next();
    }
  }

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
      const redirectUrl = new URL(
        userPayload.dash ?? getDefaultDashboard(userPayload.role),
        req.url
      );
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

    // RBAC: Check specific sub-route permission within portal.
    // Jika token membawa klaim menu (Role & Menu Management aktif), peta menu
    // dinomis menjadi sumber kebenaran; selain itu pakai ROUTE_PERMISSIONS.
    const hasMenuClaim = Array.isArray(userPayload.menu);
    const allowed = hasMenuClaim
      ? true
      : isRouteAllowed(pathname, userPayload.role);

    if (!allowed) {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("from", pathname);
      unauthorizedUrl.searchParams.set("role", userPayload.role);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // RBAC Dinamis: menu yang disembunyikan pada Role & Menu Management
    // ikut memblokir akses URL langsung (bukan hanya disembunyikan di sidebar).
    // Prioritas: peta menu FRESH dari API (bisa saja admin baru saja
    // mengubahnya) -> baru fallback ke klaim JWT bila API tidak terjangkau.
    const freshMenuIds = await getRoleMenuIds(
      req.nextUrl.origin,
      userPayload.role
    );
    const effectiveMenuIds =
      freshMenuIds && freshMenuIds.length > 0
        ? freshMenuIds
        : userPayload.menu;

    const menuDenied = isMenuDenied(
      pathname,
      userPayload.role,
      effectiveMenuIds
    );
    if (menuDenied) {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("from", pathname);
      unauthorizedUrl.searchParams.set("role", userPayload.role);
      unauthorizedUrl.searchParams.set("reason", "menu_access_revoked");
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

    // Role custom dengan halaman awal portal pelanggan juga diizinkan di sini
    const dashAllowsCustomer =
      typeof userPayload.dash === "string" && userPayload.dash.startsWith("/customer");

    const allowed = isRouteAllowed(pathname, userPayload.role) || dashAllowsCustomer;
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

  // 0. Basic CSRF protection for mutating API requests (origin check)
  if (pathname.startsWith("/api")) {
    const method = req.method.toUpperCase();
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const exempt =
      pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/whatsapp");
    if (isMutating && !exempt) {
      const origin = req.headers.get("origin");
      const host = req.headers.get("host");
      let originHost = "";
      try {
        originHost = origin ? new URL(origin).host : "";
      } catch {
        originHost = "";
      }
      if (!originHost || originHost !== host) {
        return NextResponse.json(
          { success: false, error: "Permintaan tidak valid (CSRF)." },
          { status: 403 }
        );
      }
    }
    return NextResponse.next();
  }

  // 5. Protected E-Commerce & Transaction Routes (/checkout, /cart)
  // Catatan: /custom-sublimation & /track-order tidak lagi diproteksi di middleware
  // agar fitur aktif/nonaktif halaman (PageGate) dapat berjalan dulu.
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/cart")
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

  // Halaman publik: teruskan pathname (tanpa prefix bahasa) ke server
  // component supaya modul yang dinonaktifkan di CMS bisa diblokir
  // di sisi server (status 404), bukan hanya disembunyikan di menu.
  {
    // Artikel yang tidak ada -> 404 asli (bukan soft 404)
    const articleMissing = await isMissingArticle(req.nextUrl.origin, pathname);
    if (articleMissing) {
      return notFoundResponse(req);
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
}

export const config = {
  matcher: [
    // Semua route API (CSRF protection)
    "/api/:path*",
    // Area privat (auth guard + RBAC)
    "/portal/:path*",
    "/customer/:path*",
    // Transaksi
    "/checkout/:path*",
    "/checkout",
    "/cart/:path*",
    "/cart",
    "/login",
    "/register",
    // Halaman publik & kustom URL (untuk SEO Redirect Manager).
    // Aset statis dikecualikan agar middleware tidak berjalan untuk gambar/font.
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|uploads/|robots.txt|sitemap.xml|llms.txt|llms-full.txt|manifest.webmanifest|\\.well-known/).*)",
  ],
};
