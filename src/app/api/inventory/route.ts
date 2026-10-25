import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireStoreAccess } from "@/lib/auth/authorize";
import { getInventory } from "@/lib/services/inventory";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const search = new URL(request.url).searchParams;
  const storeId = Number(search.get("storeId"));
  if (!Number.isInteger(storeId) || storeId < 1) return NextResponse.json({ error: "Invalid store." }, { status: 400 });
  try { requireStoreAccess(user, storeId); }
  catch { return NextResponse.json({ error: "Store access denied" }, { status: 403 }); }
  return NextResponse.json(await getInventory(storeId, search.get("query") || ""));
}
