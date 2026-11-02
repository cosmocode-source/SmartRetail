BEGIN;

INSERT INTO orders(receipt_number, customer_id, store_id, staff_user_id, subtotal, total_amount, created_at)
SELECT 'DEMO-A-001', c.customer_id, st.store_id, u.user_id, 998.00, 998.00, now() - interval '12 days'
FROM customers c, stores st, users u
WHERE c.phone = '+91-9000000001' AND u.email = 'admin@smartretail.local'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE receipt_number = 'DEMO-A-001');

INSERT INTO orders(receipt_number, customer_id, store_id, staff_user_id, subtotal, total_amount, created_at)
SELECT 'DEMO-A-002', c.customer_id, st.store_id, u.user_id, 649.00, 649.00, now() - interval '5 days'
FROM customers c, stores st, users u
WHERE c.phone = '+91-9000000001' AND u.email = 'admin@smartretail.local'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE receipt_number = 'DEMO-A-002');

INSERT INTO orders(receipt_number, customer_id, store_id, staff_user_id, subtotal, total_amount, created_at)
SELECT 'DEMO-D-001', c.customer_id, st.store_id, u.user_id, 129.00, 129.00, now() - interval '2 days'
FROM customers c, stores st, users u
WHERE c.phone = '+91-9000000002' AND u.email = 'admin@smartretail.local'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE receipt_number = 'DEMO-D-001');

INSERT INTO orders(receipt_number, customer_id, store_id, staff_user_id, subtotal, total_amount, created_at)
SELECT format('DEMO-R-%s', lpad(day_number::text, 3, '0')), c.customer_id, st.store_id, u.user_id,
  1148.00, 1148.00, now() - make_interval(days => day_number)
FROM generate_series(1, 10) AS days(day_number), customers c, stores st, users u
WHERE c.phone = '+91-9000000003' AND u.email = 'admin@smartretail.local'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE receipt_number = format('DEMO-R-%s', lpad(day_number::text, 3, '0')));

INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total)
SELECT o.order_id, p.product_id, 2, 499.00, 998.00
FROM orders o JOIN products p ON p.sku = 'SR-COF-001'
WHERE o.receipt_number = 'DEMO-A-001'
  AND NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id);

INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total)
SELECT o.order_id, p.product_id, 1, 649.00, 649.00
FROM orders o JOIN products p ON p.sku = 'SR-RIC-001'
WHERE o.receipt_number = 'DEMO-A-002'
  AND NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id);

INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total)
SELECT o.order_id, p.product_id, 1, 129.00, 129.00
FROM orders o JOIN products p ON p.sku = 'SR-SOA-001'
WHERE o.receipt_number = 'DEMO-D-001'
  AND NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id);

INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total)
SELECT o.order_id, p.product_id, 1, 649.00, 649.00
FROM orders o JOIN products p ON p.sku = 'SR-RIC-001'
WHERE o.receipt_number LIKE 'DEMO-R-%'
  AND NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id);

INSERT INTO order_items(order_id, product_id, quantity, unit_price, line_total)
SELECT o.order_id, p.product_id, 1, 499.00, 499.00
FROM orders o JOIN products p ON p.sku = 'SR-COF-001'
WHERE o.receipt_number LIKE 'DEMO-R-%'
  AND NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id AND i.product_id = p.product_id);

INSERT INTO payments(order_id, amount, method)
SELECT o.order_id, o.total_amount, CASE WHEN o.receipt_number LIKE 'DEMO-R-%' THEN 'upi'::payment_method ELSE 'card'::payment_method END
FROM orders o
WHERE o.receipt_number LIKE 'DEMO-%'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.order_id);

INSERT INTO loyalty_ledger(customer_id, order_id, points_delta, reason)
SELECT o.customer_id, o.order_id, floor(o.total_amount / 100)::integer, 'demo purchase'
FROM orders o
WHERE o.receipt_number LIKE 'DEMO-%'
  AND NOT EXISTS (SELECT 1 FROM loyalty_ledger l WHERE l.order_id = o.order_id);

UPDATE customers c
SET loyalty_points = COALESCE((SELECT sum(points_delta) FROM loyalty_ledger l WHERE l.customer_id = c.customer_id), 0),
    last_purchase_at = (SELECT max(created_at) FROM orders o WHERE o.customer_id = c.customer_id),
    segment = fn_customer_segment(c.customer_id)
WHERE c.phone IN ('+91-9000000001', '+91-9000000002', '+91-9000000003');

UPDATE inventory SET quantity = 3 WHERE product_id = (SELECT product_id FROM products WHERE sku = 'SR-COF-001');

INSERT INTO purchase_orders(supplier_id, store_id, created_by, status, expected_at)
SELECT s.supplier_id, st.store_id, u.user_id, 'partially_received', current_date + 7
FROM suppliers s, stores st, users u
WHERE s.name = 'Freshline Distributors' AND u.email = 'admin@smartretail.local'
  AND NOT EXISTS (SELECT 1 FROM purchase_orders po WHERE po.status = 'partially_received');

INSERT INTO purchase_order_items(po_id, product_id, ordered_qty, received_qty, unit_cost)
SELECT po.po_id, p.product_id, 30, 10, 420.00
FROM purchase_orders po, products p
WHERE po.status = 'partially_received' AND p.sku = 'SR-COF-001'
  AND NOT EXISTS (SELECT 1 FROM purchase_order_items i WHERE i.po_id = po.po_id);

COMMIT;
