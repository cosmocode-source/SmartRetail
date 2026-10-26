import bcrypt from "bcryptjs";
import { postgres } from "@/lib/db/postgres";
import type { z } from "zod";
import type { settingChangeSchema } from "@/lib/validation/settings";

export type Store = { storeId: number; name: string; location: string };
export type StaffUser = { userId: number; name: string; email: string; role: string; storeName: string | null; active: boolean };

export async function getSettings() {
  const [stores, users, categories] = await Promise.all([
    postgres.query<Store>(`SELECT store_id::int AS "storeId", name, location FROM stores WHERE active = TRUE ORDER BY name`),
    postgres.query<StaffUser>(`SELECT u.user_id::int AS "userId", u.name, u.email, u.role, s.name AS "storeName", u.active FROM users u LEFT JOIN stores s USING(store_id) ORDER BY u.name`),
    postgres.query<{ categoryId: number; name: string }>(`SELECT category_id::int AS "categoryId", name FROM categories WHERE active = TRUE ORDER BY name`)
  ]);
  return { stores: stores.rows, users: users.rows, categories: categories.rows };
}

export async function applySetting(input: z.infer<typeof settingChangeSchema>) {
  if (input.type === "store") {
    const result = await postgres.query<{ id: number }>(`INSERT INTO stores(name, location) VALUES ($1, $2) RETURNING store_id::int AS id`, [input.name, input.location]);
    return { entityType: "store", id: result.rows[0].id };
  }
  if (input.type === "category") {
    const result = await postgres.query<{ id: number }>(`INSERT INTO categories(name) VALUES ($1) RETURNING category_id::int AS id`, [input.name]);
    return { entityType: "category", id: result.rows[0].id };
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await postgres.query<{ id: number }>(
    `INSERT INTO users(name, email, password_hash, role, store_id) VALUES ($1, $2, $3, 'staff', $4) RETURNING user_id::int AS id`,
    [input.name, input.email, passwordHash, input.storeId]
  );
  return { entityType: "user", id: result.rows[0].id };
}
