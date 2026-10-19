import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: "ADMINISTRATOR" | "SALES_REP" | "WAREHOUSE_STAFF" | "CUSTOMER";
  companyName?: string | null;
}

const ACCESS_SECRET = process.env.JWT_SECRET || "texora_jwt_access_secret_super_secure_key_2026_x89";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "texora_jwt_refresh_secret_ultra_secure_key_2026_r92";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Standard Node.js signing
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN as any,
  });
}

// Standard Node.js verification
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Edge Runtime-compatible verification for Next.js middleware (uses 'jose')
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
    };
  } catch {
    return null;
  }
}
