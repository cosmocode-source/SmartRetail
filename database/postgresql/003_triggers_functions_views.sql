CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER inventory_touch BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER purchase_orders_touch BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION fn_customer_segment(p_customer_id BIGINT) RETURNS customer_segment LANGUAGE plpgsql AS $$
DECLARE days_since INTEGER; order_count INTEGER; lifetime NUMERIC;
BEGIN
  SELECT COALESCE(EXTRACT(DAY FROM now() - max(created_at))::INT, 9999), count(*), COALESCE(sum(total_amount),0)
  INTO days_since, order_count, lifetime FROM orders WHERE customer_id = p_customer_id;
  IF order_count = 0 OR order_count = 1 THEN RETURN 'new';
  ELSIF days_since > 90 THEN RETURN 'at_risk';
  ELSIF order_count >= 10 AND lifetime >= 10000 THEN RETURN 'vip';
  ELSE RETURN 'regular'; END IF;
END $$;

CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT i.store_id, i.product_id, p.sku, p.name, i.quantity, i.reorder_threshold,
       GREATEST(i.reorder_threshold * 2 - i.quantity, 0) AS suggested_reorder_qty
FROM inventory i JOIN products p USING(product_id)
WHERE p.active AND i.quantity <= i.reorder_threshold;

CREATE OR REPLACE VIEW vw_top_selling_products AS
SELECT o.store_id, oi.product_id, p.name, sum(oi.quantity) AS units_sold, sum(oi.line_total) AS revenue
FROM order_items oi JOIN orders o USING(order_id) JOIN products p USING(product_id)
GROUP BY o.store_id, oi.product_id, p.name;

CREATE OR REPLACE VIEW vw_customer_lifetime_value AS
SELECT c.customer_id, c.name, count(o.order_id) AS order_count, COALESCE(sum(o.total_amount),0) AS lifetime_value, max(o.created_at) AS last_purchase_at
FROM customers c LEFT JOIN orders o USING(customer_id) GROUP BY c.customer_id, c.name;
