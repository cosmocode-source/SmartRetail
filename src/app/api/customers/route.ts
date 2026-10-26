import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createCustomer, listCustomers } from "@/lib/services/customers";
import { customerSchema } from "@/lib/validation/customers";
import { writeAudit } from "@/lib/services/audit";

export async function GET(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("query") || "";
  return NextResponse.json({ customers: await listCustomers(query) });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = customerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the customer details." }, { status: 400 });
  try {
    const customer = await createCustomer(parsed.data);
    await writeAudit({ actorUserId: user.userId, action: "customer.created", entityType: "customer", entityId: customer.customerId });
    return NextResponse.json(customer, { status: 201 });
  }
  catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    return NextResponse.json({ error: duplicate ? "That phone number already exists." : "Customer could not be saved." }, { status: duplicate ? 409 : 500 });
  }
}
