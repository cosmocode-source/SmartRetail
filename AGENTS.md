# Codex Project Instructions — SmartRetail

## Start here
SmartRetail is an internal retail operations application built with Next.js, TypeScript, PostgreSQL, and MongoDB. Continue from the existing scaffold; do not replace the architecture or redesign the interface.

Before coding, read:
1. `AGENT_MEMORY.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/FILE_GUIDE.md`
5. `docs/IMPLEMENTATION_CHECKLIST.md`

## Scope
Build:
- Admin and Store Staff authentication and authorization
- In-store POS and atomic checkout
- Products, categories, stores, inventory, and stock movements
- Low-stock alerts and reorder suggestions
- Suppliers and purchase orders
- Customer records, loyalty points, purchase history, and RFM segments
- Sales, inventory, product, and customer analytics
- PostgreSQL transactional data
- MongoDB supplier documents and audit events

Do not build:
- Online shopping or a public storefront
- Online carts, shipping, or online checkout
- Reviews or ratings
- Recommendations, embeddings, semantic search, pgvector, Chroma, or any vector database

## Setup
```bash
cp .env.example .env.local
docker compose up -d
npm install
npm run dev
```

Before starting the app, apply the PostgreSQL files in this order:
1. `database/postgresql/001_schema.sql`
2. `database/postgresql/002_indexes.sql`
3. `database/postgresql/003_triggers_functions_views.sql`
4. `database/postgresql/004_seed.sql` — development only

Apply the MongoDB scripts with `mongosh`:
1. `database/mongodb/validators.js`
2. `database/mongodb/indexes.js`

The helper `bash scripts/setup.sh` performs the local dependency and environment setup. It does not silently modify production databases.

## Coding rules
- Use strict TypeScript and the Next.js App Router.
- Prefer Server Components. Add `"use client"` only for genuine browser interaction.
- Pages compose screens; they must not contain raw SQL or large business rules.
- Route Handlers authenticate, authorize, validate, invoke a service, and map errors.
- Put business logic and transaction boundaries in `src/lib/services`.
- Put Zod schemas in `src/lib/validation`.
- Use parameterized SQL only.
- Treat PostgreSQL as the source of truth for stock, orders, payments, loyalty, and PO state.
- Use MongoDB only for flexible supplier documents and append-oriented audit events.
- Never expose secrets, hashes, stack traces, or unrestricted cross-store data.
- Store Staff can access only their assigned store; Admin can access all stores.
- Use the existing CSS tokens and components. Do not add gradients, random colors, excessive cards, or decorative animation.
- Maintain responsive behavior, visible keyboard focus, semantic HTML, and accessible labels.

## Critical transaction rules
POS checkout must atomically:
1. Lock required inventory rows in stable product-ID order.
2. Verify active products and sufficient stock.
3. Calculate all totals on the server.
4. Create the order and order items.
5. Decrement inventory with guarded updates.
6. Create stock movements and payment.
7. Add loyalty entries when a customer is selected.
8. Commit only when every step succeeds; otherwise roll back everything.

Purchase-order receiving must be transactional and protected against duplicate receiving.

## Recommended implementation order
1. Environment validation and database migration runner
2. Session authentication, roles, and store-level authorization
3. Product/category CRUD and inventory queries
4. Inventory adjustments and movement history
5. POS product search and atomic checkout
6. Supplier and purchase-order workflows
7. Customer, loyalty, and segmentation workflows
8. MongoDB supplier documents and audit logging
9. Dashboard and analytics queries
10. Tests, accessibility, security review, and documentation

## Required checks before each commit
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For database features, also run the relevant integration tests. A feature is not complete without authorization, validation, loading/empty/error states, transaction rollback tests where applicable, and updated documentation.

## First coding task
Begin by implementing environment validation, database connectivity health checks, secure session helpers, and a migration command. Then replace the temporary actor in `src/app/api/checkout/route.ts` with a verified session. Do not implement several modules at once; complete and test one vertical slice before proceeding.
