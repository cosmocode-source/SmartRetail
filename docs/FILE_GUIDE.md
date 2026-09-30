# File Guide — What Belongs Where

| Path | Put here | Do not put here |
|---|---|---|
| `src/app/**/page.tsx` | Page composition, server data loading | Raw SQL, passwords, large business rules |
| `src/app/api/**/route.ts` | Auth guard, validation, service call, HTTP mapping | Transaction details, UI markup |
| `src/components` | Reusable UI and feature interactions | Database clients, secrets |
| `src/lib/db` | PostgreSQL/Mongo connection helpers | Feature policy or rendering |
| `src/lib/services` | Checkout, inventory, PO, customer logic | CSS or request parsing |
| `src/lib/validation` | Zod schemas and domain validation | Database calls |
| `src/lib/auth` | Sessions and role/store access checks | Page-specific presentation |
| `src/styles` | Tokens, global foundations, components | Feature data or JS behavior |
| `database/postgresql` | DDL, indexes, functions, triggers, views, seeds, queries | App credentials |
| `database/mongodb` | Validators, indexes, pipelines | Authoritative stock/order data |
| `tests` | Unit, integration, DB, and E2E tests | Production secrets |
| `docs` | Decisions, API contract, screenshots, results | Executable runtime logic |

Each draft file includes comments identifying what to implement next. Delete placeholder data as soon as its real service is wired.
