import { describe, expect, it } from "vitest";
import { customerSchema } from "@/lib/validation/customers";

describe("customer validation", () => {
  it("accepts a valid customer", () => {
    expect(customerSchema.safeParse({ name: "Asha Singh", phone: "9876543210", email: "asha@example.com" }).success).toBe(true);
  });

  it("rejects short phone numbers and invalid email", () => {
    expect(customerSchema.safeParse({ name: "Asha", phone: "123", email: "bad" }).success).toBe(false);
  });
});
