import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { getAccessSecret, getRefreshSecret } from "./secrets";

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  /**
   * Kunci peran efektif pengguna. Bukan lagi union terbatas: role custom
   * dibuat dari /portal/settings/users-rbac dan disimpan sebagai override
   * (lihat src/lib/rbac/role-store.ts) tanpa mengubah enum Prisma.
   */
  role: string;
  companyName?: string | null;
  /**
   * Halaman tujuan setelah login (dari definisi role).
   */
  dash?: string;
  /**
   * Snapshot id menu portal yang boleh diakses oleh role pengguna.
   * Diisi dari Role & Menu Management (src/lib/rbac/menu-store.ts).
   * undefined = token lama sebelum fitur ini aktif (fallback ke ROUTE_PERMISSIONS).
   */
  menu?: string[];
}

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Standard Node.js signing
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN as any,
  });
}

// Standard Node.js verification
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getAccessSecret()) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getRefreshSecret()) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Edge Runtime-compatible verification for Next.js middleware (uses 'jose')
export async function verifyAccessTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(getAccessSecret());
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: (payload.sub || payload.id) as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as TokenPayload["role"],
      companyName: (payload.companyName as string) || null,
      dash: (payload.dash as string) || undefined,
      menu: Array.isArray(payload.menu) ? (payload.menu as string[]) : undefined,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(getRefreshSecret());
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: (payload.sub || payload.id) as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as TokenPayload["role"],
      companyName: (payload.companyName as string) || null,
      dash: (payload.dash as string) || undefined,
      menu: Array.isArray(payload.menu) ? (payload.menu as string[]) : undefined,
    };
  } catch {
    return null;
  }
}
