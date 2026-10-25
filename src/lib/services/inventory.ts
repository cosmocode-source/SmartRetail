import { postgres, withTransaction } from "@/lib/db/postgres";
import type { z } from "zod";
import type { inventoryAdjustmentSchema } from "@/lib/validation/inventory";

export type InventoryItem = {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  reorderThreshold: number;
  suggestedReorderQty: number;
};

export type StockMovement = {
  movementId: number;
  productName: string;
  changeQty: number;
  reason: string;
  createdAt: string;
};

export async function getInventory(storeId: number, query = "") {
  const [items, movements] = await Promise.all([
    postgres.query<InventoryItem>(
      `SELECT p.product_id::int AS "productId", p.sku, p.name, i.quantity,
              i.reorder_threshold AS "reorderThreshold",
              GREATEST(i.reorder_threshold * 2 - i.quantity, 0) AS "suggestedReorderQty"
       FROM inventory i JOIN products p USING(product_id)
       WHERE i.store_id = $1 AND ($2 = '' OR p.name ILIKE '%' || $2 || '%' OR p.sku ILIKE '%' || $2 || '%')
       ORDER BY (i.quantity <= i.reorder_threshold) DESC, p.name`,
      [storeId, query.trim()]
    ),
    postgres.query<StockMovement>(
      `SELECT sm.movement_id::int AS "movementId", p.name AS "productName", sm.change_qty AS "changeQty",
              sm.reason, sm.created_at::text AS "createdAt"
       FROM stock_movements sm JOIN products p USING(product_id)
       WHERE sm.store_id = $1 ORDER BY sm.created_at DESC LIMIT 20`,
      [storeId]
    )
  ]);
  return { items: items.rows, movements: movements.rows };
}

export async function adjustInventory(input: z.infer<typeof inventoryAdjustmentSchema>, actorUserId: number) {
  return withTransaction(async (client) => {
    const current = await client.query<{ quantity: number }>(
      `SELECT quantity FROM inventory WHERE product_id = $1 AND store_id = $2 FOR UPDATE`,
      [input.productId, input.storeId]
    );
    if (!current.rows[0]) throw new Error("INVENTORY_NOT_FOUND");
    const nextQuantity = current.rows[0].quantity + input.changeQty;
    if (nextQuantity < 0) throw new Error("INSUFFICIENT_STOCK");
    await client.query(
      `UPDATE inventory SET quantity = $3 WHERE product_id = $1 AND store_id = $2`,
      [input.productId, input.storeId, nextQuantity]
    );
    await client.query(
      `INSERT INTO stock_movements(product_id, store_id, change_qty, reason, reference_type, actor_user_id)
       VALUES ($1, $2, $3, $4, 'manual_adjustment', $5)`,
      [input.productId, input.storeId, input.changeQty, input.reason, actorUserId]
    );
    return { quantity: nextQuantity };
  });
}
