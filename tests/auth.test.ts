import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation/auth";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("authentication foundation", () => {
  it("normalizes a valid login", () => {
    const result = loginSchema.parse({ email: " ADMIN@Example.com ", password: "password123" });
    expect(result.email).toBe("admin@example.com");
  });

  it("rejects an invalid login", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });

  it("signs and verifies a session", async () => {
    process.env.AUTH_SECRET ||= "test-secret-that-is-longer-than-thirty-two-characters";
    process.env.DATABASE_URL ||= "postgresql://localhost/test";
    process.env.MONGODB_URI ||= "mongodb://localhost:27017";
    const user = { userId: 7, role: "staff" as const, storeId: 2 };
    expect(await verifySessionToken(await createSessionToken(user))).toEqual(user);
  });
});
