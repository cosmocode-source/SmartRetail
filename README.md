# SmartRetail — POS, Inventory & Customer Intelligence

## Revised scope
Included: in-store POS, multi-store inventory, suppliers, purchase orders, customer records, loyalty points, RFM-style customer segments, role-based access, operational analytics, PostgreSQL, and MongoDB.

Removed intentionally: online shopping/storefront, carts, online checkout, product reviews, recommendations, embeddings, and vector databases.

## Implemented
- Signed HttpOnly login sessions with Admin and store-scoped Staff roles.
- Product creation, search, activation, categories, per-store inventory, adjustments, and movements.
- Atomic POS checkout with locked stock, server totals, payments, receipts, and loyalty points.
- Customers, purchase summaries, loyalty balances, and customer segments.
- Suppliers, one-line purchase orders, idempotent receiving, and MongoDB document metadata.
- Live dashboard/analytics data and MongoDB audit events.
- Admin management for stores, categories, and staff accounts.
- Store-specific purchasing with stock previews and expected delivery dates.
- Product barcode labels and an independent `/scanner` phone reader paired to a POS counter.

## Review demo: purchasing and phone scanning
1. In Purchase orders, select a store. Its current stock and reorder suggestions appear above the order form. Enter the expected delivery date when creating an order; it is shown in the order list. Receiving updates only the order's destination store.
2. In POS, enter a counter name and choose **Connect phone scanner**. A random counter code and a QR link to `/scanner` appear. Keep this POS tab open.
3. Connect the phone and laptop to the same Wi-Fi/hotspot. Run `npm run dev -- --hostname 0.0.0.0`; use the port printed by Next.js. The generated phone link uses a detected LAN address when POS is opened on localhost. Check that address if the laptop has multiple networks; firewall/client isolation may block access.
4. On the phone, open `/scanner` at the laptop's address and enter the counter code. The code authorizes scan signals only, not checkout or account access. Sessions expire after one hour; **Disconnect phone** revokes the code immediately. Different POS tabs receive different codes even if counter names match.
5. Open **Open / print product barcode labels** on the laptop, or visit `/barcodes`. Every current product has a label encoding its PostgreSQL `products.sku`; printable ASCII SKUs use Code 128 and other SKUs use QR. No new SQL column or barcode-image table is needed.
6. On `/scanner`, choose **Scan next with camera** under HTTPS. For ordinary HTTP LAN access, use **Take barcode photo or choose image** instead: it decodes the photo locally and sends only the SKU and a unique scan ID. A manual SKU fallback is also available. Keep the complete barcode visible and in focus.
7. Each accepted scan adds one unit to the paired cart, up to the stock shown at the POS. Polling delivers signals about once per second. The phone confirms delivery to the counter queue, while the POS enforces its cart limits. Checkout still verifies and locks real stock in PostgreSQL.

MongoDB also holds temporary `pos_scanner_sessions` documents: random code, owner ID, store ID, counter name, expiry, and scan events. TTL expiry and a unique code index are created automatically on first pairing. Application expiry checks apply immediately. Repeated submissions with the same scan ID append only once; a session accepts at most 5,000 signals. This collection is a delivery queue, not authoritative stock or payment data. A refreshed POS page needs a new pairing; abandoned sessions expire automatically.

Review integration checks (local databases and running app required):
```bash
TEST_APP_URL=http://localhost:3000 node --env-file=.env.local tests/review.integration.mjs
```
The test creates uniquely named fixtures and removes only those fixtures afterward. It covers store restrictions, counter isolation/expiry/revocation, duplicate scan retries, expected-date persistence, store-specific receiving, concurrent receiving and rollback.

## Quick start
1. Run `cp .env.example .env.local` and replace `AUTH_SECRET` for anything beyond local demonstration.
2. Run `docker compose up -d`. This copy uses PostgreSQL port `5433` and MongoDB port `27018` so it can coexist with the original project.
3. Run `npm install`.
4. Run `npm run db:seed` once to apply the PostgreSQL migrations and demo seed.
5. Apply `database/mongodb/validators.js` and `database/mongodb/indexes.js` with `mongosh mongodb://localhost:27018/smartretail`.
6. Run `npm run dev` and open `http://localhost:3000`.

Development administrator: `admin@smartretail.local` / `Admin123!`. Change this password or remove the seeded user outside local demonstrations.

Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` before committing.

## Important
This is a working local implementation, not a production deployment. It still needs production secrets, CSRF/rate-limit hardening, broader API/database/concurrency tests, backups, monitoring, and a deployment plan before real use.
