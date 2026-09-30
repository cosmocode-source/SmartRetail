# SmartRetail — POS, Inventory & Customer Intelligence

Professional Next.js starter structure for the revised DBMS Level 3 project.

## Revised scope
Included: in-store POS, multi-store inventory, suppliers, purchase orders, customer records, loyalty points, RFM-style customer segments, role-based access, operational analytics, PostgreSQL, and MongoDB.

Removed intentionally: online shopping/storefront, carts, online checkout, product reviews, recommendations, embeddings, and vector databases.

## Quick start
1. Copy `.env.example` to `.env.local` and replace placeholders.
2. Start PostgreSQL and MongoDB with `docker compose up -d`.
3. Run SQL files in `database/postgresql/` in the order documented there.
4. Run `npm install`, then `npm run dev`.
5. Replace draft data in pages and Route Handlers with real queries through `src/lib/services/`.

## Important
This is an implementation-ready scaffold, not a claim of a completed production deployment. Security, transactions, validation, tests, migrations, backups, monitoring, and accessibility must remain part of every feature definition of done.
