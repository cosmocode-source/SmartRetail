# Revised Feature Matrix

| Module | Included | Technical requirement |
|---|---:|---|
| Authentication/roles | Yes | Admin and Store Staff; server-side guard; assigned-store scope |
| POS billing | Yes | Atomic checkout, discounts, payment record, receipt summary |
| Inventory | Yes | Per-store stock, constraints, movements, low-stock trigger/view |
| Products/categories | Yes | SKU uniqueness, positive price, deactivate instead of unsafe delete |
| Suppliers | Yes | Relational supplier record + flexible MongoDB documents |
| Purchase orders | Yes | Items, lifecycle, transactional receiving |
| Customers/loyalty | Yes | History, points ledger, RFM-style segment function/view |
| Analytics | Yes | Sales, products, stock, segments; views and aggregate queries |
| MongoDB audit logs | Yes | Append-oriented events and indexes |
| Online shopping | No | Removed completely |
| Reviews/ratings | No | Removed completely |
| Vector database/search | No | Removed completely |
