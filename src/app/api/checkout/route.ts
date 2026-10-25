import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/checkout";
import { checkout } from "@/lib/services/checkout";
import { getSession } from "@/lib/auth/session";
import { requireStoreAccess } from "@/lib/auth/authorize";
import { writeAudit } from "@/lib/services/audit";

export async function POST(request: Request) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout", details: parsed.error.flatten() }, { status: 400 });
  try { requireStoreAccess(actor, parsed.data.storeId); }
  catch { return NextResponse.json({ error: "Store access denied" }, { status: 403 }); }
  try {
    const result = await checkout(parsed.data, actor.userId);
    await writeAudit({ actorUserId: actor.userId, storeId: parsed.data.storeId, action: "order.created", entityType: "order", entityId: result.orderId, context: { totalAmount: result.totalAmount } });
    return NextResponse.json(result, { status: 201 });
  }
  catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, string> = {
      INSUFFICIENT_STOCK: "One or more items no longer have enough stock.",
      PRODUCT_NOT_FOUND: "One or more products were not found at this store.",
      PRODUCT_INACTIVE: "An inactive product cannot be sold.",
      INVALID_DISCOUNT: "Discount cannot exceed the subtotal."
    };
    return NextResponse.json({ error: messages[code] || "Checkout could not be completed." }, { status: 409 });
  }
}
