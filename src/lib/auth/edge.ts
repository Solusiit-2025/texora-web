import { jwtVerify } from "jose";
import type { TokenPayload } from "./jwt";

const ACCESS_SECRET = process.env.JWT_SECRET || "texora_jwt_access_secret_super_secure_key_2026_x89";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "texora_jwt_refresh_secret_ultra_secure_key_2026_r92";

/**
 * Pure Edge Runtime-compatible JWT verification using 'jose' only.
 * No Node.js crypto or jsonwebtoken dependencies.
 */
export async function verifyAccessTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(ACCESS_SECRET);
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
    const secret = new TextEncoder().encode(REFRESH_SECRET);
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
