import { randomBytes } from "node:crypto";
import { getMongoDb } from "@/lib/db/mongo";
import { postgres } from "@/lib/db/postgres";

type Scan = { eventId: string; sku: string };
type Counter = { code: string; ownerId: number; storeId: number; counterName: string; expiresAt: Date; events: Scan[] };
async function counters() { return (await getMongoDb()).collection<Counter>("pos_scanner_sessions"); }

export async function openCounter(ownerId: number, storeId: number, counterName: string) {
  const stores = await postgres.query(`SELECT store_id FROM stores WHERE store_id = $1 AND active = TRUE`, [storeId]);
  if (!stores.rowCount) throw new Error("STORE_NOT_FOUND");
  const collection = await counters();
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.createIndex({ code: 1 }, { unique: true });
  const code = randomBytes(8).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await collection.insertOne({ code, ownerId, storeId, counterName, expiresAt, events: [] });
  return { code, counterName, expiresAt };
}

export async function findCounter(code: string, ownerId?: number) {
  const counter = await (await counters()).findOne({ code, expiresAt: { $gt: new Date() }, ...(ownerId == null ? {} : { ownerId }) });
  if (!counter) throw new Error("COUNTER_EXPIRED");
  return counter;
}

export async function sendScan(code: string, sku: string, eventId: string) {
  const counter = await findCounter(code);
  const product = await postgres.query<{ name: string; sku: string }>(
    `SELECT p.name, p.sku FROM products p JOIN inventory i USING(product_id)
     WHERE p.sku = $1 AND p.active = TRUE AND i.store_id = $2 AND i.quantity > 0`, [sku, counter.storeId]
  );
  if (!product.rows[0]) throw new Error("PRODUCT_UNAVAILABLE");
  // A retry with the same event ID cannot append the scan twice.
  const updated = await (await counters()).updateOne(
    { code, expiresAt: { $gt: new Date() }, "events.eventId": { $ne: eventId }, "events.4999": { $exists: false } },
    { $push: { events: { eventId, sku: product.rows[0].sku } } }
  );
  if (!updated.modifiedCount) {
    const latest = await findCounter(code);
    if (!latest.events.some((event) => event.eventId === eventId)) throw new Error("COUNTER_FULL");
  }
  return { productName: product.rows[0].name, counterName: counter.counterName };
}

export async function closeCounter(code: string, ownerId: number) {
  await (await counters()).deleteOne({ code, ownerId });
}
