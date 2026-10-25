import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { receivePurchaseOrder } from "@/lib/services/purchasing";
import { writeAudit } from "@/lib/services/audit";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }
  const poId = Number(params.id);
  if (!Number.isInteger(poId) || poId < 1) return NextResponse.json({ error: "Invalid purchase order." }, { status: 400 });
  try {
    const result = await receivePurchaseOrder(poId, user!.userId);
    await writeAudit({ actorUserId: user!.userId, action: "purchase_order.received", entityType: "purchase_order", entityId: poId });
    return NextResponse.json(result);
  }
  catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "ALREADY_RECEIVED") return NextResponse.json({ error: "This order was already received." }, { status: 409 });
    if (code === "PO_NOT_FOUND") return NextResponse.json({ error: "Purchase order not found." }, { status: 404 });
    return NextResponse.json({ error: "Purchase order could not be received." }, { status: 409 });
  }
}
