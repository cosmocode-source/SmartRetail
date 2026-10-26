import { NextResponse } from "next/server";
import { authenticate } from "@/lib/services/auth";
import { createSessionToken, sessionCookieName, sessionCookieOptions } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, await createSessionToken(user), sessionCookieOptions);
  return response;
}
