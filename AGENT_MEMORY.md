# SmartRetail Agent Memory and Build Prompt

## 1. Product identity
SmartRetail is a professional internal retail operations application for small and mid-sized shops. It unifies in-store POS billing, stock control across up to three branches, suppliers and purchase orders, customer records, loyalty points, customer segmentation, and operational analytics.

## 2. Locked scope
Build only:
- Role-based sign-in for Admin and Store Staff. Customer is a managed record, not a storefront user in this revision.
- POS product search, cart, discounts, payment recording, receipt summary, and atomic checkout.
- Products, categories, stores, inventory, stock movements, low-stock alerts, and reorder suggestions.
- Suppliers, purchase orders, purchase-order items, receiving stock, and status tracking.
- Customer profiles, purchase history, loyalty points, and RFM-style segments: New, Regular, At-Risk, VIP.
- Dashboard analytics: revenue trends, top products, inventory health, low stock, and customer segment distribution.
- PostgreSQL for transactional relational data.
- MongoDB only where document flexibility is justified: supplier documents and customer activity/audit logs.

Do not build:
- Online shopping, public storefront, online carts, online checkout, shipping, or payment gateways.
- Product reviews, ratings, recommendation UI, embeddings, semantic search, pgvector, Chroma, or any vector database.
- Decorative dashboards filled with fake cards, excessive charts, gradients, or motion.

## 3. Architecture rules
- Next.js App Router with TypeScript. Server Components by default; use Client Components only for interactive state.
- Route Handlers expose validated endpoints. Business rules live in `src/lib/services`, not in pages or components.
- PostgreSQL is the source of truth for users, stores, customers, products, categories, suppliers, inventory, orders, order items, payments, purchase orders, purchase-order items, stock movements, low-stock alerts, and loyalty entries.
- MongoDB stores flexible supplier document metadata and append-oriented audit/activity events. Never duplicate authoritative order totals or inventory quantities into MongoDB.
- Checkout must be one database transaction: lock inventory rows, verify quantities, create order and items, decrement stock, record stock movements and payment, award loyalty points, then commit. Roll back everything on failure.
- Receiving a purchase order must also be transactional and idempotent.
- Every endpoint requires authentication, authorization, Zod validation, parameterized queries, deliberate error handling, and an audit event for sensitive mutations.
- Store staff may access only their assigned store. Admin can access all stores and supplier/purchasing data.

## 4. Visual design contract
Follow “less but better.” Use the tokens in `src/styles/tokens.css` and components in `src/styles/components.css`.
- One blue accent; neutral canvas and text; green/amber/red/blue only for semantic states.
- System sans-serif, 16px body, restrained heading sizes, 1.5 line-height.
- Spacing scale only: 4, 8, 12, 16, 24, 32, 48, 64px.
- 8px default radius. Prefer 1px borders to shadows. Avoid gradients.
- Buttons and inputs must be at least 44px high, keyboard accessible, labeled, and visibly focused.
- Tables may scroll inside their container on mobile; never cause page-level horizontal scrolling.
- Use cards only when content is a true grouped surface. Do not wrap every section in a card.
- Empty, loading, success, and error states must be deliberate and informative.
- Respect `prefers-reduced-motion`; animations must not be needed to understand state.

## 5. Required screens
1. Login: email, password, clear validation, no public registration.
2. Dashboard: store selector, date range, four restrained KPIs, sales trend, low-stock list, top products, customer segments.
3. POS: product search/filter, compact product results, persistent cart, quantity controls, discount, customer selection, payment method, checkout confirmation.
4. Inventory: stock table by store, status filters, reorder threshold, adjustment action with reason, movement history.
5. Products: product CRUD, category, supplier, SKU, price, active state. Deactivation is preferred over destructive deletion.
6. Suppliers: supplier profile and flexible MongoDB document attachments/metadata.
7. Purchase orders: draft/sent/partially received/received/cancelled lifecycle, line items, receiving workflow.
8. Customers: contact details, segment, loyalty balance, visit/order history, privacy-conscious audit trail.
9. Analytics: sales, products, stock health, and segments with accessible tables accompanying charts.
10. Settings/Admin: stores, staff accounts, roles, thresholds, tax/discount policy.

## 6. File ownership and boundaries
- `src/app`: routing, layouts, loading/error boundaries, and page composition only.
- `src/components`: reusable presentational and interaction components; no raw SQL.
- `src/lib/db`: connection pools and database helpers only.
- `src/lib/services`: transactions and business rules.
- `src/lib/validation`: Zod request/domain schemas.
- `src/lib/auth`: sessions, password verification, role/store authorization.
- `database/postgresql`: versioned schema, constraints, indexes, triggers, functions, views, seeds, and demonstration queries.
- `database/mongodb`: collection validators, indexes, and sample aggregation pipelines.
- `tests`: unit, integration, transaction, authorization, and end-to-end coverage.
- `docs`: architecture, design system, API contract, testing plan, and submission evidence.

## 7. Implementation sequence
1. Establish tokens, application shell, authentication, roles, and store scoping.
2. Implement PostgreSQL schema/constraints and seed data.
3. Build product and inventory services and screens.
4. Implement atomic POS checkout and tests for rollback and concurrent stock access.
5. Build suppliers and purchase-order receiving.
6. Add customer loyalty and segmentation function/view.
7. Add MongoDB supplier documents and audit logs.
8. Build analytics from views and parameterized aggregate queries.
9. Complete accessibility, responsive behavior, loading/error/empty states, security review, and documentation.

## 8. Definition of done for every feature
- Works with real persistence; no permanent hard-coded demo data.
- Server-side authorization and validation are present.
- Database constraints reinforce application validation.
- Success, empty, loading, and failure states exist.
- Responsive at approximately 390px and desktop widths.
- Keyboard usable with visible focus and WCAG AA contrast.
- Tests cover success, invalid input, forbidden access, and failure/rollback paths.
- Documentation and affected API/database contracts are updated.

## 9. Prompt for the next AI agent
You are implementing SmartRetail, a production-minded internal POS and retail operations web application. Read this entire file, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, and `docs/FILE_GUIDE.md` before editing. Preserve the locked scope: no online shopping, reviews, recommendations, embeddings, or vector database. Use PostgreSQL for authoritative transactional data and MongoDB only for flexible supplier documents and append-oriented audit/activity logs. Keep pages thin, business logic in services, schemas in validation, and queries parameterized. Use atomic transactions with row locks for checkout and receiving stock. Enforce Admin versus Store Staff permissions on the server and scope staff to their assigned store. Follow the existing restrained design tokens and spacing scale; do not add gradients, visual clutter, unnecessary cards, oversized text, decorative animations, or new colors. Build accessible responsive states, not just the happy path. Before declaring a feature complete, add tests for validation, authorization, transaction rollback, and concurrency where applicable; update relevant docs; and verify no removed feature has been reintroduced.
