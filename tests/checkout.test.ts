import { beforeAll, describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/validation/checkout";

let calculateTotals: typeof import("@/lib/services/checkout").calculateTotals;

beforeAll(async () => {
  process.env.DATABASE_URL ||= "postgresql://localhost/test";
  process.env.MONGODB_URI ||= "mongodb://localhost:27017";
  process.env.AUTH_SECRET ||= "test-secret-that-is-longer-than-thirty-two-characters";
  ({ calculateTotals } = await import("@/lib/services/checkout"));
});

describe("checkout", () => {
  it("calculates subtotal, discount, tax, and total", () => {
    expect(calculateTotals([{ price: "100.00", quantity: 2 }], 20)).toEqual({ subtotal: 200, discountAmount: 20, taxAmount: 9, totalAmount: 189 });
  });

  it("rejects a discount larger than the subtotal", () => {
    expect(() => calculateTotals([{ price: "10.00", quantity: 1 }], 11)).toThrow("INVALID_DISCOUNT");
  });

  it("requires at least one positive-quantity item", () => {
    expect(checkoutSchema.safeParse({ storeId: 1, customerId: null, discountAmount: 0, paymentMethod: "cash", items: [] }).success).toBe(false);
  });
});
