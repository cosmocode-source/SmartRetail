INSERT INTO suppliers(name, email, phone)
SELECT 'Freshline Distributors', 'freshline@example.invalid', '+91-0000000001'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Freshline Distributors');

INSERT INTO products(category_id, supplier_id, sku, name, description, price)
SELECT c.category_id, s.supplier_id, data.sku, data.name, data.description, data.price
FROM (VALUES
  ('SR-RIC-001', 'Basmati Rice 5kg', 'Premium long-grain rice.', 649.00, 'Grocery'),
  ('SR-TEA-001', 'Masala Tea 250g', 'Aromatic tea blend.', 189.00, 'Beverages'),
  ('SR-SOA-001', 'Liquid Dishwash 500ml', 'Everyday dishwashing liquid.', 129.00, 'Household')
) AS data(sku, name, description, price, category_name)
JOIN categories c ON c.name = data.category_name
JOIN suppliers s ON s.name = 'Freshline Distributors'
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sku = data.sku);

INSERT INTO inventory(product_id, store_id, quantity, reorder_threshold)
SELECT p.product_id, st.store_id,
  CASE p.sku WHEN 'SR-RIC-001' THEN 22 WHEN 'SR-TEA-001' THEN 18 ELSE 12 END,
  CASE p.sku WHEN 'SR-RIC-001' THEN 8 WHEN 'SR-TEA-001' THEN 6 ELSE 5 END
FROM products p CROSS JOIN stores st
WHERE p.sku IN ('SR-RIC-001', 'SR-TEA-001', 'SR-SOA-001')
ON CONFLICT (product_id, store_id) DO NOTHING;

INSERT INTO customers(name, phone, email)
SELECT data.name, data.phone, data.email
FROM (VALUES
  ('Demo Customer One', '+91-9000000001', 'customer.one@example.invalid'),
  ('Demo Customer Two', '+91-9000000002', 'customer.two@example.invalid'),
  ('Demo Customer Three', '+91-9000000003', 'customer.three@example.invalid')
) AS data(name, phone, email)
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.phone = data.phone);
