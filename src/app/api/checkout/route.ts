import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/checkout";
import { checkout } from "@/lib/services/checkout";
import { getSession } from "@/lib/auth/session";
import { requireStoreAccess } from "@/lib/auth/authorize";

export async function POST(request: Request) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout", details: parsed.error.flatten() }, { status: 400 });
  try { requireStoreAccess(actor, parsed.data.storeId); }
  catch { return NextResponse.json({ error: "Store access denied" }, { status: 403 }); }
  try { return NextResponse.json(await checkout(parsed.data, actor.userId), { status: 201 }); }
  catch { return NextResponse.json({ error: "Checkout could not be completed" }, { status: 409 }); }
}
