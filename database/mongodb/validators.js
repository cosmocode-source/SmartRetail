// Run with mongosh against the smartretail database.
const supplierValidator = { $jsonSchema: { bsonType: "object", required: ["supplierId", "documentType", "storageKey", "createdAt"], properties: { supplierId: { bsonType: "long" }, documentType: { enum: ["certificate", "contract", "catalog", "other"] }, storageKey: { bsonType: "string" }, metadata: { bsonType: "object" }, createdAt: { bsonType: "date" } } } };
const auditValidator = { $jsonSchema: { bsonType: "object", required: ["actorUserId", "action", "entityType", "entityId", "createdAt"], properties: { actorUserId: { bsonType: "long" }, storeId: { bsonType: ["long", "null"] }, action: { bsonType: "string" }, entityType: { bsonType: "string" }, entityId: { bsonType: "string" }, context: { bsonType: "object" }, createdAt: { bsonType: "date" } } } };

if (!db.getCollectionNames().includes("supplier_documents")) db.createCollection("supplier_documents", { validator: supplierValidator });
else db.runCommand({ collMod: "supplier_documents", validator: supplierValidator });

if (!db.getCollectionNames().includes("audit_events")) db.createCollection("audit_events", { validator: auditValidator });
else db.runCommand({ collMod: "audit_events", validator: auditValidator });
