# Implementation Checklist

## Foundation
- [ ] Install dependencies and validate required environment variables.
- [ ] Add a versioned migration runner and database health endpoint.
- [ ] Implement secure HttpOnly sessions, login/logout, bcrypt verification, and CSRF protection.
- [ ] Add reusable Admin/Staff and assigned-store authorization guards.
- [ ] Add structured domain errors and safe API error responses.

## Products and inventory
- [ ] Product/category create, read, update, and deactivate workflows.
- [ ] Store-scoped inventory listing and filters.
- [ ] Reason-required stock adjustments with stock-movement records.
- [ ] Low-stock view and reorder suggestion service.
- [ ] Constraint and authorization integration tests.

## POS
- [ ] Product search and keyboard-friendly basket.
- [ ] Server-calculated subtotal, discount, tax, and total.
- [ ] Atomic checkout transaction with row locks.
- [ ] Payment and receipt records.
- [ ] Rollback and concurrent-overselling tests.

## Purchasing
- [ ] Supplier management.
- [ ] Purchase-order lifecycle and line items.
- [ ] Transactional, idempotent stock receiving.
- [ ] Flexible supplier-document metadata in MongoDB.

## Customers
- [ ] Customer records and purchase history.
- [ ] Loyalty ledger and balance consistency.
- [ ] New, Regular, At-Risk, and VIP segment calculation.
- [ ] Customer privacy and audit controls.

## Analytics
- [ ] Revenue trend and transaction summary.
- [ ] Top-selling products.
- [ ] Inventory health and low-stock summary.
- [ ] Customer-segment breakdown.
- [ ] Date and store filters with accessible tabular alternatives.

## Completion
- [ ] Loading, empty, error, and success states on every screen.
- [ ] Responsive behavior at approximately 390px and desktop widths.
- [ ] Keyboard navigation, visible focus, labels, and WCAG AA contrast.
- [ ] Unit, API, PostgreSQL, MongoDB, authorization, and E2E tests.
- [ ] Security review, backup plan, deployment notes, and final documentation.
