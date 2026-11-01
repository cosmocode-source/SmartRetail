# Architecture Summary

## Request flow
Browser → Next.js page/Route Handler → authentication and role/store guard → Zod validation → service function → PostgreSQL transaction and/or MongoDB document operation → structured response → audit event.

## Database responsibilities
### PostgreSQL
Authoritative structured records and all consistency-sensitive workflows: users, stores, customers, categories, suppliers, products, inventory, orders, order items, payments, purchase orders, PO items, stock movements, alerts, and loyalty entries.

### MongoDB
- `supplier_documents`: flexible certificates, contracts, and catalog metadata.
- `audit_events`: append-oriented business/security events with varied context.
- `pos_scanner_sessions`: expiring counter-pairing documents and scan-only delivery queues. Only the owning signed-in POS can read or revoke its queue. The phone holds a random one-hour pairing code. Product SKUs, availability and checkout remain authoritative in PostgreSQL.

MongoDB must not own stock quantities, order totals, payments, or purchase-order state.

## Key transaction boundaries
- POS checkout: order + items + inventory decrement + movement + payment + loyalty.
- Stock adjustment: quantity update + stock movement + reason + audit.
- PO receiving: received quantities + inventory increment + movement + PO status.

## Non-functional requirements
Parameterized queries, connection pooling, least privilege, bcrypt password hashes, signed HttpOnly sessions, CSRF-aware mutations, rate limiting at deployment, structured logs, backups, database migration history, and observable failure paths.
