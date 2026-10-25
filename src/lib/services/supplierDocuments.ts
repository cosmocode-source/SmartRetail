import { Long } from "mongodb";
import { getMongoDb } from "@/lib/db/mongo";
import type { z } from "zod";
import type { supplierDocumentSchema } from "@/lib/validation/purchasing";

export type SupplierDocument = { id: string; supplierId: number; documentType: string; storageKey: string; validTill: string | null; createdAt: string };

export async function listSupplierDocuments() {
  const db = await getMongoDb();
  const documents = await db.collection("supplier_documents").find().sort({ createdAt: -1 }).limit(50).toArray();
  return documents.map((document) => ({
    id: String(document._id), supplierId: Number(document.supplierId), documentType: String(document.documentType),
    storageKey: String(document.storageKey), validTill: document.metadata?.validTill ? new Date(document.metadata.validTill).toISOString().slice(0, 10) : null,
    createdAt: new Date(document.createdAt).toISOString()
  }));
}

export async function createSupplierDocument(input: z.infer<typeof supplierDocumentSchema>) {
  const db = await getMongoDb();
  const result = await db.collection("supplier_documents").insertOne({
    supplierId: Long.fromNumber(input.supplierId), documentType: input.documentType, storageKey: input.storageKey,
    metadata: input.validTill ? { validTill: new Date(`${input.validTill}T00:00:00.000Z`) } : {}, createdAt: new Date()
  });
  return { id: String(result.insertedId) };
}
