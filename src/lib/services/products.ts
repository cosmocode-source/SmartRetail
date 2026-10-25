import { postgres, withTransaction } from "@/lib/db/postgres";
import type { z } from "zod";
import type { productSchema } from "@/lib/validation/products";

export type Product = {
  productId: number;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  active: boolean;
  categoryId: number;
  categoryName: string;
};

export type Category = { categoryId: number; name: string };
export type ProductInput = z.infer<typeof productSchema>;

export async function listProducts(query = "") {
  const result = await postgres.query<Product>(
    `SELECT p.product_id::int AS "productId", p.sku, p.name, p.description, p.price, p.active,
            c.category_id::int AS "categoryId", c.name AS "categoryName"
     FROM products p JOIN categories c USING(category_id)
     WHERE $1 = '' OR p.name ILIKE '%' || $1 || '%' OR p.sku ILIKE '%' || $1 || '%'
     ORDER BY p.active DESC, p.name`,
    [query.trim()]
  );
  return result.rows;
}

export async function listCategories() {
  const result = await postgres.query<Category>(
    `SELECT category_id::int AS "categoryId", name FROM categories WHERE active = TRUE ORDER BY name`
  );
  return result.rows;
}

export async function createProduct(input: ProductInput) {
  return withTransaction(async (client) => {
    const result = await client.query<{ productId: number }>(
      `INSERT INTO products(category_id, sku, name, description, price)
       VALUES ($1, $2, $3, NULLIF($4, ''), $5)
       RETURNING product_id::int AS "productId"`,
      [input.categoryId, input.sku, input.name, input.description, input.price]
    );
    await client.query(
      `INSERT INTO inventory(product_id, store_id, quantity, reorder_threshold)
       SELECT $1, store_id, 0, 5 FROM stores WHERE active = TRUE`,
      [result.rows[0].productId]
    );
    return result.rows[0];
  });
}

export async function setProductActive(productId: number, active: boolean) {
  const result = await postgres.query(
    `UPDATE products SET active = $2 WHERE product_id = $1`,
    [productId, active]
  );
  return result.rowCount === 1;
}
