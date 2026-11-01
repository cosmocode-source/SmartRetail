// Run against a local running app with the same .env.local databases.
// Fixtures are uniquely named and removed in finally; existing records are untouched.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const base = process.env.TEST_APP_URL || "http://localhost:3100";
const sql = new pg.Client({ connectionString: process.env.DATABASE_URL });
const mongo = new MongoClient(process.env.MONGODB_URI);
await sql.connect(); await mongo.connect();
const db = mongo.db(process.env.MONGODB_DB || "smartretail");
const tag = `TEST-${randomUUID()}`;
const stores = []; const users = []; let productId; let categoryId; let supplierId;
async function insert(statement, values, key) { return Number((await sql.query(statement, values)).rows[0][key]); }
async function call(path, cookie, body, method = body ? "POST" : "GET") {
  const response = await fetch(base + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
}
try {
  for (let n = 0; n < 2; n++) stores.push(await insert("INSERT INTO stores(name,location) VALUES($1,'Integration fixture') RETURNING store_id", [`${tag}-${n}`], "store_id"));
  categoryId = await insert("INSERT INTO categories(name) VALUES($1) RETURNING category_id", [tag], "category_id");
  supplierId = await insert("INSERT INTO suppliers(name) VALUES($1) RETURNING supplier_id", [tag], "supplier_id");
  productId = await insert("INSERT INTO products(category_id,sku,name,price) VALUES($1,$2,$2,100) RETURNING product_id", [categoryId, tag], "product_id");
  for (const storeId of stores) await sql.query("INSERT INTO inventory(product_id,store_id,quantity) VALUES($1,$2,5)", [productId, storeId]);
  const password = randomUUID(); const hash = await bcrypt.hash(password, 4);
  for (const [index, role] of ["admin", "staff", "staff"].entries()) users.push(await insert("INSERT INTO users(name,email,password_hash,role,store_id) VALUES($1,$2,$3,$4,$5) RETURNING user_id", [tag, `${tag}-${index}@example.com`, hash, role, index ? stores[index - 1] : null], "user_id"));
  const cookies = [];
  for (let n = 0; n < 3; n++) {
    const login = await call("/api/auth/login", null, { email: `${tag}-${n}@example.com`, password });
    assert.equal(login.status, 200); assert.ok(login.cookie); cookies.push(login.cookie);
  }
  assert.equal((await call("/api/scanner", null, { action: "open", storeId: stores[0], counterName: "Unauthorized" })).status, 401);
  assert.equal((await call("/api/scanner", cookies[1], { action: "open", storeId: stores[1], counterName: "Wrong store" })).status, 403);
  const first = await call("/api/scanner", cookies[1], { action: "open", storeId: stores[0], counterName: "Counter A" });
  const second = await call("/api/scanner", cookies[2], { action: "open", storeId: stores[1], counterName: "Counter B" });
  assert.equal(first.status, 201); assert.equal(second.status, 201);
  const code = first.data.code;
  assert.equal((await call("/api/scanner", null, { action: "pair", code })).data.counterName, "Counter A");
  const scan = { action: "scan", code, sku: tag, eventId: randomUUID() };
  const retries = await Promise.all([call("/api/scanner", null, scan), call("/api/scanner", null, scan)]);
  assert.ok(retries.every((item) => item.status === 200));
  assert.equal((await call(`/api/scanner?code=${code}`, cookies[1])).data.events.length, 1);
  assert.equal((await call(`/api/scanner?code=${second.data.code}`, cookies[2])).data.events.length, 0);
  assert.equal((await call(`/api/scanner?code=${code}`, cookies[2])).status, 409);
  assert.equal((await call("/api/scanner", null, { ...scan, sku: "UNKNOWN-SKU", eventId: randomUUID() })).status, 409);
  await db.collection("pos_scanner_sessions").updateOne({ code }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await call("/api/scanner", null, { action: "pair", code })).status, 409);
  await call(`/api/scanner?code=${second.data.code}`, cookies[2], null, "DELETE");
  assert.equal((await call("/api/scanner", null, { action: "pair", code: second.data.code })).status, 409);
  console.log("PASS: authentication, store isolation, pairing, deduplicated scans, counter isolation, unknown SKU, expiry and disconnect");

  const poBody = { supplierId, storeId: stores[1], expectedAt: "2026-12-01", items: [{ productId, orderedQty: 3, unitCost: 50 }] };
  assert.equal((await call("/api/purchase-orders", cookies[1], poBody)).status, 403);
  const po = await call("/api/purchase-orders", cookies[0], poBody); assert.equal(po.status, 201);
  const list = await call(`/api/purchase-orders?storeId=${stores[1]}`, cookies[0]);
  assert.equal(list.data.orders.find((item) => item.poId === po.data.poId).expectedAt, "2026-12-01");
  const receiving = await Promise.all([call(`/api/purchase-orders/${po.data.poId}/receive`, cookies[0], {}), call(`/api/purchase-orders/${po.data.poId}/receive`, cookies[0], {})]);
  assert.deepEqual(receiving.map((item) => item.status).sort(), [200, 409]);
  const stock = await sql.query("SELECT store_id::int,quantity FROM inventory WHERE product_id=$1", [productId]);
  assert.equal(stock.rows.find((item) => item.store_id === stores[0]).quantity, 5);
  assert.equal(stock.rows.find((item) => item.store_id === stores[1]).quantity, 8);
  const failed = await call("/api/purchase-orders", cookies[0], { ...poBody, items: [...poBody.items, { productId: 2147483647, orderedQty: 1, unitCost: 1 }] });
  assert.equal(failed.status, 409);
  assert.equal(Number((await sql.query("SELECT count(*) FROM purchase_orders WHERE supplier_id=$1", [supplierId])).rows[0].count), 1);
  console.log("PASS: staff purchasing restriction, expected-date persistence, selected-store stock, concurrent receive-once and failed-order rollback");

  for (const [daysAgo, amount] of [[1, 300], [2, 200], [8, 100], [0, 9999], [15, 9999]]) {
    const orderId = await insert(
      `INSERT INTO orders(receipt_number,store_id,staff_user_id,subtotal,total_amount,created_at)
       VALUES($1,$2,$3,$4,$4,(((now() AT TIME ZONE 'Asia/Kolkata')::date - $5::int) + time '12:00') AT TIME ZONE 'Asia/Kolkata') RETURNING order_id`,
      [`${tag.slice(0, 32)}-${daysAgo}`, stores[1], users[2], amount, daysAgo], "order_id"
    );
    await sql.query("INSERT INTO order_items(order_id,product_id,quantity,unit_price,line_total) VALUES($1,$2,2,100,200)", [orderId, productId]);
  }
  const outlook = await call(`/api/analytics?storeId=${stores[1]}`, cookies[2]);
  assert.equal(outlook.status, 200);
  assert.equal(outlook.data.forecast.nextWeek, 300);
  assert.equal(outlook.data.forecast.changePercent, 400);
  assert.equal(outlook.data.forecast.transactions, 3);
  assert.equal(outlook.data.recommendations.find((item) => item.productId === productId).unitsSold, 6);
  assert.equal((await call(`/api/analytics?storeId=${stores[0]}`, cookies[1])).data.forecast.nextWeek, null);
  assert.equal((await call(`/api/analytics?storeId=${stores[0]}`, cookies[2])).status, 403);
  console.log("PASS: forecast query, complete-day window, old/today exclusion, zero-history state and cross-store authorization");
} finally {
  // Delete only this run's fixtures, following foreign-key dependencies.
  if (productId) {
    await sql.query("DELETE FROM stock_movements WHERE product_id=$1", [productId]);
    await sql.query("DELETE FROM orders WHERE store_id=ANY($1::bigint[])", [stores]);
    if (supplierId) await sql.query("DELETE FROM purchase_orders WHERE supplier_id=$1", [supplierId]);
    await sql.query("DELETE FROM inventory WHERE product_id=$1", [productId]);
    await sql.query("DELETE FROM products WHERE product_id=$1", [productId]);
  }
  if (supplierId) await sql.query("DELETE FROM suppliers WHERE supplier_id=$1", [supplierId]);
  if (categoryId) await sql.query("DELETE FROM categories WHERE category_id=$1", [categoryId]);
  await db.collection("pos_scanner_sessions").deleteMany({ ownerId: { $in: users } });
  const { Long } = await import("mongodb");
  await db.collection("audit_events").deleteMany({ actorUserId: { $in: users.map((id) => Long.fromNumber(id)) } });
  await sql.query("DELETE FROM users WHERE user_id=ANY($1::bigint[])", [users]);
  await sql.query("DELETE FROM stores WHERE store_id=ANY($1::bigint[])", [stores]);
  await sql.end(); await mongo.close();
}
