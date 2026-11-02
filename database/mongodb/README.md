# MongoDB scope
Use only for flexible documents and append-oriented events.
- `supplier_documents`: certificate/contract/catalog metadata that varies by document type.
- `audit_events`: actor, action, entity, timestamp, store, and flexible context.
- `pos_scanner_sessions`: temporary pairing code, owner/store/counter, expiry and deduplicated SKU scan events. The service creates unique-code and TTL indexes automatically. Application validation and per-request expiry checks apply; the existing validators script covers the two original business collections. This queue never owns inventory or payments.
Do not store authoritative inventory, orders, payment amounts, or purchase-order status here.
Apply `validators.js`, then `indexes.js`. Keep uploaded binaries in object storage; MongoDB stores safe metadata/reference IDs unless GridFS is deliberately chosen.
