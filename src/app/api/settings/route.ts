import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { writeAudit } from "@/lib/services/audit";
import { applySetting, getSettings } from "@/lib/services/settings";
import { settingChangeSchema } from "@/lib/validation/settings";

async function admin() {
  const user = await getSession();
  try { return requireRole(user, ["admin"]); }
  catch { return null; }
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json(await getSettings());
}

export async function POST(request: Request) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const parsed = settingChangeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the submitted details." }, { status: 400 });
  try {
    const result = await applySetting(parsed.data);
    await writeAudit({ actorUserId: user.userId, action: `${result.entityType}.created`, entityType: result.entityType, entityId: result.id });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    return NextResponse.json({ error: duplicate ? "That value already exists." : "Setting could not be saved." }, { status: duplicate ? 409 : 500 });
  }
}
