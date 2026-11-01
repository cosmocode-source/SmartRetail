# API reference

Business mutation routes authenticate, authorize role/store, validate input, call a service and record an audit event. Scanner creation uses the signed-in POS owner; phone pairing and scans use an expiring scan-only counter code.

- `POST /api/auth/login` — create secure session.
- `POST /api/checkout` — Admin/Staff; atomic in-store sale.
- `GET /api/products?query=` — searchable product list and categories.
- `GET /api/inventory?storeId=&query=` — scoped stock listing and recent movements.
- `POST /api/inventory/adjustments` — reason-required adjustment.
- `GET /api/purchase-orders?storeId=` — orders for the chosen store, including expected dates.
- `POST /api/purchase-orders` — Admin creates an order for a selected store with optional `expectedAt`.
- `POST /api/purchase-orders/:id/receive` — transactional, idempotent receiving.
- `GET|POST /api/customers` — customer list/create.
- `GET /api/analytics?storeId=` — aggregated dashboard data.
- `POST /api/scanner` — `open` creates an owner's counter; `pair` validates a phone's code; `scan` queues an available SKU with a unique event ID.
- `GET /api/scanner?code=` — owner-only scan polling with no-store caching.
- `DELETE /api/scanner?code=` — owner-only counter revocation.
- `/scanner` — independent phone reader; `/barcodes` — signed-in printable product labels.

Never expose password hashes, internal stack traces, connection strings, or unrestricted cross-store data.
