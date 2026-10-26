import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  MONGODB_DB: z.string().min(1).default("smartretail"),
  AUTH_SECRET: z.string().min(32),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(480)
});

let cached: z.infer<typeof envSchema> | undefined;

export function getEnv() {
  cached ??= envSchema.parse(process.env);
  return cached;
}
