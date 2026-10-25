import { postgres } from "@/lib/db/postgres";

export type Analytics = {
  summary: { netSales: string; transactionCount: number; averageSale: string; lowStockCount: number; customerCount: number };
  dailySales: { day: string; revenue: string; transactions: number }[];
  topProducts: { name: string; unitsSold: number; revenue: string }[];
  lowStock: { name: string; quantity: number; reorderThreshold: number; suggestedReorderQty: number }[];
  segments: { segment: string; customerCount: number }[];
};

export async function getAnalytics(storeId: number): Promise<Analytics> {
  const [summary, dailySales, topProducts, lowStock, segments] = await Promise.all([
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
    )
  ]);
  return { summary: summary.rows[0], dailySales: dailySales.rows, topProducts: topProducts.rows, lowStock: lowStock.rows, segments: segments.rows };
}
