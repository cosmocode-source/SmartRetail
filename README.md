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
