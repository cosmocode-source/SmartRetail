import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/auth/authorize";

export const sessionCookieName = "smartretail_session";

function key() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ role: user.role, storeId: user.storeId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.userId))
    .setIssuedAt()
    .setExpirationTime(`${getEnv().SESSION_TTL_MINUTES}m`)
    .sign(key());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub || (payload.role !== "admin" && payload.role !== "staff")) return null;
    return {
      userId: Number(payload.sub),
      role: payload.role,
      storeId: typeof payload.storeId === "number" ? payload.storeId : null
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = cookies().get(sessionCookieName)?.value;
  return token ? verifySessionToken(token) : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};
