import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorize";
import { writeAudit } from "@/lib/services/audit";
import { createSupplierDocument, listSupplierDocuments } from "@/lib/services/supplierDocuments";
import { supplierDocumentSchema } from "@/lib/validation/purchasing";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ documents: await listSupplierDocuments() });
}

export async function POST(request: Request) {
  const user = await getSession();
  try { requireRole(user, ["admin"]); }
  catch { return NextResponse.json({ error: user ? "Admin access required" : "Authentication required" }, { status: user ? 403 : 401 }); }
  const parsed = supplierDocumentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the document details." }, { status: 400 });
  const document = await createSupplierDocument(parsed.data);
  await writeAudit({ actorUserId: user!.userId, action: "supplier_document.created", entityType: "supplier_document", entityId: document.id, context: { supplierId: parsed.data.supplierId } });
  return NextResponse.json(document, { status: 201 });
}
