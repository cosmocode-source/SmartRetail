# Data-Driven Retail Management System with POS and Inventory Analytics

## Team information

| Name | SRN |
| --- | --- |
| Arin Singh | PES1UG24CS079 |
| Anshdeep Singh Sachdeva | PES1UG24CS070 |

## About the project

**SmartRetail** is a data-driven internal retail operations system for small and mid-sized stores. It brings billing, stock control, purchasing, customer management, loyalty, and business analytics into one application.

The system is designed for staff working at a physical store - not for online shopping. It helps authorised users complete sales accurately, track inventory across stores, identify low-stock products, manage suppliers and purchase orders, understand customers, and make better day-to-day decisions using live operational data.

## What we built

- Secure sign-in with **Admin** and **Store Staff** roles. Store Staff can access only their assigned store.
- A point-of-sale (POS) workflow with product search, cart controls, discounts, payments, receipts, and customer selection.
- Atomic checkout: stock, orders, payments, stock movements, and loyalty points are saved together, or none are saved if a checkout fails.
- Product and category management, including activation/deactivation, SKUs, prices, and barcode labels.
- Per-store inventory, stock adjustments with reasons, movement history, low-stock alerts, and reorder suggestions.
- Supplier management, purchase-order creation, expected delivery dates, and protected/idempotent stock receiving.
- Customer profiles, purchase history, loyalty balances, and RFM-style segments: New, Regular, At-Risk, and VIP.
- Dashboard and analytics for revenue, transactions, top-selling products, inventory health, and customer segments.
- Phone-assisted barcode scanning: a phone can be paired securely with a POS counter to send SKU scans to its cart.
- Audit logging for important business actions and flexible supplier document metadata.

## Functional modules

| Module | Purpose |
| --- | --- |
| Authentication & authorisation | Secure sessions, role-based access, and store-level access control. |
| POS & checkout | In-store billing, payment recording, receipts, discounts, and stock-safe checkout. |
| Products & categories | Product catalogue, SKUs, pricing, categories, active status, and barcode labels. |
| Inventory | Store-wise stock, adjustments, stock movements, low-stock alerts, and reordering support. |
| Suppliers & purchase orders | Supplier records, order creation, delivery tracking, and receiving stock. |
| Customers & loyalty | Customer details, purchase history, loyalty ledger, balances, and segmentation. |
| Analytics | Sales trends, top products, inventory health, and customer insights. |
| Scanner & audit trail | Counter-paired phone scanning and traceable audit events. |

## Technologies and packages used

- **Frontend and application framework:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Next.js Route Handlers and server-side service layer
- **Relational database:** PostgreSQL, using `pg` for transactional data
- **Document database:** MongoDB, using the official `mongodb` driver
- **Authentication and validation:** `bcryptjs`, `jose`, and Zod
- **Barcode and QR support:** `jsbarcode`, `qrcode`, and `@zxing/browser`
- **Testing and quality:** Vitest, TypeScript, ESLint, and Docker Compose

## Database design

PostgreSQL is the source of truth for consistency-sensitive data and workflows, including users, stores, products, inventory, orders, order items, payments, purchase orders, stock movements, customers, and loyalty entries.

MongoDB is used only where a flexible document structure is useful: supplier document metadata, append-only audit events, and temporary POS phone-scanner pairing sessions. It does not own stock quantities, payments, or order totals.

## Setup and run locally

### Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop (running)

### Fastest setup

From the project folder, run:

```bash
npm run local
```

This command creates `.env.local` if needed, starts PostgreSQL and MongoDB using Docker, installs packages when `node_modules` is missing, applies database migrations and development seed data, configures MongoDB, and starts the app at [http://localhost:8080](http://localhost:8080).

### Step-by-step setup

1. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Set a secure value for `AUTH_SECRET` in `.env.local` (at least 32 random characters).

3. Start the databases and install dependencies:

   ```bash
   docker compose up -d
   npm install
   ```

4. Apply PostgreSQL migrations, development seed data, and MongoDB configuration:

   ```bash
   npm run setup
   ```

   This configures MongoDB and applies the PostgreSQL scripts in this order: `001_schema.sql`, `002_indexes.sql`, `003_triggers_functions_views.sql`, then `004_seed.sql` for development data.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Development login

| Email | Password |
| --- | --- |
| `admin@smartretail.local` | `Admin123!` |

Change or remove this seeded account outside local demonstrations.

## Useful commands

```bash
npm run dev          # Start the development server
npm run local        # Run the complete local setup and start on port 8080
npm run setup        # Prepare databases, migrations, seed data, and MongoDB configuration
npm run db:migrate   # Apply PostgreSQL migrations
npm run db:seed      # Apply migrations and development seed data
npm run present      # Build and run presentation mode
npm run typecheck    # Check TypeScript
npm run lint         # Run linting
npm test             # Run tests
npm run build        # Create a production build
```

## Presentation notes

For a stable demo, stop any process already using port 3000, ensure Docker is running, then run `npm run present`. Use `npm run present -- --port 3100` to choose a different port.

For phone barcode scanning, keep the POS page open, select **Connect phone scanner**, and connect the phone and laptop to the same Wi-Fi or hotspot. The phone pairing code authorises scan signals only; checkout remains protected by the signed-in POS session and PostgreSQL stock checks.

## Project status and limitations

This is a working local academic project. Before a real production deployment, it would need production secrets, CSRF and rate-limit hardening, wider API/database/concurrency tests, backups, monitoring, and a deployment plan.

The project intentionally does not include an online storefront, online carts or checkout, shipping, product reviews, recommendations, embeddings, or vector databases.
