import bcrypt from "bcryptjs";
import { postgres } from "@/lib/db/postgres";
import type { SessionUser } from "@/lib/auth/authorize";

type UserRow = SessionUser & { password_hash: string };

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const result = await postgres.query<UserRow>(
    `SELECT user_id::int AS "userId", role, store_id::int AS "storeId", password_hash
     FROM users WHERE lower(email) = $1 AND active = TRUE`,
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  return { userId: user.userId, role: user.role, storeId: user.storeId };
}
