import { z } from "zod";

export const counterCodeSchema = z.string().trim().transform((value) => value.replace(/[\s-]/g, "").toUpperCase()).pipe(z.string().regex(/^[A-F0-9]{16}$/));
export const scannerRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open"), storeId: z.number().int().positive(), counterName: z.string().trim().min(1).max(60) }),
  z.object({ action: z.literal("pair"), code: counterCodeSchema }),
  z.object({ action: z.literal("scan"), code: counterCodeSchema, sku: z.string().trim().min(1).max(64), eventId: z.string().uuid() })
]);
