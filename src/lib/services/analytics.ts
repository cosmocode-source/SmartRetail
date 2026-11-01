import { postgres } from "@/lib/db/postgres";
import { forecastSales, stockAdvice, type SalesDay, type StockDemand } from "@/lib/services/forecast";

export type Analytics = {
  summary: { netSales: string; transactionCount: number; averageSale: string; lowStockCount: number; customerCount: number };
  dailySales: { day: string; revenue: string; transactions: number }[];
  topProducts: { name: string; unitsSold: number; revenue: string }[];
  lowStock: { name: string; quantity: number; reorderThreshold: number; suggestedReorderQty: number }[];
  segments: { segment: string; customerCount: number }[];
  forecast: ReturnType<typeof forecastSales>;
  recommendations: ReturnType<typeof stockAdvice>[];
};

export async function getAnalytics(storeId: number): Promise<Analytics> {
  const [summary, dailySales, topProducts, lowStock, segments, history, demand] = await Promise.all([
    postgres.query<Analytics["summary"]>(
      `SELECT COALESCE(sum(total_amount), 0) AS "netSales", count(*)::int AS "transactionCount",
              COALESCE(avg(total_amount), 0) AS "averageSale",
              (SELECT count(*)::int FROM vw_low_stock_products WHERE store_id = $1) AS "lowStockCount",
              (SELECT count(*)::int FROM customers) AS "customerCount"
       FROM orders WHERE store_id = $1`, [storeId]
    ),
    postgres.query<Analytics["dailySales"][number]>(
      `SELECT days.day::text, COALESCE(sum(o.total_amount), 0) AS revenue, count(o.order_id)::int AS transactions
       FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS days(day)
       LEFT JOIN orders o ON o.store_id = $1 AND o.created_at::date = days.day::date
       GROUP BY days.day ORDER BY days.day`, [storeId]
    ),
    postgres.query<Analytics["topProducts"][number]>(
      `SELECT name, units_sold::int AS "unitsSold", revenue FROM vw_top_selling_products
       WHERE store_id = $1 ORDER BY units_sold DESC, name LIMIT 5`, [storeId]
    ),
    postgres.query<Analytics["lowStock"][number]>(
      `SELECT name, quantity, reorder_threshold AS "reorderThreshold", suggested_reorder_qty AS "suggestedReorderQty"
       FROM vw_low_stock_products WHERE store_id = $1 ORDER BY quantity, name LIMIT 10`, [storeId]
    ),
    postgres.query<Analytics["segments"][number]>(
      `SELECT segment::text, count(*)::int AS "customerCount" FROM customers GROUP BY segment ORDER BY segment`
    ),
    postgres.query<SalesDay>(
      `WITH bounds AS (SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date AS today)
       SELECT d.day::date::text AS day, COALESCE(sum(o.total_amount), 0) AS revenue, count(o.order_id)::int AS transactions
       FROM bounds CROSS JOIN LATERAL generate_series((today - 14)::timestamp, (today - 1)::timestamp, interval '1 day') d(day)
       LEFT JOIN orders o ON o.store_id = $1 AND o.created_at >= (d.day AT TIME ZONE 'Asia/Kolkata')
         AND o.created_at < ((d.day + interval '1 day') AT TIME ZONE 'Asia/Kolkata')
       GROUP BY d.day ORDER BY d.day`, [storeId]
    ),
    postgres.query<StockDemand>(
      `WITH bounds AS (SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date AS today),
       sold AS (
         SELECT oi.product_id, sum(oi.quantity)::int AS units
         FROM order_items oi JOIN orders o USING(order_id) CROSS JOIN bounds
         WHERE o.store_id = $1 AND o.created_at >= ((today - 14)::timestamp AT TIME ZONE 'Asia/Kolkata')
           AND o.created_at < (today::timestamp AT TIME ZONE 'Asia/Kolkata') GROUP BY oi.product_id
       ), pending AS (
         SELECT poi.product_id, sum(poi.ordered_qty - poi.received_qty)::int AS units
         FROM purchase_order_items poi JOIN purchase_orders po USING(po_id)
         WHERE po.store_id = $1 AND po.status IN ('draft','sent','partially_received') GROUP BY poi.product_id
       )
       SELECT p.product_id::int AS "productId", p.name, i.quantity, i.reorder_threshold AS "reorderThreshold",
              COALESCE(sold.units, 0) AS "unitsSold", COALESCE(pending.units, 0) AS "pendingQty"
       FROM inventory i JOIN products p USING(product_id)
       LEFT JOIN sold USING(product_id) LEFT JOIN pending USING(product_id)
       WHERE i.store_id = $1 AND p.active = TRUE`, [storeId]
    )
  ]);
  return {
    summary: summary.rows[0], dailySales: dailySales.rows, topProducts: topProducts.rows, lowStock: lowStock.rows, segments: segments.rows,
    forecast: forecastSales(history.rows),
    recommendations: demand.rows.map(stockAdvice).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)).slice(0, 10)
  };
}
