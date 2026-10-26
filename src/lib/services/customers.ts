import { postgres } from "@/lib/db/postgres";
import type { z } from "zod";
import type { customerSchema } from "@/lib/validation/customers";

export type Customer = {
  customerId: number;
  name: string;
  phone: string;
  email: string | null;
  loyaltyPoints: number;
  segment: "new" | "regular" | "at_risk" | "vip";
  orderCount: number;
  lifetimeValue: string;
  lastPurchaseAt: string | null;
};

export async function listCustomers(query = "") {
  const result = await postgres.query<Customer>(
    `SELECT c.customer_id::int AS "customerId", c.name, c.phone, c.email,
            c.loyalty_points AS "loyaltyPoints", c.segment,
            count(o.order_id)::int AS "orderCount", COALESCE(sum(o.total_amount), 0) AS "lifetimeValue",
            max(o.created_at)::text AS "lastPurchaseAt"
     FROM customers c LEFT JOIN orders o USING(customer_id)
     WHERE $1 = '' OR c.name ILIKE '%' || $1 || '%' OR c.phone ILIKE '%' || $1 || '%'
     GROUP BY c.customer_id ORDER BY c.name`,
    [query.trim()]
  );
  return result.rows;
}

export async function createCustomer(input: z.infer<typeof customerSchema>) {
  const result = await postgres.query<{ customerId: number }>(
    `INSERT INTO customers(name, phone, email) VALUES ($1, $2, NULLIF($3, '')) RETURNING customer_id::int AS "customerId"`,
    [input.name, input.phone, input.email]
  );
  return result.rows[0];
}
