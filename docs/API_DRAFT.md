# API Draft

All mutation routes: authenticate → authorize role/store → parse Zod schema → call service → map domain errors → write audit event.

- `POST /api/auth/login` — create secure session.
- `POST /api/checkout` — Admin/Staff; atomic in-store sale.
- `GET /api/products?query=&category=&active=` — searchable POS/product list.
- `GET /api/inventory?storeId=&status=` — scoped stock listing.
- `POST /api/inventory/adjustments` — reason-required adjustment.
- `GET|POST /api/purchase-orders` — list/create.
- `POST /api/purchase-orders/:id/receive` — transactional, idempotent receiving.
- `GET|POST /api/customers` — customer list/create.
- `GET /api/analytics/overview?storeId=&from=&to=` — aggregated dashboard data.

Never expose password hashes, internal stack traces, connection strings, or unrestricted cross-store data.
