import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { setProductActive } from "@/lib/services/products";
import { productStatusSchema } from "@/lib/validation/products";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }
  const productId = Number(params.id);
  const parsed = productStatusSchema.safeParse(await request.json());
  if (!Number.isInteger(productId) || productId < 1 || !parsed.success) {
    return NextResponse.json({ error: "Invalid product update." }, { status: 400 });
  }
  return (await setProductActive(productId, parsed.data.active))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
