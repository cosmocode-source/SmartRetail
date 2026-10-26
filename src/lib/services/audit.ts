import { Long } from "mongodb";
import { getMongoDb } from "@/lib/db/mongo";

export async function writeAudit(event: { actorUserId: number; storeId?: number | null; action: string; entityType: string; entityId: string | number; context?: Record<string, unknown> }) {
  try {
    const db = await getMongoDb();
    await db.collection("audit_events").insertOne({
      actorUserId: Long.fromNumber(event.actorUserId),
      storeId: event.storeId == null ? null : Long.fromNumber(event.storeId),
      action: event.action,
      entityType: event.entityType,
      entityId: String(event.entityId),
      context: event.context || {},
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Audit event could not be written", error);
  }
}
