import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().trim().min(2).max(64).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional().default(""),
  categoryId: z.number().int().positive(),
  price: z.number().positive().max(9999999999)
});

export const productStatusSchema = z.object({ active: z.boolean() });
