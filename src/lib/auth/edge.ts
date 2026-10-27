import { jwtVerify } from "jose";
import type { TokenPayload } from "./jwt";
import { getAccessSecret, getRefreshSecret } from "./secrets";

/**
 * Pure Edge Runtime-compatible JWT verification using 'jose' only.
 * No Node.js crypto or jsonwebtoken dependencies.
 */
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
