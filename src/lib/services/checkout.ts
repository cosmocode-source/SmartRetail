import type { CheckoutInput } from "@/lib/validation/checkout";
import { postgres, withTransaction } from "@/lib/db/postgres";

export type SellableProduct = { productId: number; sku: string; name: string; price: string; quantity: number };
type LockedProduct = SellableProduct & { active: boolean };

export async function listSellableProducts(storeId: number) {
  const result = await postgres.query<SellableProduct>(
    `SELECT p.product_id::int AS "productId", p.sku, p.name, p.price, i.quantity
     FROM products p JOIN inventory i USING(product_id)
     WHERE i.store_id = $1 AND p.active = TRUE AND i.quantity > 0 ORDER BY p.name`,
    [storeId]
  );
  return result.rows;
}

export function calculateTotals(lines: { price: string; quantity: number }[], discountAmount: number) {
  const subtotalPaise = lines.reduce((sum, line) => sum + Math.round(Number(line.price) * 100) * line.quantity, 0);
  const requestedDiscount = Math.round(discountAmount * 100);
  if (requestedDiscount > subtotalPaise) throw new Error("INVALID_DISCOUNT");
  const discountPaise = Math.max(0, requestedDiscount);
  const taxPaise = Math.round((subtotalPaise - discountPaise) * 0.05);
  return {
    subtotal: subtotalPaise / 100,
    discountAmount: discountPaise / 100,
    taxAmount: taxPaise / 100,
    totalAmount: (subtotalPaise - discountPaise + taxPaise) / 100
  };
}

export async function checkout(input: CheckoutInput, actorUserId: number) {
  return withTransaction(async (client) => {
    const quantities = new Map<number, number>();
    for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    const productIds = [...quantities.keys()].sort((a, b) => a - b);
    const locked = await client.query<LockedProduct>(
      `SELECT p.product_id::int AS "productId", p.sku, p.name, p.price, p.active, i.quantity
       FROM products p JOIN inventory i USING(product_id)
       WHERE p.product_id = ANY($1::bigint[]) AND i.store_id = $2
       ORDER BY p.product_id FOR UPDATE OF i`,
      [productIds, input.storeId]
    );
    if (locked.rows.length !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");
    for (const product of locked.rows) {
      if (!product.active) throw new Error("PRODUCT_INACTIVE");
      if (product.quantity < quantities.get(product.productId)!) throw new Error("INSUFFICIENT_STOCK");
    }

    const lines = locked.rows.map((product) => ({ ...product, quantity: quantities.get(product.productId)! }));
    const totals = calculateTotals(lines, input.discountAmount);
    const receiptNumber = `SR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = await client.query<{ orderId: number }>(
      `INSERT INTO orders(receipt_number, customer_id, store_id, staff_user_id, subtotal, discount_amount, tax_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id::int AS "orderId"`,
      [receiptNumber, input.customerId, input.storeId, actorUserId, totals.subtotal, totals.discountAmount, totals.taxAmount, totals.totalAmount]
    );
    const orderId = order.rows[0].orderId;

    for (const line of lines) {
      const lineTotal = Number(line.price) * line.quantity;
      await client.query(
        `INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total) VALUES ($1, $2, $3, $4, $5)`,
        [orderId, line.productId, line.quantity, line.price, lineTotal]
      );
      const updated = await client.query(
        `UPDATE inventory SET quantity = quantity - $3 WHERE product_id = $1 AND store_id = $2 AND quantity >= $3`,
        [line.productId, input.storeId, line.quantity]
      );
      if (updated.rowCount !== 1) throw new Error("INSUFFICIENT_STOCK");
      await client.query(
        `INSERT INTO stock_movements(product_id, store_id, change_qty, reason, reference_type, reference_id, actor_user_id)
         VALUES ($1, $2, $3, 'Sale', 'order', $4, $5)`,
        [line.productId, input.storeId, -line.quantity, orderId, actorUserId]
      );
    }

    await client.query(
      `INSERT INTO payments(order_id, amount, method) VALUES ($1, $2, $3)`,
      [orderId, totals.totalAmount, input.paymentMethod]
    );
    if (input.customerId) {
      const points = Math.floor(totals.totalAmount / 100);
      if (points > 0) await client.query(
        `INSERT INTO loyalty_ledger(customer_id, order_id, points_delta, reason) VALUES ($1, $2, $3, 'Purchase')`,
        [input.customerId, orderId, points]
      );
      await client.query(
        `UPDATE customers SET loyalty_points = loyalty_points + $2, last_purchase_at = now(), segment = fn_customer_segment($1) WHERE customer_id = $1`,
        [input.customerId, points]
      );
    }
    return { orderId, receiptNumber, ...totals };
  });
}
