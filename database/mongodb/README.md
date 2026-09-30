# MongoDB scope
Use only for flexible documents and append-oriented events.
- `supplier_documents`: certificate/contract/catalog metadata that varies by document type.
- `audit_events`: actor, action, entity, timestamp, store, and flexible context.
Do not store authoritative inventory, orders, payment amounts, or purchase-order status here.
Apply `validators.js`, then `indexes.js`. Keep uploaded binaries in object storage; MongoDB stores safe metadata/reference IDs unless GridFS is deliberately chosen.
