import { describe, expect, it } from "vitest";
import { purchaseOrderSchema, supplierSchema } from "@/lib/validation/purchasing";

describe("purchasing validation", () => {
  it("accepts a supplier and one-line purchase order", () => {
    expect(supplierSchema.safeParse({ name: "Supplier", email: "buyer@example.com" }).success).toBe(true);
    expect(purchaseOrderSchema.safeParse({ supplierId: 1, storeId: 1, expectedAt: null, items: [{ productId: 1, orderedQty: 5, unitCost: 80 }] }).success).toBe(true);
  });

  it("rejects empty orders", () => {
    expect(purchaseOrderSchema.safeParse({ supplierId: 1, storeId: 1, expectedAt: null, items: [] }).success).toBe(false);
  });
});
