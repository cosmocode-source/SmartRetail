import { describe, expect, it } from "vitest";
import { productSchema } from "@/lib/validation/products";

describe("product validation", () => {
  it("normalizes a valid product", () => {
    const product = productSchema.parse({ sku: " cof-2 ", name: "Coffee", categoryId: 2, price: 199 });
    expect(product.sku).toBe("COF-2");
  });

  it("rejects invalid prices and categories", () => {
    expect(productSchema.safeParse({ sku: "X1", name: "Item", categoryId: 0, price: 0 }).success).toBe(false);
  });
});
