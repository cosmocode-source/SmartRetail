import type { CheckoutInput } from "@/lib/validation/checkout";
import { withTransaction } from "@/lib/db/postgres";

export async function checkout(input: CheckoutInput, actorUserId: number) {
  return withTransaction(async (client) => {
    // 1. SELECT product prices and inventory FOR UPDATE for every item in stable product-id order.
    // 2. Reject inactive products or insufficient quantities before writing anything.
    // 3. Calculate subtotal/tax/discount on the server; never trust totals from the browser.
    // 4. INSERT order, order_items, payment, stock_movements, and loyalty ledger entries.
    // 5. UPDATE inventory with guarded predicates (quantity >= requested quantity).
    // 6. Record actorUserId in the relational audit reference; append Mongo audit after commit.
    // TODO: implement queries and domain-specific errors; tests must prove rollback and concurrency safety.
    void client; void actorUserId;
    return { orderId: 0, receiptNumber: "DRAFT", status: "draft" as const };
  });
}
