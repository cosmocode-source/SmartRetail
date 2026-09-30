-- JOIN + GROUP BY: monthly revenue by store.
SELECT s.name, date_trunc('month', o.created_at) AS month, sum(o.total_amount) AS revenue
FROM orders o JOIN stores s USING(store_id) GROUP BY s.name, month ORDER BY month DESC, s.name;

-- HAVING: high-value customers in the last 90 days.
SELECT c.customer_id, c.name, sum(o.total_amount) AS spend
FROM customers c JOIN orders o USING(customer_id)
WHERE o.created_at >= now() - interval '90 days'
GROUP BY c.customer_id, c.name HAVING sum(o.total_amount) > 5000 ORDER BY spend DESC;

-- Window function: running daily sales total per store.
WITH daily AS (SELECT store_id, created_at::date AS day, sum(total_amount) AS sales FROM orders GROUP BY store_id, day)
SELECT store_id, day, sales, sum(sales) OVER (PARTITION BY store_id ORDER BY day) AS running_sales FROM daily;
