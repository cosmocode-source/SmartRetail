import { describe, expect, it } from "vitest";
import { inventoryAdjustmentSchema } from "@/lib/validation/inventory";

describe("inventory adjustment validation", () => {
  it("accepts positive and negative integer changes", () => {
    expect(inventoryAdjustmentSchema.safeParse({ storeId: 1, productId: 1, changeQty: -2, reason: "Damaged" }).success).toBe(true);
  });

  it("rejects zero changes and missing reasons", () => {
    expect(inventoryAdjustmentSchema.safeParse({ storeId: 1, productId: 1, changeQty: 0, reason: "" }).success).toBe(false);
  });
});
