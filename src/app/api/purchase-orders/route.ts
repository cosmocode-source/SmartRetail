import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole, requireStoreAccess } from "@/lib/auth/authorize";
import { createPurchaseOrder, listPurchaseOrders } from "@/lib/services/purchasing";
import { purchaseOrderSchema } from "@/lib/validation/purchasing";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const storeId = Number(new URL(request.url).searchParams.get("storeId"));
  try { requireStoreAccess(user, storeId); }
  catch { return NextResponse.json({ error: "Store access denied" }, { status: 403 }); }
  return NextResponse.json({ orders: await listPurchaseOrders(storeId) });
}

export async function POST(request: Request) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }
  const parsed = purchaseOrderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the purchase order details." }, { status: 400 });
  return NextResponse.json(await createPurchaseOrder(parsed.data, user!.userId), { status: 201 });
}
