import { z } from "zod";
export const checkoutSchema = z.object({
  storeId: z.number().int().positive(), customerId: z.number().int().positive().nullable(),
  discountAmount: z.number().nonnegative().default(0), paymentMethod: z.enum(["cash", "card", "upi"]),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1)
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
