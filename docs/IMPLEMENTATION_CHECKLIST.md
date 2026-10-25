# Implementation Checklist

## Foundation
- [x] Install dependencies and validate required environment variables.
- [x] Add a versioned migration runner and database health endpoint.
- [x] Implement secure HttpOnly sessions, login/logout, and bcrypt verification. CSRF hardening remains for production.
- [x] Add reusable Admin/Staff and assigned-store authorization guards.
- [x] Add safe API error responses for implemented workflows.

## Products and inventory
- [x] Product/category create, read, search, and activate/deactivate workflows.
- [x] Store-scoped inventory listing.
- [x] Reason-required stock adjustments with stock-movement records.
- [x] Low-stock view and reorder suggestion service.
- [ ] Constraint and authorization integration tests.

## POS
- [x] Product selection and keyboard-usable basket controls.
- [x] Server-calculated subtotal, discount, tax, and total.
- [x] Atomic checkout transaction with row locks.
- [x] Payment and receipt records.
- [ ] Rollback and concurrent-overselling tests.

## Purchasing
- [x] Supplier management.
- [x] Basic purchase-order creation, line items, and received status.
- [x] Transactional, idempotent stock receiving.
- [x] Flexible supplier-document metadata in MongoDB.

## Customers
- [x] Customer records and purchase summaries.
- [x] Loyalty ledger and balance consistency.
- [x] New, Regular, At-Risk, and VIP segment calculation.
- [x] Audit events for sensitive mutations.

## Analytics
- [x] Revenue trend and transaction summary.
- [x] Top-selling products.
- [x] Inventory health and low-stock summary.
- [x] Customer-segment breakdown.
- [ ] Date and store filters with accessible tabular alternatives.

## Completion
- [ ] Loading, empty, error, and success states on every screen.
- [ ] Responsive behavior at approximately 390px and desktop widths.
- [ ] Keyboard navigation, visible focus, labels, and WCAG AA contrast.
- [ ] Unit, API, PostgreSQL, MongoDB, authorization, and E2E tests.
- [ ] Security review, backup plan, deployment notes, and final documentation.
