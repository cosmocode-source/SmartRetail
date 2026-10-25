import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole, requireStoreAccess } from "@/lib/auth/authorize";
import { adjustInventory } from "@/lib/services/inventory";
import { inventoryAdjustmentSchema } from "@/lib/validation/inventory";

export async function POST(request: Request) {
  const user = await getSession();
  try { requireRole(user, ["admin", "staff"]); }
  catch { return NextResponse.json({ error: "Authentication required" }, { status: 401 }); }
  const parsed = inventoryAdjustmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the adjustment details." }, { status: 400 });
  try {
    requireStoreAccess(user!, parsed.data.storeId);
    return NextResponse.json(await adjustInventory(parsed.data, user!.userId), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "Stock cannot become negative." }, { status: 409 });
    if (message === "INVENTORY_NOT_FOUND") return NextResponse.json({ error: "Inventory record not found." }, { status: 404 });
    if (message === "FORBIDDEN_STORE") return NextResponse.json({ error: "Store access denied." }, { status: 403 });
    return NextResponse.json({ error: "Stock could not be adjusted." }, { status: 500 });
  }
}
