export type Role = "admin" | "staff";
export type SessionUser = { userId: number; role: Role; storeId: number | null };
export function requireRole(user: SessionUser | null, allowed: Role[]) {
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!allowed.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
export function requireStoreAccess(user: SessionUser, requestedStoreId: number) {
  if (user.role === "staff" && user.storeId !== requestedStoreId) throw new Error("FORBIDDEN_STORE");
}
