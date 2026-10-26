import { postgres, withTransaction } from "@/lib/db/postgres";
import type { z } from "zod";
import type { purchaseOrderSchema, supplierSchema } from "@/lib/validation/purchasing";

export type Supplier = { supplierId: number; name: string; email: string | null; phone: string | null; address: string | null; active: boolean };
export type PurchaseOrder = { poId: number; supplierName: string; status: string; expectedAt: string | null; itemCount: number; orderedQty: number; receivedQty: number };

export async function listSuppliers() {
  const result = await postgres.query<Supplier>(
    `SELECT supplier_id::int AS "supplierId", name, email, phone, address, active FROM suppliers ORDER BY active DESC, name`
  );
  return result.rows;
}

export async function createSupplier(input: z.infer<typeof supplierSchema>) {
  const result = await postgres.query<{ supplierId: number }>(
    `INSERT INTO suppliers(name, email, phone, address) VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), NULLIF($4, ''))
     RETURNING supplier_id::int AS "supplierId"`,
    [input.name, input.email, input.phone, input.address]
  );
  return result.rows[0];
}

export async function listPurchaseOrders(storeId: number) {
  const result = await postgres.query<PurchaseOrder>(
    `SELECT po.po_id::int AS "poId", s.name AS "supplierName", po.status, po.expected_at::text AS "expectedAt",
            count(poi.po_item_id)::int AS "itemCount", sum(poi.ordered_qty)::int AS "orderedQty", sum(poi.received_qty)::int AS "receivedQty"
     FROM purchase_orders po JOIN suppliers s USING(supplier_id) JOIN purchase_order_items poi USING(po_id)
     WHERE po.store_id = $1 GROUP BY po.po_id, s.name ORDER BY po.created_at DESC`,
    [storeId]
  );
  return result.rows;
}

export async function createPurchaseOrder(input: z.infer<typeof purchaseOrderSchema>, actorUserId: number) {
  return withTransaction(async (client) => {
    const order = await client.query<{ poId: number }>(
      `INSERT INTO purchase_orders(supplier_id, store_id, created_by, expected_at)
       VALUES ($1, $2, $3, $4) RETURNING po_id::int AS "poId"`,
      [input.supplierId, input.storeId, actorUserId, input.expectedAt]
    );
    for (const item of input.items) await client.query(
      `INSERT INTO purchase_order_items(po_id, product_id, ordered_qty, unit_cost) VALUES ($1, $2, $3, $4)`,
      [order.rows[0].poId, item.productId, item.orderedQty, item.unitCost]
    );
    return order.rows[0];
  });
}

export async function receivePurchaseOrder(poId: number, actorUserId: number) {
  return withTransaction(async (client) => {
    const order = await client.query<{ storeId: number; status: string }>(
      `SELECT store_id::int AS "storeId", status FROM purchase_orders WHERE po_id = $1 FOR UPDATE`, [poId]
    );
    if (!order.rows[0]) throw new Error("PO_NOT_FOUND");
    if (order.rows[0].status === "received") throw new Error("ALREADY_RECEIVED");
    if (order.rows[0].status === "cancelled") throw new Error("PO_CANCELLED");
    const items = await client.query<{ productId: number; remaining: number }>(
      `SELECT product_id::int AS "productId", (ordered_qty - received_qty)::int AS remaining
       FROM purchase_order_items WHERE po_id = $1 ORDER BY product_id FOR UPDATE`, [poId]
    );
    for (const item of items.rows) {
      if (item.remaining < 1) continue;
      await client.query(
        `INSERT INTO inventory(product_id, store_id, quantity, reorder_threshold) VALUES ($1, $2, $3, 5)
         ON CONFLICT(product_id, store_id) DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [item.productId, order.rows[0].storeId, item.remaining]
      );
      await client.query(
        `INSERT INTO stock_movements(product_id, store_id, change_qty, reason, reference_type, reference_id, actor_user_id)
         VALUES ($1, $2, $3, 'Purchase order received', 'purchase_order', $4, $5)`,
        [item.productId, order.rows[0].storeId, item.remaining, poId, actorUserId]
      );
    }
    await client.query(`UPDATE purchase_order_items SET received_qty = ordered_qty WHERE po_id = $1`, [poId]);
    await client.query(`UPDATE purchase_orders SET status = 'received' WHERE po_id = $1`, [poId]);
    return { received: true };
  });
}
