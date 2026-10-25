import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { createSupplier, listSuppliers } from "@/lib/services/purchasing";
import { supplierSchema } from "@/lib/validation/purchasing";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ suppliers: await listSuppliers() });
}

export async function POST(request: Request) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }
  const parsed = supplierSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the supplier details." }, { status: 400 });
  return NextResponse.json(await createSupplier(parsed.data), { status: 201 });
}
