import { z } from "zod";

export const settingChangeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("store"), name: z.string().trim().min(2).max(120), location: z.string().trim().min(2).max(500) }),
  z.object({ type: z.literal("category"), name: z.string().trim().min(2).max(100) }),
  z.object({
    type: z.literal("staff"), name: z.string().trim().min(2).max(120), email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128), storeId: z.number().int().positive()
  })
]);
