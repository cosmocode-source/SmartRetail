db.supplier_documents.createIndex({ supplierId: 1, documentType: 1 });
db.supplier_documents.createIndex({ "metadata.validTill": 1 });
db.audit_events.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
db.audit_events.createIndex({ actorUserId: 1, createdAt: -1 });
db.audit_events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // Confirm retention policy before production.
