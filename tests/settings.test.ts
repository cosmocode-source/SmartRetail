import { describe, expect, it } from "vitest";
import { settingChangeSchema } from "@/lib/validation/settings";

describe("admin settings validation", () => {
  it("accepts stores, categories, and staff", () => {
    expect(settingChangeSchema.safeParse({ type: "store", name: "North", location: "Bengaluru" }).success).toBe(true);
    expect(settingChangeSchema.safeParse({ type: "category", name: "Personal care" }).success).toBe(true);
    expect(settingChangeSchema.safeParse({ type: "staff", name: "Ravi", email: "ravi@example.com", password: "Password1!", storeId: 1 }).success).toBe(true);
  });

  it("rejects weak staff passwords", () => {
    expect(settingChangeSchema.safeParse({ type: "staff", name: "Ravi", email: "ravi@example.com", password: "short", storeId: 1 }).success).toBe(false);
  });
});
