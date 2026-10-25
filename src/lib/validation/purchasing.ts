import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(30).optional().default(""),
  address: z.string().trim().max(500).optional().default("")
});

export const purchaseOrderSchema = z.object({
  supplierId: z.number().int().positive(),
  storeId: z.number().int().positive(),
  expectedAt: z.string().date().nullable(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    orderedQty: z.number().int().positive(),
    unitCost: z.number().positive()
  })).min(1)
});

export const supplierDocumentSchema = z.object({
  supplierId: z.number().int().positive(),
  documentType: z.enum(["certificate", "contract", "catalog", "other"]),
  storageKey: z.string().trim().min(2).max(500),
  validTill: z.string().date().nullable()
});
