import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { createProduct, listCategories, listProducts } from "@/lib/services/products";
import { productSchema } from "@/lib/validation/products";
import { writeAudit } from "@/lib/services/audit";

export async function GET(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("query") || "";
  const [products, categories] = await Promise.all([listProducts(query), listCategories()]);
  return NextResponse.json({ products, categories });
}

export async function POST(request: Request) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the product details." }, { status: 400 });
  try {
    const product = await createProduct(parsed.data);
    await writeAudit({ actorUserId: user!.userId, action: "product.created", entityType: "product", entityId: product.productId });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    return NextResponse.json({ error: duplicate ? "That SKU already exists." : "Product could not be saved." }, { status: duplicate ? 409 : 500 });
  }
}
