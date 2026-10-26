import { Pool, type PoolClient } from "pg";
import { getEnv } from "@/lib/env";

export const postgres = new Pool({ connectionString: getEnv().DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await postgres.connect();
  try { await client.query("BEGIN"); const result = await work(client); await client.query("COMMIT"); return result; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
