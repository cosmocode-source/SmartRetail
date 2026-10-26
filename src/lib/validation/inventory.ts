import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  storeId: z.number().int().positive(),
  productId: z.number().int().positive(),
  changeQty: z.number().int().refine((value) => value !== 0, "Change cannot be zero"),
  reason: z.string().trim().min(3).max(80)
});
