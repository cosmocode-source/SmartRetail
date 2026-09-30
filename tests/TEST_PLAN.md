# Test plan
- Checkout success and rollback on payment/write failure.
- Two concurrent checkouts cannot oversell the same stock.
- Negative inventory, non-positive prices, duplicate SKU, and invalid received quantities are rejected.
- Store staff receive 403 for another store; Admin may access all stores.
- Receiving a PO twice is idempotent or explicitly rejected.
- Low-stock view and reorder suggestion produce expected results.
- Customer segment function covers New, Regular, At-Risk, and VIP boundaries.
- MongoDB validators reject malformed documents; indexes support intended queries.
- Pages are keyboard-usable and responsive at 390px and desktop widths.
