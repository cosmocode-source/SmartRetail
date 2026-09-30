CREATE INDEX idx_orders_store_created ON orders(store_id, created_at DESC);
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX idx_inventory_store_quantity ON inventory(store_id, quantity);
CREATE INDEX idx_products_name_lower ON products(lower(name));
CREATE INDEX idx_stock_movements_product_store_created ON stock_movements(product_id, store_id, created_at DESC);
CREATE INDEX idx_purchase_orders_supplier_status ON purchase_orders(supplier_id, status);
