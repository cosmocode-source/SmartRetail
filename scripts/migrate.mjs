import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const includeSeed = process.argv.includes("--seed");
const directory = path.join(process.cwd(), "database", "postgresql");
const files = (await readdir(directory))
  .filter((name) => /^\d+_.*\.sql$/.test(name) && (includeSeed || name !== "004_seed.sql"))
  .sort();
const client = new pg.Client({ connectionString });

await client.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  for (const filename of files) {
    const sql = await readFile(path.join(directory, filename), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("SELECT checksum FROM schema_migrations WHERE filename = $1", [filename]);
    if (existing.rows[0]) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${filename}`);
      console.log(`skip ${filename}`);
      continue;
    }
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations(filename, checksum) VALUES ($1, $2)", [filename, checksum]);
    console.log(`apply ${filename}`);
  }
} finally {
  await client.end();
}
