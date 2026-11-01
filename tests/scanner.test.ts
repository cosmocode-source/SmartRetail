import { describe, expect, it } from "vitest";
import { counterCodeSchema, scannerRequestSchema } from "@/lib/validation/scanner";

describe("scanner input", () => {
  it("normalizes a counter code copied with spaces or dashes", () => {
    expect(counterCodeSchema.parse("abcd-1234 efab-5678")).toBe("ABCD1234EFAB5678");
  });
  it("rejects a counter name as a secret code and invalid event IDs", () => {
    expect(counterCodeSchema.safeParse("Counter 1").success).toBe(false);
    expect(scannerRequestSchema.safeParse({ action: "scan", code: "ABCD1234EFAB5678", sku: "SR-COF-001", eventId: "repeat" }).success).toBe(false);
  });
  it("requires an active-store-shaped ID and nonempty name when opening a counter", () => {
    expect(scannerRequestSchema.safeParse({ action: "open", storeId: 0, counterName: "" }).success).toBe(false);
    expect(scannerRequestSchema.safeParse({ action: "open", storeId: 2, counterName: "Front desk" }).success).toBe(true);
  });
});
