import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireStoreAccess } from "@/lib/auth/authorize";
import { counterCodeSchema, scannerRequestSchema } from "@/lib/validation/scanner";
import { closeCounter, findCounter, openCounter, sendScan } from "@/lib/services/scanner";
import { networkInterfaces } from "node:os";

export const dynamic = "force-dynamic";

function failure(cause: unknown) {
  const code = cause instanceof Error ? cause.message : "";
  const messages: Record<string, string> = {
    COUNTER_EXPIRED: "Counter not found or expired. Enter a new code from the POS.",
    COUNTER_FULL: "Counter scan limit reached. Connect a new counter session.",
    PRODUCT_UNAVAILABLE: "Barcode not found, inactive, or out of stock at this store.",
    STORE_NOT_FOUND: "Active store not found.", FORBIDDEN_STORE: "Store access denied."
  };
  return NextResponse.json({ error: messages[code] || "Scanner unavailable. Try again." }, { status: code === "FORBIDDEN_STORE" ? 403 : messages[code] ? 409 : 503 });
}

export async function POST(request: Request) {
  const parsed = scannerRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the counter code and scan details." }, { status: 400 });
  const input = parsed.data;
  try {
    if (input.action === "open") {
      const user = await getSession();
      if (!user) return NextResponse.json({ error: "Sign in at the POS first." }, { status: 401 });
      requireStoreAccess(user, input.storeId);
      const session = await openCounter(user.userId, input.storeId, input.counterName);
      const url = new URL(request.headers.get("origin") || request.url);
      if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
        const interfaces = networkInterfaces();
        const addresses = [...(interfaces.en0 || []), ...Object.values(interfaces).flatMap((value) => value || [])];
        const address = addresses.find((value) => value.family === "IPv4" && !value.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(value.address));
        if (address) url.hostname = address.address;
      }
      url.pathname = "/scanner"; url.search = "";
      return NextResponse.json({ ...session, scannerUrl: url.toString() }, { status: 201 });
    }
    // Possession of the expiring random counter code grants scan-only access.
    if (input.action === "pair") {
      const counter = await findCounter(input.code);
      return NextResponse.json({ counterName: counter.counterName, storeId: counter.storeId, expiresAt: counter.expiresAt });
    }
    return NextResponse.json(await sendScan(input.code, input.sku, input.eventId));
  } catch (cause) { return failure(cause); }
}

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = counterCodeSchema.safeParse(new URL(request.url).searchParams.get("code"));
  if (!parsed.success) return NextResponse.json({ error: "Invalid counter code." }, { status: 400 });
  try {
    const counter = await findCounter(parsed.data, user.userId);
    requireStoreAccess(user, counter.storeId);
    return NextResponse.json({ events: counter.events }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) { return failure(cause); }
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = counterCodeSchema.safeParse(new URL(request.url).searchParams.get("code"));
  if (!parsed.success) return NextResponse.json({ error: "Invalid counter code." }, { status: 400 });
  try { await closeCounter(parsed.data, user.userId); return NextResponse.json({ ok: true }); }
  catch (cause) { return failure(cause); }
}
