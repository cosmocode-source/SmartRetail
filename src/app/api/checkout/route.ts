import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/checkout";
import { checkout } from "@/lib/services/checkout";

export async function POST(request: Request) {
  // TODO: replace draft actor with verified HttpOnly session and CSRF protection.
  const actor = { userId: 1, role: "admin" as const, storeId: null };
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout", details: parsed.error.flatten() }, { status: 400 });
  try { return NextResponse.json(await checkout(parsed.data, actor.userId), { status: 201 }); }
  catch { return NextResponse.json({ error: "Checkout could not be completed" }, { status: 409 }); }
}
